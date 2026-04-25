# /maji-handoff

**End-of-session save. Writes a handoff note to personal memory + appends a summary line to team-ledger.**

Use before closing the IDE / stepping away for a break / going to sleep. Next-session `/maji-onboard` or `/maji-whoami` picks up from the handoff.

Schema for the personal memory write is locked in [`protocols/schema.md`](../protocols/schema.md) — `lastHandoff` is a `HandoffRecord` object, not a string.

---

## When invoked

### Step 0 — Pre-flight

Run the pre-flight check per [`protocols/preflight.md`](../protocols/preflight.md). Refuse with the standard message on failure.

### Step 1 — Detect invoker

Same as other commands. Whitelist required.

### Step 2 — Gather session summary

Ask the member three short questions:

```
Session handoff — jawab pendek:

1. Apa kau siapkan session ni? (1-2 sentence)

2. Apa next action kau bila return? (1 sentence)

3. Ada blocker tak?
   (kalau ada: describe · kalau takde: "takde")
```

Wait for each answer individually — do not prompt them all in one block. Be patient.

### Step 3 — Preview the handoff note

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HANDOFF — {NAME} · {TIMESTAMP}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Siap:    {q1_answer}
Next:    {q2_answer}
Blocker: {q3_answer_or_none}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Save? (yes / no)
```

### Step 4 — Write personal memory

On confirm, update `maji-core/memory/members/<name>.json`:

- `lastSession` → current ISO-8601 timestamp
- `lastHandoff`:
  ```json
  {
    "at": "<ISO-8601>",
    "finished": "<q1_answer>",
    "nextAction": "<q2_answer>",
    "blockerAtHandoff": "<q3_answer_or_null>"
  }
  ```
- If `q3_answer` is not "takde" / "none" / empty → also set `lastBlocker` to the blocker text.

### Step 5 — Append to team-ledger (conditional)

**Only append to `team-ledger.md` if:**

- The session produced a phase closure (in which case `/maji-gate` was run and already logged), OR
- A blocker is being logged, OR
- The member explicitly says yes when asked: *"Kau nak log ke team-ledger?"*

For a routine handoff (no blocker, no closure, no explicit yes) — skip the ledger append. Personal memory is enough.

If appending, use this shape:

```
- **{TIMESTAMP} · HANDOFF · {NAME}** · Siap: {q1_summary}. Next: {q2_summary}.
```

If a blocker:

```
- **{TIMESTAMP} · BLOCKER · {NAME}** · {blocker_text}
```

### Step 6 — Confirm and remind commit

```
✅  Handoff saved to personal memory.

Commit + push supaya team nampak state kau dalam /maji-phase:
  git add maji-core/memory/members/{name}.json{IF LEDGER UPDATED: \ maji-core/memory/team-ledger.md}
  git commit -m "handoff: {NAME} — {SHORT_SUMMARY}"
  git push

Bila kau return, /maji-whoami akan tunjuk state ni balik.
```

---

## Guardrails

- **Personal memory IS committed.** Always prompt the user to stage their `members/<name>.json` in the commit so the next `git pull` carries the update to the team.
- **Team-ledger commit is always manual.** Never run `git commit`.
- **Patience with answers.** Don't batch the three questions — ask one at a time. Some team members are tired by handoff time.
- **No judgment on the answers.** "Takde siap apa-apa, stuck whole session" is a valid handoff. Log it honestly. The ledger's job is truth, not performance.
