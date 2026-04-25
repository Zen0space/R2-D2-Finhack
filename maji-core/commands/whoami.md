# /maji-whoami

**Quick identity check. Current phase task. Outstanding blockers.**

Lighter than `/maji-onboard` — no full role card, no first-time setup. Use when returning for a short session.

---

## When invoked

### Step 0 — Pre-flight

Run the pre-flight check per [`protocols/preflight.md`](../protocols/preflight.md). Refuse with the standard message on failure.

### Step 1 — Detect which member

Check if the user has identified themselves in this session already (in message history, or via prior `/maji-onboard`).

If yes → proceed with that identity.
If no → ask: *"Kau siapa? (moon / akmal / kairu / matnep / ijam)"*.

### Step 2 — Verify whitelist

Same rule as `/maji-onboard`. If name not in whitelist → refuse and end.

### Step 3 — Read personal memory

Read `maji-core/memory/members/<name>.json`.

If file does not exist → tell them to run `/maji-onboard` first:

> Kau belum onboard. Jalankan `/maji-onboard` dulu untuk set up personal memory.

### Step 4 — Detect current phase

Read `docs/process/DEVELOPMENT-PLAN.md` Phase Status table. Find the current phase (same rule as onboard).

### Step 5 — Print the status block

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{NAME} — {ARCHETYPE}
Session #{sessionsCount} · last: {lastSession}
Current phase: {PHASE_NUMBER} {STATUS_SYMBOL} {PHASE_NAME}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tugas kau fasa ni:
{LOOKUP_FROM_TEAM_MD_PHASE_OWNERSHIP}

Testable outcome:
{FROM_DEVELOPMENT_PLAN_PHASE_DESCRIPTION}
```

### Step 6 — Active pair reminder

If `activePair` is set in personal memory:

```
🤝 Active pair: kau pair dengan {partner.name} on {task}
   Started: {activePair.startedAt}
   Update pair status: /maji-pair
```

### Step 7 — Blocker surface

Read `maji-core/memory/team-ledger.md`. Find the most recent `BLOCKER` entry that mentions this member's name and is not followed by a clearing entry.

If found:

```
⚠️  Outstanding blocker: {blocker_summary}
   Logged: {timestamp}
   Clear by editing team-ledger.md with a resolution entry.
```

### Step 8 — Update personal memory

Increment `sessionsCount`. Update `lastSession` to now.

### Step 9 — Menu handoff

```
Next moves:
  /maji-phase    → team-wide phase view
  /maji-pair     → start/update a pairing
  /maji-gate     → verify phase advancement
  /maji-handoff  → end session save
```

---

## Register rules

Same as onboard: BM-first, EN for technical, jimat penuh by default.

No role card. No tool list. No skill list. That's what `/maji-onboard` is for.
