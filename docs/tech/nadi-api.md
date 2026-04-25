# NADI Centre API

**Endpoint base:** `/api/v1/nadi`
**Source:** Scraped from <https://www.nadi.my> via [`tools/scrape-nadi.py`](../../tools/scrape-nadi.py)
**Data file:** [`packages/backend/src/data/nadi-centres-selangor.json`](../../packages/backend/src/data/nadi-centres-selangor.json)
**Loaded:** Once at backend boot (no DB roundtrip per request — reference data)

---

## Why this API exists

Pool formation di DuitLater memerlukan ahli sebut NADI centre mereka. Tanpa list NADI sebenar, kena hardcode atau buat user free-text input — both bad UX. API ni provide:

- **Kampung selector** untuk pool creation form (frontend dropdown)
- **Validation** — pool memberships terikat ke NADI centre yang real
- **Pilot site verification** — NADI Felda Gedangsa exists in dataset (`selangor-felda-gedangsa`)

---

## Dataset overview

| State | Centres scraped |
|---|---|
| **Selangor** | 50 |

**Test bed verification:**
- ✅ `FELDA GEDANGSA` (id `selangor-felda-gedangsa` · district hint `hulu bernam`)
- ✅ `FELDA SUNGAI TENGI`, `FELDA SOEHARTO`, `FELDA BUKIT CHERAKAH` (other Felda centres)
- ✅ `KAMPUNG ORANG ASLI SUNGAI JUDAH` (OA-relevant)
- ✅ `KAMPUNG SUNGAI HAJI DORANI`, `KAMPUNG TEBUK HAJI YUSUF` (Sabak Bernam-area)

District hints captured: `bukit lanjan` · `bukit antarabangsa` · `dusun tua` · `semenyih` · `batang kali` · `sungai panjang` · `hulu bernam` · `kuala kubu baharu` · `morib` · `sijangkang` · `dengkil` · `tanjong sepat` · `ijok` · `jeram` · `paya jaras` · `sungai burong` · `sabak` · `sungai air tawar` · `sekinchan` · `sungai pelek` · `petaling jaya`.

> The official site claims 84 NADI centres in Selangor; scraper currently captures 50 (the rest may be loaded via JavaScript / AJAX after page render). Re-run `tools/scrape-nadi.py --state Selangor` periodically to catch updates.

---

## Endpoints

### `GET /api/v1/nadi/centres`

List NADI centres, optionally filtered + paginated.

**Query parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `state` | string | — | Filter by state (case-insensitive) |
| `district` | string | — | Filter by district hint (substring match · case-insensitive) |
| `q` | string | — | Search by centre name or id (substring match · case-insensitive) |
| `limit` | int | 50 | Max results (1–200) |
| `offset` | int | 0 | Skip first N results |

**Example request:**

```bash
curl 'http://localhost:4000/api/v1/nadi/centres?state=Selangor&q=felda&limit=10'
```

**Example response:**

```json
{
  "success": true,
  "data": {
    "centres": [
      {
        "id": "selangor-felda-sungai-tengi",
        "name": "FELDA SUNGAI TENGI",
        "state": "Selangor",
        "district_hint": "hulu bernam",
        "raw_position": 22
      },
      {
        "id": "selangor-felda-gedangsa",
        "name": "FELDA GEDANGSA",
        "state": "Selangor",
        "district_hint": "hulu bernam",
        "raw_position": 23
      },
      {
        "id": "selangor-felda-soeharto",
        "name": "FELDA SOEHARTO",
        "state": "Selangor",
        "district_hint": "hulu bernam",
        "raw_position": 24
      },
      {
        "id": "selangor-felda-bukit-cherakah",
        "name": "FELDA BUKIT CHERAKAH",
        "state": "Selangor",
        "district_hint": "jeram",
        "raw_position": 36
      }
    ],
    "meta": {
      "total": 4,
      "limit": 10,
      "offset": 0,
      "returned": 4
    }
  }
}
```

### `GET /api/v1/nadi/centres/:id`

Get a single centre by id.

**Example:**

```bash
curl 'http://localhost:4000/api/v1/nadi/centres/selangor-felda-gedangsa'
```

**Example response:**

```json
{
  "success": true,
  "data": {
    "id": "selangor-felda-gedangsa",
    "name": "FELDA GEDANGSA",
    "state": "Selangor",
    "district_hint": "hulu bernam",
    "raw_position": 23
  }
}
```

**404 response (centre not found):**

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "NADI centre not found"
  }
}
```

### `GET /api/v1/nadi/states`

List states present in dataset with centre counts.

**Example response:**

```json
{
  "success": true,
  "data": {
    "states": [
      { "state": "Selangor", "count": 50 }
    ]
  }
}
```

### `GET /api/v1/nadi/districts?state=Selangor`

List district hints for a state, sorted by centre count (most → fewest).

**Required query param:** `state`

**Example response:**

```json
{
  "success": true,
  "data": {
    "state": "Selangor",
    "districts": [
      { "district_hint": "hulu bernam", "count": 8 },
      { "district_hint": "petaling jaya", "count": 6 },
      { "district_hint": "sekinchan", "count": 3 }
    ]
  }
}
```

---

## Re-scraping

To refresh the dataset after NADI updates their site:

```bash
# From repo root
python3 tools/scrape-nadi.py --state Selangor --pretty \
  > packages/backend/src/data/nadi-centres-selangor.json

# Verify FELDA GEDANGSA still in dataset
python3 -c "import json; d=json.load(open('packages/backend/src/data/nadi-centres-selangor.json')); print('FELDA GEDANGSA:', any('GEDANGSA' in c['name'] for c in d))"

# Restart backend dev server (or trigger HMR if running)
pnpm --filter backend dev
```

---

## Frontend integration sample

```typescript
// packages/frontend — fetch on pool creation form mount

const fetchNadiCentres = async (search?: string) => {
  const params = new URLSearchParams({ state: "Selangor" });
  if (search) params.set("q", search);

  const res = await fetch(`${API_BASE}/api/v1/nadi/centres?${params}`);
  const data = await res.json();
  return data.data.centres as NadiCentre[];
};

// Use as combobox autocomplete during pool creation
const { data: centres } = useQuery({
  queryKey: ["nadi-centres", searchTerm],
  queryFn: () => fetchNadiCentres(searchTerm),
  enabled: searchTerm.length >= 2,
});
```

---

## Future enhancements

- **Coordinates** — Add lat/lng per centre for map display (requires manual lookup or geocoding API)
- **Contact details** — Phone, email per centre (currently aggregate `info@nadi.my` only)
- **Service catalogue** — Per-centre services offered (NADIpreneur · EmpowHER · NOW mobile · light banking)
- **Operating hours** — Standard hours per centre type
- **Headless-browser scrape** — Capture remaining ~34 centres that require JavaScript-rendered DOM
- **Multi-state coverage** — Run scraper for all 14 states (currently Selangor-only · script supports `--state` arg for any of: Johor · Kedah · Kelantan · Melaka · Negeri Sembilan · Pahang · Perak · Perlis · Pulau Pinang · Sabah · Sarawak · Terengganu · Wilayah Persekutuan)
- **Sync to Postgres** — Move from JSON-on-disk to a `nadi_centres` table seeded via Prisma migration · enables joins with `pools.kampung_id`

---

## Source data integrity

- **Source URL:** <https://www.nadi.my/wp-json/wp/v2/pages?slug=selangor>
- **Last scraped:** 2026-04-25
- **Source license:** Public NADI/MCMC Wikipedia-style listing (no terms-of-service prohibition observed)
- **User-Agent:** `Mozilla/5.0 (DuitLater scraper · contact: ijam@duitlater)`
- **Rate limit:** None applied (1 request per state · run on-demand only)
