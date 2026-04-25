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

1. Read `DEVELOPMENT-PLAN.md` Phase Status table.
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
| 0 | `curl http://localhost:4000/health` returns `{"ok":true}` AND frontend renders at `http://localhost:3000` |
| 1 | Register via UI → create tabung → reload → tabung still listed |
| 2 | Creator generates invite code · copies link · incognito browser registers second account · accepts invite · creator's view shows two members |
| 3 | Member clicks "Contribute" · TNG sandbox flow completes · webhook fires · ledger entry appears green · trust score +1 · reload persists |
| 4 | All members contribute for cycle 1 · admin triggers rotation · scheduled recipient sees payout · timeline updates · cycle 2 begins |
| 5 | Open `/penasihat` · type "bila next payout aku?" in BM · receive streamed BM reply citing real rotation date from user's tabung |
| 6 | Live URL accessible from any laptop · 4-min demo runs without breakage · deck exported to PDF · demo video uploaded · FINHACK portal submission complete |

If a phase wants to claim ✅ but its testable outcome line above does NOT pass, the gate refuses.

---

## Who verifies

- **Phase N's verifier is NOT Phase N's owner.**
- Default verifier assignments (can swap at the stand-up):

| Phase | Owner | Verifier |
|---|---|---|
| 0 | Mung + Akmal | Kairu |
| 1 | Mung + Akmal | Kairu |
| 2 | Akmal + Mung | Kairu |
| 3 | Mung | Akmal |
| 4 | Mung + Kairu | Ijam |
| 5 | Akmal + Mung | Ijam |
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
