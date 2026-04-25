#!/usr/bin/env python3
"""
Scrape NADI centre listings per state from nadi.my and emit a clean JSON
dataset. Used by DuitLater backend to populate the kampung selector + map
pool formation to a NADI centre.

Source: https://www.nadi.my/wp-json/wp/v2/pages?slug=<state>
        (WordPress REST API · public · no auth required)

Output shape:
[
  {
    "id": "selangor-felda-gedangsa",
    "name": "FELDA GEDANGSA",
    "state": "Selangor",
    "district_hint": "kuala kubu baharu",
    "raw_position": 28
  },
  ...
]

Run:
  ./tools/scrape-nadi.py > packages/backend/src/data/nadi-centres.json
  ./tools/scrape-nadi.py --state Selangor --pretty
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

BASE = "https://www.nadi.my/wp-json/wp/v2"
USER_AGENT = "Mozilla/5.0 (DuitLater scraper · contact: ijam@duitlater)"

# Lowercase-ish words that look like section headers / sub-districts
# (heuristic — they sit between the centre groupings on the source page)
SUB_DISTRICT_TOKENS = {
    "bukit lanjan", "bukit antarabangsa", "dusun tua", "semenyih",
    "batang kali", "sungai panjang", "hulu bernam", "kuala kubu baharu",
    "sentosa", "morib", "sijangkang", "dengkil", "tanjong sepat", "ijok",
    "jeram", "paya jaras", "sungai burong", "sabak", "sungai air tawar",
    "sekinchan", "sungai pelek", "petaling jaya",
}

KNOWN_STATE_SLUGS = {
    "Selangor": "selangor",
    "Johor": "johor",
    "Kedah": "kedah",
    "Kelantan": "kelantan",
    "Melaka": "melaka",
    "Negeri Sembilan": "negeri-sembilan",
    "Pahang": "pahang",
    "Perak": "perak",
    "Perlis": "perlis",
    "Pulau Pinang": "pulau-pinang",
    "Sabah": "sabah",
    "Sarawak": "sarawak",
    "Terengganu": "terengganu",
    "Wilayah Persekutuan": "wilayah-persekutuan",
}


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read().decode("utf-8")


def fetch_state_page(state_slug: str) -> dict:
    url = f"{BASE}/pages?slug={urllib.parse.quote(state_slug)}"
    raw = fetch(url)
    arr = json.loads(raw)
    if not arr:
        raise SystemExit(f"State page not found: {state_slug}")
    return arr[0]


def slugify(text: str) -> str:
    s = text.lower().strip()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s_-]+", "-", s)
    return s.strip("-")


def extract_lines(html_content: str) -> list[str]:
    """Strip tags, return cleaned, non-empty lines."""
    # Remove scripts/styles
    h = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", html_content, flags=re.DOTALL | re.IGNORECASE)
    # Replace block-level tags with newlines
    h = re.sub(r"<(/?(?:br|p|div|li|td|tr|h[1-6]))[^>]*>", "\n", h, flags=re.IGNORECASE)
    # Strip remaining tags
    h = re.sub(r"<[^>]+>", "", h)
    h = html.unescape(h)
    lines = [line.strip() for line in h.splitlines()]
    return [line for line in lines if line]


def is_section_header(line: str) -> bool:
    """A line that looks like a sub-district / section header rather than a centre name."""
    lc = line.lower().strip()
    if lc in SUB_DISTRICT_TOKENS:
        return True
    # Title case "Petaling Jaya" — has both upper and lower
    if line[0].isupper() and any(c.islower() for c in line) and len(line.split()) <= 3:
        # Mostly title-case, short = likely a sub-area
        # But preserve "Kampung Sungai Kayu Ara" style centre names — they have 4+ words
        words = line.split()
        if len(words) <= 3:
            return True
    return False


def is_centre_name(line: str) -> bool:
    """Heuristic — true if line looks like an actual NADI centre."""
    if len(line) < 4 or len(line) > 80:
        return False
    # Skip nav/header artifacts
    skip_keywords = ["NADI", "Lokasi", "Info", "Tentang", "Kembali", "@", "COPYRIGHT", "Skip"]
    for kw in skip_keywords:
        if kw in line and "FELDA" not in line.upper() and "KAMPUNG" not in line.upper():
            return False
    return True


def parse_state(state_name: str, state_slug: str) -> list[dict]:
    page = fetch_state_page(state_slug)
    content = page.get("content", {}).get("rendered", "")
    lines = extract_lines(content)

    centres = []
    current_district = None
    raw_pos = 0

    for line in lines:
        if not is_centre_name(line):
            continue

        # Detect sub-district / sub-area marker
        if is_section_header(line):
            current_district = line.lower().strip()
            continue

        # Real centre name
        raw_pos += 1
        centres.append({
            "id": f"{state_slug}-{slugify(line)}",
            "name": line,
            "state": state_name,
            "district_hint": current_district,
            "raw_position": raw_pos,
        })

    # Dedupe by id (page sometimes lists same name twice in different sections)
    seen = set()
    unique = []
    for c in centres:
        if c["id"] not in seen:
            seen.add(c["id"])
            unique.append(c)
    return unique


def main():
    parser = argparse.ArgumentParser(description="Scrape NADI centre listings")
    parser.add_argument("--state", help="Single state name to scrape (default: all)")
    parser.add_argument("--pretty", action="store_true", help="Pretty-print JSON output")
    args = parser.parse_args()

    if args.state:
        if args.state not in KNOWN_STATE_SLUGS:
            print(f"Unknown state: {args.state}. Try: {', '.join(KNOWN_STATE_SLUGS)}", file=sys.stderr)
            return 1
        states_to_scrape = {args.state: KNOWN_STATE_SLUGS[args.state]}
    else:
        states_to_scrape = KNOWN_STATE_SLUGS

    all_centres = []
    for state_name, state_slug in states_to_scrape.items():
        try:
            centres = parse_state(state_name, state_slug)
            print(f"  {state_name}: {len(centres)} centres", file=sys.stderr)
            all_centres.extend(centres)
        except (urllib.error.URLError, json.JSONDecodeError) as e:
            print(f"  {state_name}: SKIPPED ({e})", file=sys.stderr)

    print(f"Total centres: {len(all_centres)}", file=sys.stderr)
    indent = 2 if args.pretty else None
    print(json.dumps(all_centres, indent=indent, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
