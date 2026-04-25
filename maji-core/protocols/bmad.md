# BMAD Method — DuitLater

**BMAD** is the build methodology maji-core uses to coordinate the team across the 48-hour hackathon. It is **artifact-driven**: the current state of build artifacts (files on disk) determines the current phase, not a verbal claim.

---

## The phases

Phases are defined in [DEVELOPMENT-PLAN.md](../../DEVELOPMENT-PLAN.md) at the repo root. maji-core treats the **Phase Status table** in that file as the live phase registry.

The product (DuitLater) is submitted to the **Financial Inclusion track** (TNG FINHACK 2026). Single-product, single-track. Test bed: NADI Felda Gedangsa, Hulu Selangor.

| Phase | Goal | Testable outcome |
|---|---|---|
| 0 — Stack Activation | Empty repos to "hello world" hitting the stack with DuitLater branding | `curl /health` returns `{"ok":true}` AND DuitLater frontend renders at `:3000` |
| 1 — Auth + Individual PayLater | Signed-in user sees individual TNG PayLater allowance | Register → dashboard shows individual PayLater allowance → reload persists |
| 2 — Pool Formation + Lock | Creator invites, members join, pool locks with combined cap | Create pool → invite code → second account joins → lock → combined cap = sum of allowances |
| 3 — Penasihat + Catalogue | Locked pool gets BM-first item suggestions from MyKasih catalogue | Click "Cadangkan" → 5 BM suggestions returned with reasoning + allocation% within combined cap |
| 4 — Vote + TNG Approval + Purchase | Members vote, majority triggers simulated TNG approval, NADI confirms delivery | 3-of-4 vote yes → pool approved → simulated TNG approval per member → NADI portal confirms → pool active |
| 5 — Repayment + Kampung Trust | Members repay monthly, ledger reflects, kampung trust score updates | All members pay cycle 1 → ledger all-green → kampung trust score increments |
| 6 — NADI Portal + Pitch Polish | NADI staff dashboard polished + pitch deck + demo video + rehearsal | Live URL + 4-min demo end-to-end + deck PDF + video + FINHACK portal submission filed |

---

## Phase status symbols

```
⏳ pending         — not started, not authorized to start
🟡 in progress     — someone is actively working on it
✅ done            — testable outcome verified; phase is sealed
⚠️ blocked         — in progress but stuck; see team-ledger
🔴 cut             — cut-line invoked (see cut-line rules)
```

Only one phase is 🟡 at a time (serial by default). Parallel work within a phase is fine; parallel phases are not.

---

## Phase advancement rule (Kairu's Tangga Hidup)

A phase cannot transition ⏳ → 🟡 unless **all previous phases are ✅**.

A phase cannot transition 🟡 → ✅ unless **its testable outcome is verified by someone other than the author**.

The `/maji-gate` command runs this check and reports PASS or REFUSE. If REFUSE, maji-core names the specific testable outcome still pending.

---

## Cut-line rules

If the team is visibly behind schedule:

- **Saturday evening and Phase 3 not done** → cut Phase 5 (AI Penasihat). Product still complete.
- **Sunday morning and Phase 4 not done** → cut Phase 4's auto-rotation; replace with manual admin button.
- **Phases 1–3 are non-negotiable.** If Phase 3 cannot ship, stop building and focus on narrating what's built (Phase 6).

Cut decisions are logged to `team-ledger.md` with timestamp, decider, and reason.

---

## Single-owner phase model

Each phase has exactly one **owner** (per [TEAM.md](../../TEAM.md) Phase Ownership table). The owner holds the gate; they call the phase complete, they escalate blockers, they decide cut-line invocation for their phase.

Support members work on the phase but do not own the gate.

If owners need to collaborate mid-phase, they use `/maji-pair` — this creates a co-working record without changing ownership.

---

## Artifact registry

maji-core detects phase state by checking for expected artifacts:

| Phase | Expected artifact (partial list) |
|---|---|
| 0 | `backend/package.json` + `frontend/package.json` + `docker-compose.dev.yml` + DuitLater landing rendered + working `/health` |
| 1 | `backend/src/db/schema.ts` has `users` (with `individual_paylater_allowance_cents`), `sessions`, `kampungs` tables + migration applied + `/dashboard` shows allowance |
| 2 | `pools` + `pool_members` tables + `POST /api/pools` + invite code generator + `/join/:code` page + `lock` action computes combined cap |
| 3 | `mykasih_catalogue` table seeded + `pool_suggestions` table + `POST /api/penasihat/suggest` + Claude API integration + 5-card UI |
| 4 | `pool_votes` + `pool_transactions` + `paylater_obligations` tables + simulated TNG client + `/nadi/dashboard` route with confirm-delivery action |
| 5 | `repayments` + `kampung_trust_scores` tables + repayment ledger UI + kampung trust widget + `Bayar bulan ni` action |
| 6 | `docs/pitch-deck.pdf` + `docs/demo-video.mp4` + deployed URL + NADI portal polished |

A phase is only ✅ when (a) its artifacts exist and (b) its testable outcome has been verified.

---

## Stand-up rhythm

The team runs stand-ups at these checkpoints:

| Time | Purpose |
|---|---|
| Saturday 09:00 | Open-day huddle · confirm Phase 0 plan · assign pairs |
| Saturday 21:00 | End-of-Day-1 check · recalibrate cut-lines if Phase 3 not done |
| Sunday 09:00 | Day-2 open · confirm Phase 4 path (auto or manual) |
| Sunday 13:00 | Pre-pitch rehearsal · lock the demo URL · freeze code |

maji-core does not enforce stand-ups — they happen in person. But `/maji-phase` at each checkpoint gives a shared reading of where the team stands.

---

## Commit message discipline

Every commit must describe **what shipped**, not what was worked on. Examples:

**Bad:** `fix stuff` · `wip` · `update backend` · `final changes`
**Good:** `add POST /api/tabung endpoint` · `wire invite code QR to invite modal` · `fix TNG webhook HMAC verify for base64 signature`

The commit message is read twice: once at review, once six months later when someone asks "why did we do this?" Write for the second read.
