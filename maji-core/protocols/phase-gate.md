# Phase-Gate Protocol — Kairu's Ladder

The phase advancement discipline that prevents the team from building on unstable rungs.

---

## The core rule

> **A rung cannot bear weight until the previous rung was tested.**

Applied to phases:

- A phase cannot transition `⏳ pending → 🟡 in progress` until all previous phases are `✅ done`.
- A phase cannot transition `🟡 in progress → ✅ done` until its **testable outcome** has been verified by someone other than the primary author.

No exceptions for "mostly works" or "I'm sure it's fine." Either the testable outcome passes end-to-end, or the phase is still 🟡.

---

## Running a gate check

`/maji-gate` runs the following sequence:

1. Read `docs/process/DEVELOPMENT-PLAN.md` Phase Status table.
2. Identify the phase requesting advancement.
3. Check: are all previous phases `✅`?
4. Check: does the current phase's testable outcome pass? (Prompts the user to demonstrate.)
5. Check: has someone other than the author verified it?
6. Return **PASS** or **REFUSE**.

If REFUSE, name the specific thing still pending.

---

## Testable outcomes — the exact wording per phase

| Phase | Testable outcome (must pass end-to-end, second person verifies) |
|---|---|
| 0 | `curl http://localhost:4000/health` returns `{"ok":true}` AND DuitLater frontend renders at `http://localhost:3000` |
| 1 | Register via UI · land on `/dashboard` · see "PayLater Saya: RM <amount>" · reload page · still authenticated, still see same allowance |
| 2 | User A creates pool · gets invite code · User B (incognito browser) registers + joins via code · pool shows 2 members with combined cap = sum of A + B allowances · A clicks Lock · pool transitions to `locked` |
| 3 | Locked pool with combined cap RM 1,800 · click "Cadangkan barang" · within 6 seconds receive 5 ranked BM suggestions each citing reasoning + allocation% · pool transitions to `voting` after item selected |
| 4 | 4-member pool in `voting` state · 3 of 4 vote yes · pool transitions to `approved` · `pool_transactions` + `paylater_obligations` rows created with correct proportional shares · NADI staff (separate login) opens `/nadi/dashboard` · clicks "Sahkan dah hantar" · pool transitions to `active` |
| 5 | Active pool with 4 members · cycle 1 begins · all 4 members click "Bayar bulan ni" · all 4 repayments recorded in ledger · cycle 1 complete · cycle 2 initialized · kampung trust score updates · visible on member dashboards |
| 6 | Live URL accessible from any laptop · 4-min demo runs end-to-end (sign-up → pool → suggestion → vote → NADI confirm → repayment → trust score) without breakage · deck exported to PDF · demo video uploaded · FINHACK portal submission complete |

If a phase wants to claim ✅ but its testable outcome line above does NOT pass, the gate refuses.

---

## Who verifies

- **Phase N's verifier is NOT Phase N's owner.**
- Default verifier assignments (can swap at the stand-up):

| Phase | Owner | Verifier |
|---|---|---|
| 0 | Moon + Akmal | Kairu |
| 1 | Moon + Akmal | Kairu |
| 2 | Akmal + Moon | Kairu |
| 3 | Moon + Akmal | Ijam |
| 4 | Moon + Kairu | Ijam |
| 5 | Moon + Akmal | Kairu |
| 6 | Ijam + MatNep | Kairu |

The verifier runs the testable outcome on their own machine. If it works, they mark the phase ✅. If it does not work, they log the specific failure in `team-ledger.md` and the phase stays 🟡.

---

## Blockers and escalation

If the current phase is 🟡 and a blocker has prevented progress for 30+ minutes:

1. Call "🛑 stop" in the team channel.
2. Team huddles within 5 minutes.
3. Blocker is logged to `team-ledger.md` with timestamp, symptom, and owner.
4. The person blocked does NOT start a different phase — they pair on the blocker via `/maji-pair`.

A blocker that cannot be resolved within an hour triggers the cut-line conversation. See [bmad.md](./bmad.md) → cut-line rules.

---

## Why this protocol exists

Hackathon sprints die from one of two failure modes:

1. **Parallel everything** — backend and frontend racing separately, both "done" at their own pace but nothing integrates.
2. **Overbuilt foundation** — Phase 1 takes too long because someone "while we're here" refactors. Phase 5 gets cut. Product suffers.

Kairu's ladder fights both: vertical slices only (backend + frontend land together), and phase-done is earned by testable outcome, not effort.
