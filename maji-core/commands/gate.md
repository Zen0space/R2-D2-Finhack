# /maji-gate

**Run Kairu's ladder check. Advance a phase to ✅ only if its testable outcome passes.**

---

## When invoked

### Step 0 — Pre-flight

Run the pre-flight check per [`protocols/preflight.md`](../protocols/preflight.md). Refuse with the standard message on failure.

### Step 1 — Ask which phase

> Phase mana kau nak gate? (0, 1, 2, 3, 4, 5, atau 6)

If the user doesn't specify, default to the current 🟡 phase from `DEVELOPMENT-PLAN.md`.

### Step 2 — Verify previous phases are ✅

Read `DEVELOPMENT-PLAN.md` Phase Status table. Check: are all phases with lower numbers than the target phase marked ✅?

If NO → REFUSE:

```
🚫  REFUSE — previous phases not ✅

Can't gate Phase {N} because Phase {M} is still {STATUS}.

Kairu's ladder refuses a rung that tries to bear weight before the previous rung was tested.

Fix: complete Phase {M} first. Run /maji-gate for Phase {M} when its testable outcome passes.
```

### Step 3 — Show the testable outcome

Read the target phase's testable outcome from [protocols/phase-gate.md](../protocols/phase-gate.md) Phase → testable outcome table.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase {N} — {PHASE_NAME}
Testable outcome:
  {EXACT_OUTCOME_TEXT}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 4 — Ask for the verifier

Read `protocols/phase-gate.md` → who verifies table. Get the default verifier for this phase.

```
Default verifier untuk Phase {N}: {VERIFIER_NAME}
(Verifier can be swapped at a stand-up.)

Siapa yang run testable outcome pada machine mereka sendiri?
```

Wait for the user to confirm the verifier's name.

### Step 5 — Check verifier is NOT the primary author/lead

Read `TEAM.md` Phase Ownership table. If the named verifier is also the primary lead for this phase → REFUSE:

```
🚫  REFUSE — verifier same as primary lead

{VERIFIER} is the primary lead for Phase {N}. Kairu's ladder requires someone OTHER than the author to verify.

Fix: ask {SUGGESTED_ALTERNATE} to run the testable outcome instead.
```

### Step 6 — Ask for evidence

```
{VERIFIER} — paste the evidence that the testable outcome passes:

• Screenshot / terminal output / video URL
• Timestamp of the verification run
• Any caveats (e.g., "passed on my machine but Penasihat took 8s — acceptable")

(Kalau takde evidence konkrit, Kairu's ladder refuses.)
```

Wait for the evidence.

### Step 7 — Confirm before advancing

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ready to advance Phase {N} → ✅

Testable outcome: {TESTABLE_OUTCOME}
Verifier: {VERIFIER}
Timestamp: {TIMESTAMP}
Evidence: {EVIDENCE_SUMMARY}

Confirm? (yes / no)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 8 — Advance and log

On confirm:

1. **Update `DEVELOPMENT-PLAN.md`** — change the Phase Status row for Phase {N}:
   - Status: 🟡 → ✅
   - Completed: set to current date
   - Tested by: set to verifier

2. **Append to `team-ledger.md`**:
   ```
   - **{TIMESTAMP} · PHASE ✅ · {VERIFIER}** · Phase {N} ({PHASE_NAME}) verified. Testable outcome passed. Evidence: {EVIDENCE_SUMMARY}.
   ```

3. **Update active members' personal memory** — for each JSON in `memory/members/`, append `{N}` to `phasesCompleted` if not already there.

4. **Confirm to user:**
   ```
   ✅  Phase {N} advanced. {NEXT_PHASE} is now unlocked.

   Reminder: commit the changes.
     git add DEVELOPMENT-PLAN.md maji-core/memory/team-ledger.md
     git commit -m "Phase {N} ✅ — {PHASE_NAME_SLUG}"
   ```

Do NOT run `git add` or `git commit` automatically. Manual commit by user (per decision 5 — writes local + manual commit).

---

## What this command NEVER does

- Never advances a phase without a verifier named.
- Never accepts "I'm sure it works" as evidence.
- Never runs `git commit` — user commits manually.
- Never skips the previous-phases-✅ check, even if the user says "I know Phase X is technically fine, just gate Phase Y."

Kairu's ladder does not bend.
