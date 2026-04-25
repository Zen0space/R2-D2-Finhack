# BMAD Method — Kutu Digitizer

**BMAD** is the build methodology maji-core uses to coordinate the team across the 48-hour hackathon. It is **artifact-driven**: the current state of build artifacts (files on disk) determines the current phase, not a verbal claim.

---

## The seven phases

Phases are defined in [DEVELOPMENT-PLAN.md](../../DEVELOPMENT-PLAN.md) at the repo root. maji-core treats the **Phase Status table** in that file as the live phase registry.

| Phase | Goal | Testable outcome |
|---|---|---|
| 0 — Stack Activation | Empty repos to "hello world" hitting the stack | `curl /health` returns `{"ok":true}` AND frontend renders at `:3000` |
| 1 — Auth + First Tabung | Signed-in user creates a tabung and sees it persisted | Register → create tabung → reload → tabung still there |
| 2 — Member Invite + Join | Creator invites, invitee joins, roster appears | Generate invite code → second account accepts → roster shows two |
| 3 — Contribution Flow | Member contributes via TNG sandbox; ledger reflects | Contribute → sandbox returns → ledger green + trust +1 |
| 4 — Rotation Payout | Cycle completes; scheduled recipient receives payout | All paid → trigger rotation → correct recipient receives |
| 5 — AI Penasihat | BM chat grounded in tabung state | Ask BM question → streamed BM reply citing real data |
| 6 — Pitch Polish | Demo + deck + rehearsal | Live URL + 4-min demo + deck + video + submission filed |

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
| 5 | `backend/src/routes/penasihat.ts` + `/penasihat` page + streaming reply |
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
