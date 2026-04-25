# /maji-phase

**Cross-team BMAD phase status. What's shipping, what's stuck, who's where.**

---

## When invoked

### Step 0 — Pre-flight

Run the pre-flight check per [`protocols/preflight.md`](../protocols/preflight.md). Refuse with the standard message on failure. (Read-only commands still need pre-flight — they depend on the same artifacts.)

### Step 1 — Read phase state

Read `DEVELOPMENT-PLAN.md` Phase Status table at repo root. Extract all 7 rows (Phase 0 through Phase 6) with their Status column symbols.

### Step 2 — Read team assignments

Read `TEAM.md` Phase Ownership table. Build a map of `{phase_number → lead, support}`.

### Step 3 — Read personal memory for all onboarded members

For each JSON in `maji-core/memory/members/`, extract:
- `name`
- `currentPhase`
- `activePair`
- `lastSession`

### Step 4 — Read blockers

Read `maji-core/memory/team-ledger.md`. Find any `BLOCKER` entries not followed by a clearing entry.

### Step 5 — Print the full picture

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BMAD Phase Status — Kutu Digitizer · R2-D2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✅  Phase 0 — Stack Activation           (Mung + Akmal · Kairu)
  🟡  Phase 1 — Auth + First Tabung        (Mung + Akmal · Kairu)
  ⏳  Phase 2 — Member Invite + Join       (Akmal + Mung · MatNep)
  ⏳  Phase 3 — Contribution Flow          (Mung · Akmal)
  ⏳  Phase 4 — Rotation Payout            (Mung + Kairu · Ijam)
  ⏳  Phase 5 — AI Penasihat               (Akmal + Mung · Ijam)
  ⏳  Phase 6 — Pitch Polish               (Ijam + MatNep · Kairu)

Current phase: 🟡 Phase 1 (Auth + First Tabung)
Testable outcome: Register → create tabung → reload → tabung still listed
```

### Step 6 — Print per-member state

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Team state (based on last sessions)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Ijam    · session #{N} · last {relativeTime} · Phase {X}
  Mung    · session #{N} · last {relativeTime} · Phase {X} 🤝 pair with Akmal
  Akmal   · session #{N} · last {relativeTime} · Phase {X} 🤝 pair with Mung
  Kairu   · session #{N} · last {relativeTime} · Phase {X}
  MatNep  · session #{N} · last {relativeTime} · Phase {X}
```

If a member has no personal memory file yet, show: `  {Name}    · not onboarded`.

### Step 7 — Outstanding blockers

If any open BLOCKER entries exist in `team-ledger.md`:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  Open blockers
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  [{timestamp}] {member}: {blocker_summary}
  [{timestamp}] {member}: {blocker_summary}
```

If none: `No open blockers.`

### Step 8 — Stand-up prompt

If the current time is near a stand-up slot (within 30 minutes of 09:00, 21:00, or 13:00 on Sunday), add:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📢  Stand-up window open — /maji-handoff kalau kau nak save dulu sebelum huddle.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Register rules

Same as onboard: BM-first, jimat penuh. No decoration. No "here's what's happening" preamble. Just the data.

## What NOT to do

- Do NOT invent phase status. If `DEVELOPMENT-PLAN.md` has not been updated, report what's actually there.
- Do NOT claim a phase is ✅ based on artifacts alone. The table is the source of truth.
- Do NOT write to any file. This command is read-only.
