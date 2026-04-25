# Personal Memory Schema

**File:** `maji-core/memory/members/<codename>.json`
**Storage:** committed to git (one file per team member · team sees on pull)
**Filename:** lowercase codename + `.json` (e.g., `moon.json`, `matnep.json`)

This document is the single source of truth for the JSON shape. All slash commands that read or write a member's memory must follow this schema exactly.

---

## Top-level shape

```ts
type MemberMemory = {
  name: string;                  // Capitalized display name — "Moon", "MatNep"
  codename: string;              // Lowercase identifier — must match filename
  firstOnboarded: string | null; // ISO-8601 · null if stub created by /maji-pair before onboard
  lastSession: string | null;    // ISO-8601 · null if not yet onboarded
  sessionsCount: number;         // 0 for stub · ≥1 for onboarded
  currentPhase: number | null;   // 0..6 (BMAD phase) · null for stub
  phasesCompleted: number[];     // ints, append-only, no duplicates — e.g. [0, 1]
  activePair: PairRecord | null; // current pairing · null if none
  lastBlocker: string | null;    // most recent unresolved blocker text · null after /maji-unblock
  lastHandoff: HandoffRecord | null; // last /maji-handoff payload · null if never handed off
  personalNotes: Note[];         // member's own notes, append-only
};

type PairRecord = {
  partner: string;     // codename (lowercase) of the other member
  task: string;        // one-line description, ≤80 chars
  startedAt: string;   // ISO-8601
};

type HandoffRecord = {
  at: string;                       // ISO-8601 of the handoff
  finished: string;                 // 1-2 sentence summary of what shipped this session
  nextAction: string;               // 1 sentence on what to do next
  blockerAtHandoff: string | null;  // null if no blocker at handoff time
};

type Note = {
  at: string;       // ISO-8601 when note was added
  note: string;     // free-form text, member's own
};
```

---

## Example

```json
{
  "name": "Moon",
  "codename": "moon",
  "firstOnboarded": "2026-04-25T09:10:00+08:00",
  "lastSession": "2026-04-25T14:32:00+08:00",
  "sessionsCount": 4,
  "currentPhase": 1,
  "phasesCompleted": [0],
  "activePair": {
    "partner": "akmal",
    "task": "Phase 1 auth schema + form handshake",
    "startedAt": "2026-04-25T13:55:00+08:00"
  },
  "lastBlocker": null,
  "lastHandoff": {
    "at": "2026-04-25T14:32:00+08:00",
    "finished": "Phase 0 verified, Postgres schema sketched",
    "nextAction": "Wire Better Auth + first migration after lunch",
    "blockerAtHandoff": null
  },
  "personalNotes": [
    {
      "at": "2026-04-25T09:30:00+08:00",
      "note": "Postgres 16 confirmed working with Drizzle on Apple Silicon"
    }
  ]
}
```

---

## Stub variant

A stub is a JSON record created by `/maji-pair` when the partner has not yet run `/maji-onboard`. It carries the pair record so the partner sees it on their first onboard.

```json
{
  "name": "Akmal",
  "codename": "akmal",
  "firstOnboarded": null,
  "lastSession": null,
  "sessionsCount": 0,
  "currentPhase": null,
  "phasesCompleted": [],
  "activePair": {
    "partner": "moon",
    "task": "Phase 1 auth schema + form handshake",
    "startedAt": "2026-04-25T13:55:00+08:00"
  },
  "lastBlocker": null,
  "lastHandoff": null,
  "personalNotes": [
    {
      "at": "2026-04-25T13:55:00+08:00",
      "note": "Stub created by /maji-pair before this member's first onboard."
    }
  ]
}
```

A stub is detected by `firstOnboarded === null`. When the member runs `/maji-onboard` for the first time, the onboarding flow MERGES the new fields into the stub instead of overwriting it (see [`commands/onboard.md`](../commands/onboard.md) Step 5 — stub merge logic).

---

## Invariants (must always hold)

1. **Codename matches filename.** `members/moon.json` must have `"codename": "moon"`.
2. **Codename is lowercase ASCII.** `[a-z]+` only. No spaces, no caps.
3. **`name` is `codename` capitalized** with proper diacritic handling (e.g., `matnep` → `MatNep`).
4. **`phasesCompleted` is append-only within a member's life.** Once a phase is added, it stays. No removals. No duplicates (a `Set`-like discipline applied during write).
5. **`activePair.partner` must be a valid codename** in the whitelist (`ijam`, `moon`, `akmal`, `kairu`, `matnep`) — and must NOT equal `codename` (no self-pair).
6. **`activePair` must be cross-consistent.** If `moon.json` has `activePair.partner: "akmal"`, then `akmal.json` must have `activePair.partner: "moon"` (with the same `task` and `startedAt`). Pair updates atomically write both files.
7. **`lastBlocker` is set by `/maji-handoff` if blocker reported, cleared by `/maji-unblock`.** Other commands never directly write `lastBlocker`.
8. **All timestamps are ISO-8601 with timezone offset.** Prefer `+08:00` (Asia/Kuala_Lumpur).
9. **`personalNotes` is append-only.** Never edit or delete a previous note. Member can add a correction note that references the previous one.

---

## Whitelist of valid codenames

```
ijam · moon · akmal · kairu · matnep
```

Five members. No additions. Any command that encounters a JSON file outside this whitelist treats it as garbage and refuses to read it.

---

## Versioning

Schema is `v1`. If a future change requires a breaking format shift, a top-level `schemaVersion: number` field will be added. Until then, absence of `schemaVersion` means `v1`.
