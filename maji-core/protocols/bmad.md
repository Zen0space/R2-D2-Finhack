# BMAD Method — Kutu Digitizer

**BMAD** is the build methodology maji-core uses to coordinate the team across the 48-hour hackathon. It is **artifact-driven**: the current state of build artifacts (files on disk) determines the current phase, not a verbal claim.

---

## The phases

Phases are defined in [DEVELOPMENT-PLAN.md](../../DEVELOPMENT-PLAN.md) at the repo root. maji-core treats the **Phase Status table** in that file as the live phase registry.

The product is submitted to the **Innovation track** (TNG FINHACK 2026) with three pillars under the Innovation umbrella: **Kutu** (savings · Financial Inclusion-aligned), **Penasihat** (AI robo-advisor · Innovation core), and **Pengawal** (AI scam sentinel · Security & Fraud-aligned). Phase 5 splits into 5a / 5b / 5c — one sub-phase per pillar feature.

| Phase | Pillar | Goal | Testable outcome |
|---|---|---|---|
| 0 — Stack Activation | foundation | Empty repos to "hello world" hitting the stack | `curl /health` returns `{"ok":true}` AND frontend renders at `:3000` |
| 1 — Auth + First Tabung | Kutu | Signed-in user creates a tabung and sees it persisted | Register → create tabung → reload → tabung still there |
| 2 — Member Invite + Join | Kutu | Creator invites, invitee joins, roster appears | Generate invite code → second account accepts → roster shows two |
| 3 — Contribution Flow | Kutu | Member contributes via TNG sandbox; ledger reflects | Contribute → sandbox returns → ledger green + trust +1 |
| 4 — Rotation Payout | Kutu | Cycle completes; scheduled recipient receives payout | All paid → trigger rotation → correct recipient receives |
| 5a — Penasihat Chat | Innovation | BM chat grounded in tabung state | Ask BM question → streamed BM reply citing real tabung data |
| 5b — Penasihat Robo-Advisor | Innovation | Risk-tuned investment recommendations · BM-first reasoning | Complete questionnaire → receive 3 recommendations citing instruments + allocation% + BM reasoning |
| 5c — Pengawal Scam Sentinel | Security | AI scam pattern detection · BM-first warning · community-fed reputation | Attempt transfer to seeded flagged recipient → Pengawal modal in BM with concrete red flags → user override logged |
| 6 — Pitch Polish | all | Demo + deck + rehearsal | Live URL + 4-min demo across 3 pillars + deck + video + submission filed |

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
| 0 | `backend/package.json` + `frontend/package.json` + `docker-compose.dev.yml` + working `/health` |
| 1 | `backend/src/db/schema.ts` has `users`, `sessions`, `tabung` tables + migration applied |
| 2 | `backend/src/routes/members.ts` + invite code generator + `/join/:code` page |
| 3 | `backend/src/routes/contributions.ts` + `backend/src/webhooks/tng.ts` + ledger UI |
| 4 | `backend/src/services/rotation-engine.ts` + `rotations` + `payouts` tables |
| 5a | `backend/src/routes/penasihat/chat.ts` + `/penasihat` page + streaming reply |
| 5b | `backend/src/routes/penasihat/recommend.ts` + `user_risk_profiles` table + `/penasihat/cadang` page + 3-card UI |
| 5c | `backend/src/routes/pengawal/check.ts` + `flagged_recipients` + `pengawal_checks` tables + warning modal in transfer flow |
| 6 | `docs/pitch-deck.pdf` + `docs/demo-video.mp4` + deployed URL |

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
