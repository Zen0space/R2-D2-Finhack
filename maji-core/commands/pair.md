# /maji-pair

**Log a pairing collaboration between two team members. Both members see the pairing in their next `/maji-whoami`.**

---

## When invoked

### Step 0 — Pre-flight

Run the pre-flight check per [`protocols/preflight.md`](../protocols/preflight.md). Refuse with the standard message on failure.

### Step 1 — Detect invoker

Check session context for who is invoking. If unknown:

> Kau siapa? (mung / akmal / kairu / matnep / ijam)

Whitelist check — if not in the 5 → refuse and end.

### Step 2 — Detect intent

Ask the invoker what they want to do:

```
Pair command — pilih satu:
  1. Start pair    → open a new pairing
  2. Update pair   → change status on current pair
  3. End pair      → close the active pair
```

### Step 3a — Start pair flow

```
Pair dengan siapa? (mung / akmal / kairu / matnep / ijam — yang bukan kau)
```

If the named partner is the invoker themselves → *"Kau tak boleh pair dengan diri sendiri."* Refuse.

If the named partner is not in the whitelist → refuse.

```
Apa task kau pair on?
(Short line — example: "Phase 1 auth UI + schema handshake")
```

Then confirm:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAIR · {INVOKER} + {PARTNER}
Task: {TASK_LINE}
Started: {TIMESTAMP}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Confirm? (yes / no)
```

### Step 3a — continued — Write the pair record

Schema is locked in [`protocols/schema.md`](../protocols/schema.md). All `partner` fields use **codename** (lowercase). Both files must be cross-consistent (same `task`, same `startedAt`).

On confirm:

1. **Update invoker's personal memory** (`memory/members/<invoker_codename>.json`):
   ```json
   "activePair": {
     "partner": "<partner_codename>",
     "task": "<task_line>",
     "startedAt": "<ISO-8601>"
   }
   ```

2. **Update partner's personal memory** (`memory/members/<partner_codename>.json`) — same shape with `partner` flipped to the invoker's codename.

   If the partner's JSON doesn't exist yet (they haven't run `/maji-onboard`), create a stub matching schema.md → Stub variant:
   ```json
   {
     "name": "<Capitalized Partner>",
     "codename": "<partner_codename>",
     "firstOnboarded": null,
     "lastSession": null,
     "sessionsCount": 0,
     "currentPhase": null,
     "phasesCompleted": [],
     "activePair": {
       "partner": "<invoker_codename>",
       "task": "<task_line>",
       "startedAt": "<ISO-8601>"
     },
     "lastBlocker": null,
     "lastHandoff": null,
     "personalNotes": [
       {
         "at": "<ISO-8601>",
         "note": "Stub created by /maji-pair before this member's first onboard."
       }
     ]
   }
   ```

3. **Append to `team-ledger.md`**:
   ```
   - **{TIMESTAMP} · PAIR · {INVOKER} + {PARTNER}** · {TASK_LINE}
   ```

4. **Confirm to user**:
   ```
   🤝  Pair logged.
   {PARTNER} akan nampak pair ni dalam /maji-whoami diorang selepas pull.

   Reminder: commit + push supaya {PARTNER} dapat update:
     git add maji-core/memory/members/{INVOKER}.json \
             maji-core/memory/members/{PARTNER}.json \
             maji-core/memory/team-ledger.md
     git commit -m "pair: {INVOKER}+{PARTNER} on {TASK_SLUG}"
     git push
   ```

Both member JSONs + team-ledger are committed together — pair state is cross-file consistent.

### Step 3b — Update pair flow

Read invoker's `activePair` from personal memory.

If no active pair:

> Kau takde active pair sekarang. Jalankan dengan pilihan "Start pair" kalau nak buka baharu.

If active pair exists:

```
Active pair: {PARTNER} on {TASK_LINE}
Started: {startedAt}

Update apa?
  1. Task line   → change what the pair is working on
  2. Note        → add a quick note to the pair
  3. Status      → add a progress check (blocked / unblocked / near-done)
```

Apply the update to both personal memory files + append a log line to `team-ledger.md`:

```
- **{TIMESTAMP} · PAIR UPDATE · {INVOKER} + {PARTNER}** · {UPDATE_SUMMARY}
```

### Step 3c — End pair flow

Read invoker's `activePair`. If none → same refuse as 3b.

If active pair:

```
End pair: {PARTNER} on {TASK_LINE}?
Summary of what was finished:
```

Wait for the summary line. Then:

1. Set `activePair` to `null` in both invoker + partner personal memory.
2. Append to `team-ledger.md`:
   ```
   - **{TIMESTAMP} · PAIR END · {INVOKER} + {PARTNER}** · Closed. Summary: {SUMMARY_LINE}
   ```

Confirm:
```
🤝  Pair closed. Ledger updated.
Thanks — commit when ready.
```

---

## Guardrails

- **Only pairs of two.** No three-way pairs via this command (use `/maji-handoff` + stand-up if you need broader sync).
- **Invoker must be in whitelist.** Partner must be in whitelist. No exceptions.
- **Personal memory files are committed.** Prompt user to stage BOTH member JSONs + team-ledger together so the pair state propagates consistently on next pull.
- **Commit is always manual.** This command never runs git commands.
- **Task line max ~80 chars** — keep it one line.
