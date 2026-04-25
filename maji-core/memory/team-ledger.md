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

---

*Append entries below in reverse-chronological order (newest timestamp at bottom of each day's section, or add a new date section).*
