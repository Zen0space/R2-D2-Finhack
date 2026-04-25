# Pre-flight Protocol

Every slash command in `maji-core/commands/` must run this check **before** any other step. Fail fast with a clear pointer if anything required is missing.

---

## Required artifacts

A maji-core command needs these files present and well-formed:

| Path | What's checked |
|---|---|
| `maji-core/heroes/ijam.md` | exists |
| `maji-core/heroes/mung.md` | exists |
| `maji-core/heroes/akmal.md` | exists |
| `maji-core/heroes/kairu.md` | exists |
| `maji-core/heroes/matnep.md` | exists |
| `maji-core/protocols/schema.md` | exists |
| `DEVELOPMENT-PLAN.md` | exists at repo root · contains a "Phase Status" header |
| `TEAM.md` | exists at repo root · contains a "Phase Ownership" table |
| `maji-core/memory/team-ledger.md` | exists · is a markdown file |
| `maji-core/memory/members/` | folder exists (may be empty) |

---

## Pre-flight refusal message

If any required artifact is missing or malformed:

```
🚫  maji-core pre-flight failed.

Missing or unreadable:
  • {path-1} — {reason-1}
  • {path-2} — {reason-2}

Cause kemungkinan: incomplete clone, file deleted, atau merge conflict tak resolved.

Fix:
  1. Run `git status` — pastikan tiada conflict markers
  2. Run `git pull` kalau dah lama tak sync
  3. Hubungi Ijam kalau confused

Tak akan jalan command sebelum semua artifact ada.
```

End the command. Do NOT continue past pre-flight on failure.

---

## Optional artifacts (warn but proceed)

These are nice-to-have. Pre-flight warns but does NOT block:

| Path | If missing |
|---|---|
| `maji-core/memory/members/<invoker_codename>.json` | Warn: *"You don't have a memory file yet. Run `/maji-onboard` first kalau ni first session kau."* — but only block on commands that REQUIRE it (whoami, gate, pair, handoff, unblock). Onboard is fine without it. |

---

## Implementation note for AI assistants

This protocol is normative. Implement it as the first action in any command. Do not skip pre-flight just because the user seems experienced — the cost of a check is one stat call; the cost of garbage output is debugging time.

If a command is read-only (`/maji-phase`, `/maji-team`, `/maji-ledger`), pre-flight is still required — those commands depend on the same artifacts.
