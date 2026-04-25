---
description: Kairu's ladder check — advance a phase to ✅ only if testable outcome passes
argument-hint: [phase-number]
---

Read `maji-core/commands/gate.md` and follow its specification exactly.

Key reminders:

- **Previous phases must all be ✅** before gating a new phase. No exceptions.
- **Verifier must NOT be the primary lead** of the phase being gated.
- **Require concrete evidence** — screenshot / terminal output / video URL. No "I'm sure it works."
- On confirm, update `DEVELOPMENT-PLAN.md` Phase Status row + append to `team-ledger.md` + update personal memory `phasesCompleted`.
- **Never run `git commit`** — prompt user to commit manually.

Begin now. If the user passed a phase number as argument, default to that phase; otherwise detect the current 🟡 phase and ask to confirm.
