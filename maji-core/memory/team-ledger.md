# Team Ledger — Kutu Digitizer · R2-D2

Shared log of decisions, blockers, pairings, and phase closures. Committed to the repo.

Append-only by convention — do not delete entries. If an entry is wrong, add a correction entry below it referencing the original.

---

## Legend

- `DECISION` — a call that affects the build (stack choice, cut, scope change)
- `BLOCKER` — something that stopped a phase from advancing
- `PAIR` — two members collaborating on a task (logged by `/maji-pair`)
- `PHASE ✅` — a phase was verified done (logged by `/maji-gate` passing)
- `CUT` — a feature was cut (see [bmad.md](../protocols/bmad.md) → cut-line rules)

---

## Entries

### 2026-04-25

- **06:30 · DECISION · Ijam** · Phase 0 pre-scaffolded. Team runs `npm install` + `docker compose up` to reach testable outcome. Rationale: save the 60–90 min of boilerplate boot so Phase 1 can start immediately at 09:00 huddle.
- **07:15 · DECISION · Ijam** · maji-core onboarding system added to repo. Full portable (no canonical lore references in user-facing files). R2-D2 team locked at five: Ijam, Mung, Akmal, Kairu, MatNep.
- **07:35 · DECISION · Ijam** · Sprint 0 (maji-core correctness + DX) complete. Stories shipped: 1.1 lore leak strip · 1.2 schema lock (`protocols/schema.md`) · 1.3 stub collision merge · 1.4 pre-flight checks (`protocols/preflight.md`) · 1.5 personal memory shifted from gitignored to committed (team sees state on pull) · 3.1 IDE slash command mechanism documented · 3.3 QUICKSTART Step 0 added.
- **07:35 · BACKLOG · Ijam** · Sprint 1 deferred — `/maji-unblock` (story 2.1), `/maji-ledger` (2.2), `/maji-team` (2.3), README quick-reference card (3.2). Pick up between hackathon phases. Sprint 2 — hero file polish (4.1, 4.2) — post-hackathon, optional.
- **08:10 · DECISION · Ijam** · **Track switch from Financial Inclusion to Innovation** with three-pillar umbrella strategy. Verified against official site (3 tracks: Financial Inclusion, Security & Fraud, Innovation; pick one only). Innovation brief — *"secure, AI-driven eWallet platform · transparency · regulatory compliance · real-time insights for users and regulators"* — describes the full platform, so submitting under Innovation lets the pitch claim all three pillars under one track. Pillars locked: **Kutu** (savings · Financial Inclusion-aligned) · **Penasihat** (AI robo-advisor · Innovation core) · **Pengawal** (AI scam sentinel · Security-aligned).
- **08:10 · DECISION · Ijam** · Phase 5 split into 5a (Penasihat chat — BM grounded in tabung state) · 5b (Penasihat Robo-Advisor — risk-tuned investment recommendations) · 5c (Pengawal scam sentinel — fraud warning before TNG payment). Combined estimate ~10–11h. Cut-line order: 5a non-negotiable; cut 5b first if Phase 4 ate Sunday morning; 5c stub-only fallback acceptable. Phase ownership updated across DEVELOPMENT-PLAN, TEAM, bmad, phase-gate.
- **08:10 · DOCS UPDATE · Ijam** · Cascade rewrite shipped: README, WORLD, docs/pitch-deck, docs/pitch-narration, docs/README, DEVELOPMENT-PLAN, TEAM, ARCHITECTURE (added Penasihat Robo-Advisor + Pengawal sequence diagrams + 6 new tables), bmad, phase-gate. Memory file `project_finhack_2026.md` (Prime side) still pending update.
- **~13:00 · PIVOT · Ijam** · **Product reset to DuitLater · Shared Pool Pay Later by TNG · Financial Inclusion track**. Verified TNG FINHACK 2026 has 3 tracks (single-track-per-team rule). Switched from Innovation umbrella back to Financial Inclusion as cleanest fit for B40 product. Repo renamed kutu-digitizer → duitlater (GitHub auto-redirects).
- **~13:00 · LOCK · Ijam** · DuitLater core mechanic: TNG users combine individual PayLater allowances into 2–8 member pools to buy bigger-ticket items together. **Test bed: NADI Felda Gedangsa, Hulu Selangor.** Institutional package: TNG (PayLater rail) + NADI/MCMC (community facilitator, 188 centres nationally · 84 in Selangor) + MyKasih Foundation (MySARA-eligible item catalogue + merchant network) + B40 households (the pool). Penasihat repurposed as BM-first item-suggestion advisor (catalogue-based, not robo-advisor anymore). Pengawal dropped entirely. Liability model: individual TNG-default risk + pool-joint-and-several within pool + kampung-level trust score (collectivist incentive · not punitive).
- **~13:00 · PHASES · Kairu/Ijam** · Phase 5 redesigned (no longer split a/b/c). Phases: 0 Stack · 1 Auth+Individual PayLater · 2 Pool Formation+Lock · 3 Penasihat+MyKasih Catalogue · 4 Vote+TNG Approval+Purchase · 5 Repayment+Kampung Trust · 6 NADI Portal+Pitch Polish.
- **~13:00 · CASCADE · Ijam** · Full cascade rewrite shipped: README · WORLD · PRD (v2.0 DuitLater) · BRAND (copy refresh) · DEVELOPMENT-PLAN · TEAM · ARCHITECTURE (new pool/vote/NADI/repayment/trust diagrams + 11 tables in ER) · docs/pitch-deck · docs/pitch-narration · docs/README · maji-core/protocols/bmad · phase-gate · heroes/* (mung, kairu, matnep) · scaffolds (frontend layout/page · backend index · docker-compose dev+prod · backend/.env.example · Caddyfile · QUICKSTART · backend/README · frontend/README). Memory file `project_finhack_2026.md` (Prime side) still pending update — flagged for next session.

---

*Append entries below in reverse-chronological order (newest timestamp at bottom of each day's section, or add a new date section).*
