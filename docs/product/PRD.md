# Product Requirements Document — DuitLater

| Field | Value |
|---|---|
| **Product** | DuitLater |
| **Tagline** | *Sendiri tak mampu, ramai-ramai boleh.* |
| **Submission** | TNG Digital FINHACK 2026 · **Financial Inclusion Track** |
| **Event date** | 25–26 April 2026 · Grand Summit, CCEC, Bangsar South City, Kuala Lumpur |
| **Document version** | 2.0 (DuitLater) |
| **Last updated** | 2026-04-25 |
| **Document owner** | Ijam (Narrative Spine) |
| **Engineering owner** | Moon (Foundation-Keeper) |
| **Design owner** | MatNep (Orthodox Eye) |
| **PM owner** | Kairu (Ladder-Keeper) |

---

## 1. Executive Summary

DuitLater is a proposed TNG eWallet feature that lets B40 households **combine their individual TNG PayLater allowances into a shared pool** of 2–8 members, enabling group purchases of essential items their individual limits could never afford. The platform integrates three existing Malaysian institutions — **TNG** (PayLater rail), **NADI** (community facilitator, MCMC-run, 188 centres nationally), and **MyKasih Foundation** (MySARA-eligible item catalogue + merchant network) — with a bilingual AI advisor (**Penasihat**) that suggests catalogue items per pool's combined cap and stated needs.

**Test bed:** NADI Felda Gedangsa (Hulu Selangor) — a Felda smallholder community already served by an MCMC-run NADI centre. Felda settlers have an existing communal management tradition that maps directly onto pool formation.

**The product addresses the TNG FINHACK 2026 Financial Inclusion track brief:** *"Build solutions to empower underserved users which include unbanked users and low-income communities."* DuitLater serves the B40 segment that already uses TNG eWallet but is constrained by individually-small PayLater limits — turning collective creditworthiness into collective purchasing power.

---

## 2. The Problem

### 2.1 Individual PayLater limits are too small for essential big-ticket items

Every TNG eWallet user has an individual PayLater allowance set by TNG based on their financial track record. For B40 households, that allowance typically falls between RM 100 and RM 500 — enough for daily groceries but insufficient for items that materially improve household economic capacity (sewing machine, generator, agricultural sprayer, bulk school supplies, basic appliances, transport).

### 2.2 No mechanism for combining allowances

TNG eWallet's PayLater architecture assumes one user = one transaction = one limit. There is no native mechanism to pool allowances across users, even when those users are willing to be jointly accountable. A six-member household pool collectively has RM 1,800–RM 3,000 capacity but cannot access it.

### 2.3 B40 households already practice communal financial life

The B40 population already organises around communal financial trust — kutu rotating savings, family pooling, kampung-level cooperative buying. Felda settlements were designed around collective management. The cultural infrastructure exists. The digital infrastructure is missing.

### 2.4 Existing welfare programmes have item catalogues but no pooling layer

MySARA reaches 3.7 million households monthly with cashless aid via MyKad covering 140,000+ basic items at 10,000+ stores. MyKasih Foundation operates the merchant network. But MySARA is individual cash assistance, not a credit-pool product. Households who exhaust MySARA monthly aid and need bigger-ticket items are stranded.

### 2.5 Existing community digital infrastructure (NADI) is underutilised for fintech

NADI operates 188 centres nationally · 84 in Selangor alone. The mandate is digital inclusion for B40 + rural communities. NADI already runs entrepreneurship programmes (NADIpreneur), women-focused training (EmpowHER), and provides light banking + courier services in some centres. But NADI is rarely positioned as a fintech facilitator — its existing community trust is a wasted lever.

---

## 3. Mission & Vision

### Mission

Combine individual TNG PayLater allowances at the household-pool level (2–8 members), deliver MyKasih-eligible items the pool actually needs, and use existing NADI centres as the community facilitator — bringing collective purchasing power to B40 communities without inventing a new payment rail or a new welfare programme.

### Vision (12-month outlook)

DuitLater becomes the default group-purchase mechanism for B40 households on TNG eWallet, with NADI centres serving as the kampung-level entry point in 188+ locations and MyKasih's merchant network providing last-mile fulfilment. Kampung-level trust scores accumulated through DuitLater repayment behaviour become a recognised input for TNG's individual PayLater limit calibration.

### Hackathon scope (48-hour window)

Ship a working prototype that demonstrates the full flow end-to-end (pool formation → AI suggestion → vote → simulated TNG approval → repayment ledger) with a 4-minute demo that lands on stage and a deck that explains the institutional package.

---

## 4. Target Users

### 4.1 Primary persona — Mak Cik Aminah (Felda settler, 47)

- Felda Gedangsa peneroka with two adult daughters
- Has TNG eWallet (uses for groceries, Touch'n Go reload, school fee transfers)
- Individual TNG PayLater allowance: RM 300
- No bank credit card; declined twice
- Speaks BM primarily, basic English when needed
- Trusts neighbours and the kampung NADI centre staff (knows the staff personally)
- Smartphone: mid-tier Android, 4 years old
- Wants: a sewing machine to start home tailoring side income

### 4.2 Secondary persona — Pak Cik Razali (Felda smallholder, 58)

- 25 years on Felda Gedangsa block
- TNG PayLater allowance: RM 400
- Income from oil palm + occasional kampung rubber tapping
- Wants a small generator for the surau and a knapsack sprayer for his block
- Active in kampung committee; likely pool initiator
- Speaks BM, can read English signs
- Smartphone: comfortable with apps because his children set them up

### 4.3 Tertiary persona — Adik Faiz (B40 gig worker, 24)

- Grab driver in urban-fringe Klang area
- TNG PayLater allowance: RM 500 (gig income tracked, slightly higher limit)
- Lives in family household with parents and two younger siblings
- School supplies for siblings = recurring need beyond his individual limit
- BM/EN bilingual, comfortable with apps
- Smartphone: current generation
- Likely to organise family pool with parents + cousins

### 4.4 Institutional persona — Cik Hidayah (NADI Felda Gedangsa staff)

- NADI centre manager, 6 years in role
- Knows every active kampung member personally
- Already runs NADIpreneur entrepreneurship sessions monthly
- Comfortable with backend portal interfaces (uses MCMC reporting tools daily)
- Trusted intermediary — kampung members come to her with digital questions
- Wants: a portal showing kampung-level pool health + repayment status without exposing individual member sensitive data

### 4.5 Common patterns

- TNG eWallet already installed and used regularly
- BM is the comfortable register for financial decisions
- Community trust (kampung, NADI staff) is the entry point — not the product brand
- Excluded from formal credit products; included in MySARA aid
- Targeted by scams in their native language (out of DuitLater scope but in product roadmap)

---

## 5. Solution Overview

DuitLater is one product with four cooperating actors:

```
+-----------------+       +-----------------+       +-----------------+
|  TNG eWallet    | <---> |  DuitLater      | <---> |  NADI centre    |
|  PayLater rail  |       |  (this product) |       |  facilitator    |
|  per-user limit |       |  pool combinator|       |  84 in Selangor |
+-----------------+       +-----------------+       +-----------------+
                                  |
                                  v
                          +-----------------+       +-----------------+
                          |  AI Penasihat   | <---> |  MyKasih        |
                          |  (BM-first item |       |  MySARA-eligible|
                          |   suggester)    |       |  catalogue +    |
                          +-----------------+       |  merchant net   |
                                                    +-----------------+
```

### Core mechanic

1. **Pool formation** — 2 to 8 members join via NADI centre (or self-organised after kampung is verified). Pool roster locks once formed.
2. **Combined PayLater cap** — sum of members' individual TNG PayLater allowances. No external subsidy.
3. **AI Penasihat suggestion** — based on combined cap, stated kampung needs, and seasonal context, returns top-5 items from MyKasih catalogue with BM reasoning.
4. **Pool vote** — simple majority approves the chosen item before purchase.
5. **TNG approval** — pool transaction debits each member's individual PayLater proportionally; TNG bears the existing per-user credit risk.
6. **MyKasih fulfilment** — merchant ships to the NADI centre or member's address; NADI confirms delivery.
7. **Repayment ledger** — each member's monthly share is visible to all pool members. Append-only.
8. **Kampung trust score** — kampung-level reliability metric; high-trust kampungs unlock larger future pool capacity (collectivist incentive aligned to existing communal culture).

### What makes this Financial Inclusion-track-fit

- **Direct B40 service** — the population this track explicitly targets
- **Existing infrastructure leverage** — TNG + NADI + MyKasih are real, not aspirational
- **No new welfare programme proposed** — composes existing Malaysian programmes
- **No new credit instrument** — uses TNG's existing PayLater risk model
- **Community-anchored** — NADI as the trust gateway, not a faceless app

---

## 6. Goals & Success Metrics

### Hackathon goals (48-hour window)

| Goal | Measure | Threshold |
|---|---|---|
| Working prototype | End-to-end flow demo-able | Pass / Fail |
| 4-minute pitch | Strict timer | ≤ 4:00 |
| Live URL | Public deployment accessible | URL responds in < 3s |
| Submission complete | All FINHACK portal fields filled | Pass / Fail |
| Track placement | Top-3 in Financial Inclusion | Stretch goal |

### Product success metrics (post-hackathon, 6-month outlook)

| Metric | Target | Rationale |
|---|---|---|
| Active pools formed | 50 | Indicates real adoption at the test bed + 1-2 expansion centres |
| Members per pool (median) | 5 | Healthy size for democratic vote dynamics |
| Pool completion rate (full repayment) | > 90% | Practice's strength is reliability |
| AI Penasihat suggestions accepted | > 60% | Indicates relevance of recommendations |
| Kampung trust score continuity | > 80% of kampungs sustain or improve | Score is meaningful, not punitive |
| NADI staff facilitation actions per month | ≥ 10 per centre | Indicates NADI integration is real, not nominal |

### Quality gates (must hold throughout)

- WCAG 2.2 AA contrast on all text
- BM-first register on every user-facing string
- 65ch maximum body-copy measure
- All money math in integer cents — no floating point
- All TNG PayLater simulated calls follow TNG's actual response format (for production-readiness)
- Append-only repayment ledger (no destructive updates)
- NADI portal sees aggregate data only — no individual member PII beyond pool roster

---

## 7. Track Submission — Financial Inclusion

### 7.1 Why Financial Inclusion (and not Innovation or Security)

The TNG FINHACK 2026 Financial Inclusion brief reads verbatim:

> *"Build solutions to empower underserved users which include unbanked users and low-income communities."*

DuitLater serves B40 households — the explicit target. The product's core mechanic (pool PayLater) directly addresses an underserved-user constraint (individual limits too small). The institutional package (TNG + NADI + MyKasih) is purpose-built for B40 reach.

Innovation and Security tracks were considered. Innovation would have required AI-driven transparency framing that fits less cleanly. Security would have required scam-detection framing that is adjacent but not core. Financial Inclusion is the literal fit.

### 7.2 Track brief mapping

| Brief keyword | How DuitLater delivers |
|---|---|
| **Empower underserved users** | Combines small individual PayLater limits into meaningful pool capacity |
| **Unbanked users** | TNG eWallet is the only payment infrastructure assumed; no traditional banking required |
| **Low-income communities** | B40 explicitly targeted; Felda Gedangsa pilot site is a Felda smallholder community |

### 7.3 Track rules honoured

- Single track submitted (Financial Inclusion)
- Solution within track scope (no out-of-track features submitted)
- Per-track judging respected

### 7.4 Judging criteria fit (5 official criteria · same for preliminary + grand final)

| Criterion (verbatim) | DuitLater fit |
|---|---|
| **AI & Intelligent Systems** — *Effective and meaningful integration of AI to address the problem statements* | **Three layers across the project lifecycle.** Layer 1 (pre-product): ~2,400 lines of planning artifacts generated through multi-agent AI orchestration before product code began. Layer 2 (process): [`maji-core/`](../../maji-core/) team coordinator — 6 slash commands, phase gates, schema-locked persistent memory, Akal coding discipline, Jimat register. Layer 3 (in-product): Penasihat catalogue suggester (Claude API, structured BM output) + NADI weekly summary with anomaly detection. Full 3-layer story: [`docs/ai-methodology.md`](../ai-methodology.md). |
| **Technical Implementation** — *Scalability, robustness, security or prototype* | Append-only ledger · HMAC-verified webhooks · argon2 hashing · role-based NADI portal scoping · TypeScript strict end-to-end · explicit production scale path documented (read replica → ASG → Aurora multi-AZ) · rate limiting via `hono-rate-limiter` · full security posture in [ARCHITECTURE.md](../tech/ARCHITECTURE.md). |
| **Multi-Cloud Service Usage** — *Effective and purposeful use of at least two or more cloud platforms* | **AWS + Anthropic Cloud** — AWS hosts main backend (EC2 + Postgres). Anthropic Claude API (separate cloud platform) hosts AI inference for Penasihat suggester and NADI weekly summary. Both are production-grade cloud services with distinct SLAs, billing, and failure domains. |
| **Impact & Feasibility** — *Real-world use case relevance, sustainability and potential adoption* | Test bed: **NADI Felda Gedangsa, Hulu Selangor** — real Felda smallholder community with existing MCMC-run NADI centre. Real institutional package: TNG (Gold sponsor · 23M users) + NADI/MCMC (188 centres nationally · 84 in Selangor) + MyKasih (3.7M monthly SARA recipients · 10,000+ merchant network). 2.9M B40 households nationally. No new welfare programme invented — DuitLater composes existing rails. No new credit instrument — uses TNG's existing PayLater risk model. |
| **Presentation & Teamwork** — *Clarity in project demo and pitch, teamwork, documentation quality* | 4-min on-stage script in [pitch-narration.md](../pitch/pitch-narration.md) with recovery phrases per slide. 8-slide deck in [pitch-deck.md](../pitch/pitch-deck.md). Documentation quality: 600+ line PRD, ARCHITECTURE with 8 mermaid diagrams, WORLD manifesto, BRAND visual identity guide, DEVELOPMENT-PLAN with phase-by-phase testable outcomes. maji-core team coordinator with 6 slash commands, phase-gate enforcement, committed personal memory for cross-team visibility. |

---

## 8. User Stories

### 8.1 Pool formation

**US-1 — Discover individual PayLater allowance**
> As a logged-in user, I want to see my current TNG PayLater allowance so I know what I can contribute to a pool.
- **Acceptance:** Dashboard shows the user's individual allowance (sourced from TNG sandbox; for demo, hardcoded per-user). Updates if TNG returns a new value.

**US-2 — Form a new pool**
> As a kampung member at NADI Felda Gedangsa, I want to form a pool of 2–8 members so we can combine PayLater capacity.
- **Acceptance:** Create-pool form requires pool name, stated need (free text + category dropdown), and target item budget. Initiator becomes member 1. Combined cap is initially the initiator's allowance; grows as members join.

**US-3 — Invite members to pool**
> As a pool initiator, I want to invite 1–7 more members so we can combine our allowances.
- **Acceptance:** Invite via 8-character code (nanoid) or QR. Code valid until pool capacity (8) reached or initiator closes invitations. Invited members must be authenticated TNG users.

**US-4 — Lock the pool**
> As a pool initiator, I want to lock the pool roster once we have 2+ members so the combined cap is finalised.
- **Acceptance:** Initiator clicks "Lock pool". Combined cap = sum of locked members' individual allowances. After lock, no new members can join unless pool dissolves.

### 8.2 AI Penasihat suggestion

**US-5 — Get item suggestions**
> As a locked pool, I want AI Penasihat to suggest items from MyKasih catalogue that match our combined cap and stated need.
- **Acceptance:** Click "Cadangkan barang" → Penasihat returns top-5 ranked items in BM with: item name, price, category, allocation% of pool cap, BM reasoning citing the pool's stated need. Powered by Claude API with structured output.

**US-6 — Filter suggestions by category**
> As a pool, I want to filter suggestions to specific categories (e.g., "alat ternakan" or "alat sekolah") so we can refine the choice.
- **Acceptance:** Category filter chips on suggestion view. Re-runs Penasihat call with category constraint.

### 8.3 Vote + purchase

**US-7 — Vote on item**
> As a pool member, I want to vote on the suggested item so the purchase is democratically approved.
- **Acceptance:** Each member sees a vote modal: item details + their proportional repayment amount + monthly share. Buttons: "Setuju" / "Tak setuju". Simple majority approves. Tied votes → pool discusses; initiator can re-call vote after 24h.

**US-8 — Approval flow + simulated purchase**
> As an approved pool, I want the purchase to commit against each member's individual PayLater proportionally.
- **Acceptance:** On majority approval, backend simulates TNG PayLater approval per member (sandbox call; for demo, always succeeds). Each member's individual allowance debits proportionally. Pool transaction record created. Item marked "purchased — pending delivery".

**US-9 — Confirm delivery**
> As a NADI centre staff, I want to confirm item delivery so the repayment cycle starts.
- **Acceptance:** NADI portal shows pending deliveries. NADI staff click "Confirmed delivered" → pool transaction status becomes "active"; repayment cycle begins from the next month.

### 8.4 Repayment

**US-10 — See my monthly share**
> As a pool member, I want to see my monthly repayment share and total outstanding so I know what I owe.
- **Acceptance:** Member dashboard shows: pool name, my proportional share, monthly amount, months remaining, total outstanding. Updates on payment.

**US-11 — Make a monthly payment**
> As a member, I want to make my monthly repayment via TNG so the pool ledger updates.
- **Acceptance:** Member clicks "Bayar bulan ni" → TNG sandbox payment → on confirmation, payment row added to repayment ledger; member's outstanding decreases; pool's total outstanding updates; trust signal updates.

**US-12 — See pool repayment ledger**
> As a pool member, I want to see every member's repayment status so trust is visible.
- **Acceptance:** Pool ledger view: each member, their monthly status (paid / pending / overdue), running total. Append-only — past entries never edited.

### 8.5 Kampung trust + NADI portal

**US-13 — See kampung trust score**
> As a kampung member, I want to see our kampung's trust score so I understand its standing.
- **Acceptance:** Kampung dashboard shows trust score (0–100), recent pool completions, average repayment rate. Score is collectivist (kampung-level), not individual.

**US-14 — NADI staff dashboard**
> As NADI Felda Gedangsa staff, I want a portal showing pool health for my centre so I can support members appropriately.
- **Acceptance:** `/nadi/dashboard` route (separate auth role). Shows: active pools, members per pool, items purchased, repayment status (aggregate, not individual amounts), kampung trust score. No individual PII beyond member count.

---

## 9. Functional Requirements

### 9.1 Authentication & identity

- **F-A1** Email + password registration via Better Auth (argon2 hashed)
- **F-A2** Session via HttpOnly Secure SameSite=Lax cookie
- **F-A3** Two role types: `member` (default), `nadi_staff` (NADI portal access)
- **F-A4** Each member has an associated `kampung` field (for demo, hardcoded to "Felda Gedangsa")

### 9.2 Individual PayLater

- **F-P1** Each user has an `individual_paylater_allowance` (cents). For demo, seeded per-user; production: TNG sandbox call.
- **F-P2** Allowance is read-only from the user's perspective (TNG controls it)
- **F-P3** Dashboard displays the allowance prominently

### 9.3 Pool lifecycle

- **F-PL1** Create pool: requires name (≤ 50 chars), stated need (text + category), target budget (cents)
- **F-PL2** Invite via 8-char nanoid code or QR
- **F-PL3** Member joins via `/join/<code>`; allowed only if pool has < 8 members and is not yet locked
- **F-PL4** Lock pool: initiator-only action; sets `combined_cap = sum(members.individual_allowance)`; freezes roster
- **F-PL5** Pool states: `draft → locked → suggesting → voting → approved → active → completed | dissolved`

### 9.4 AI Penasihat

- **F-AI1** `POST /api/penasihat/suggest`: body `{ poolId }`, requires auth + pool membership
- **F-AI2** Backend assembles context: combined cap, stated need, kampung context, season (current month)
- **F-AI3** Backend queries `mykasih_catalogue` table for items within cap range
- **F-AI4** Claude API call with locked system prompt + structured output schema: `{ items: [{ id, name, price, category, allocation_pct, reasoning_bm, reasoning_en }] }`
- **F-AI5** Response cached per pool for 30 min (avoid re-spending API quota on UI re-renders)

### 9.5 AI NADI Weekly Summary

- **F-NS1** `POST /api/nadi/summary`: body `{ kampungId, weekStart }`, requires `nadi_staff` role
- **F-NS2** Backend assembles weekly context: pools formed, top-requested items, kampung trust score Δ, late-payment events
- **F-NS3** Claude API call with structured output: `{ headline_bm, observations_bm: string[], anomalies_bm: string[], suggestion_bm }`
- **F-NS4** Surfaces on `/nadi/dashboard` as the weekly briefing card
- **F-NS5** Anomaly detection: clusters of 3+ late payments same week flagged as kampung-distress signal
- **F-NS6** Audit-friendly — all summaries logged with generation timestamp

### 9.6 Vote

- **F-V1** `POST /api/pools/:id/vote`: body `{ memberId, vote: 'yes' | 'no' }`, one vote per member per item suggestion
- **F-V2** Vote tally reaches majority → pool transitions `voting → approved`
- **F-V3** Tied vote: pool stays in `voting`; initiator can re-call vote after 24h delay
- **F-V4** Vote outcomes append-only logged

### 9.7 Purchase + delivery

- **F-D1** On `voting → approved`: backend creates `pool_transactions` row with amount, members list, proportional shares
- **F-D2** Simulated TNG PayLater call per member (demo: always succeeds; production: real sandbox)
- **F-D3** On confirmation, individual `paylater_obligations` rows created per member
- **F-D4** NADI portal action: confirm delivery → pool transitions `approved → active`
- **F-D5** Repayment cycle begins from next month

### 9.8 Repayment

- **F-R1** Monthly cycle: each member sees `Bayar bulan ni` button if their share for the current cycle is unpaid
- **F-R2** Click → TNG sandbox payment → on confirm, `repayments` row added with `member_id, pool_id, cycle_number, amount_cents, paid_at`
- **F-R3** Member outstanding decreases; pool aggregate updates
- **F-R4** All members repaid for cycle N → cycle N marked complete; cycle N+1 begins
- **F-R5** All cycles repaid → pool transitions `active → completed`

### 9.9 Kampung trust score

- **F-T1** Trust score = weighted average of (kampung's pool completion rate · 0.6) + (kampung's average on-time payment rate · 0.4)
- **F-T2** Score range 0–100; new kampung starts at 60 (neutral)
- **F-T3** Score updates on every pool completion or payment
- **F-T4** Visible to all kampung members
- **F-T5** Affects future pool capacity ceiling: high-trust kampung can unlock NADI-tier multipliers (production roadmap; demo: just display)

### 9.10 NADI portal

- **F-N1** Separate auth role `nadi_staff`
- **F-N2** `/nadi/dashboard` route protected by role
- **F-N3** Shows: active pool count, members per pool, items purchased aggregate, repayment rate aggregate, kampung trust score
- **F-N4** Action: confirm delivery (per F-D4)
- **F-N5** No individual member PII beyond pool member count

### 9.11 Brand & visual surface

- **F-B1** Cormorant Garamond for display + headings
- **F-B2** Inter for body
- **F-B3** JetBrains Mono for monetary figures with tabular figures
- **F-B4** Brand palette tokens (BM-first names: tabung-gold, tabung-maroon, tabung-cream, etc.)
- **F-B5** 12-column fluid responsive grid · 8pt baseline · 65ch body measure
- **F-B6** All custom heritage glyphs structured-geometric (diamond-within-diamond, songket-derived)

---

## 10. Non-Functional Requirements

### 10.1 Performance

- Frontend Time-to-Interactive < 3s on a fresh laptop on conference WiFi
- API p95 < 500ms for non-AI routes
- Penasihat suggestion synchronous response < 6s (Claude API + DB query combined)

### 10.2 Security

- Passwords argon2 hashed (Better Auth default)
- Sessions HttpOnly Secure SameSite=Lax
- TNG sandbox webhooks HMAC-verified (when integrated)
- Append-only repayment ledger (no DELETE, no destructive UPDATE)
- NADI portal scope-limited (no individual member financial data exposed)
- No PII passed to Claude API beyond first name + pool numbers + stated need

### 10.3 Accessibility

- WCAG 2.2 AA contrast (4.5:1 body · 3:1 large)
- Keyboard navigation for every interactive surface
- Focus rings visible (tabung-gold)
- Motion-reduction respected (`prefers-reduced-motion`)
- Alt text on every image
- BM-first labels with EN supplemental where needed

### 10.4 Privacy

- Member identity visible only within their own pool + kampung roster
- NADI staff see aggregate data only — no individual amounts or transactions
- Penasihat does not log conversation content beyond audit metadata
- No third-party tracking pixels in MVP

### 10.5 Bilingual (BM-first)

- Default register: BM with natural EN code-switch
- Every Penasihat response defaults to BM; EN fallback for technical instrument names only
- Tutur protocol — emotional/cultural beats in BM, technical nouns in EN

### 10.6 Resilience

- Graceful degradation if TNG sandbox unreachable: simulated approvals with clear "DEMO" badge
- Graceful degradation if Claude API rate-limited: Penasihat falls back to non-AI catalogue browse + filter
- Database connection failures → 503 with retry hint, not 500

---

## 11. Technical Architecture (Summary)

Single EC2 t3.medium · ap-southeast-1 · 4-container Docker spine. Same-domain path-routing through Caddy.

```
[ User Browser ]
       |
       v  HTTPS :443
[ Caddy ] --- /api/*  ---> [ Hono Backend :4000 ]
       |    /*       --> [ Next.js Frontend :3000 ]
                             |
                             v internal
                        [ Postgres :5432 ]
                             ^
                             |
                  [ Better Auth · sessions ]
                             |
                             v outbound
        [ TNG PayLater sandbox ] · [ Claude API ] · [ MyKasih catalogue (seeded) ]
```

### Repository layout — pnpm workspace monorepo

Single repo, three workspace packages, single lockfile. Backend and frontend both consume types and Prisma client from the shared `db` package via `workspace:*` protocol.

```
R2-D2-Finhack/
├── packages/
│   ├── backend/           # Hono API (Node 22) · port 4000
│   ├── frontend/          # Next.js 15 App Router + PWA · port 3000
│   └── db/                # Prisma schema · migrations · generated client
├── docs/
│   ├── product/  tech/  team/  process/  pitch/
├── maji-core/             # Team protocols, heroes, slash commands
├── infra/                 # Caddyfile + docker-compose.{local,dev,prod}.yml
├── scripts/               # setup.sh · kill-ports.sh
├── pnpm-workspace.yaml
└── package.json           # root workspace (private, scripts only)
```

Full diagrams: [ARCHITECTURE.md](../tech/ARCHITECTURE.md). Tech stack inventory: [TECH-STACK.md](../tech/TECH-STACK.md). Full 67-item inventory: [tech-stack-manifest.md](../tech/tech-stack-manifest.md).

---

## 12. Data Model (Summary)

ORM: **Prisma 6** · single source of truth at `packages/db/prisma/schema.prisma`.
Schema generates the typed Prisma client; both backend and frontend import types via the `db` workspace package.

### Core tables

`User` · `Session` · `Kampung` · `Pool` · `PoolMember` · `MykasihProduct` · `PoolSuggestion` · `PoolVote` · `PoolTransaction` · `PaylaterObligation` · `Repayment` · `KampungTrustScore`

(Already shipped: `MykasihProduct` model + 94 seeded products in the catalogue.)

### Key invariants

- Money columns are integer cents (never float)
- `PaylaterObligation` rows append-only after creation
- `Repayment` append-only; corrections via compensating rows
- A `Pool` can only transition forward (`DRAFT → LOCKED → … → COMPLETED`)
- `Pool.combinedCap` is computed at lock time; never recalculated
- `KampungTrustScore` recalculated on every pool completion or payment event

Full ER diagram: [ARCHITECTURE.md](../tech/ARCHITECTURE.md) → Data Model section.

---

## 13. Build Phases & Timeline

7 phases (0–6). Phase definitions, testable outcomes, and ownership: [DEVELOPMENT-PLAN.md](../process/DEVELOPMENT-PLAN.md).

| Window | Phases targeted |
|---|---|
| Sat 09:00–10:30 | Phase 0 — pre-scaffolded; team verifies |
| Sat 10:30–14:30 | Phase 1 (auth + individual PayLater display) |
| Sat 14:30–17:30 | Phase 2 (pool formation + invite + lock) |
| Sat 17:30–22:30 | Phase 3 (Penasihat suggestion + MyKasih browse) |
| Sun 09:00–13:00 | Phase 4 (vote + simulated TNG approval + purchase) |
| Sun 13:00–17:00 | Phase 5 (repayment ledger + kampung trust) |
| Sun 14:00–19:00 | Phase 6 (NADI portal + pitch polish, parallel) |
| Sun 20:00 | Judging |

Phase advancement gated by `/maji-gate`. See [maji-core/protocols/phase-gate.md](../../maji-core/protocols/phase-gate.md).

---

## 14. Out of Scope (Hackathon Window)

| Item | Why deferred |
|---|---|
| Real TNG PayLater API integration | Sandbox simulated for demo; production needs TNG partnership |
| Real MyKasih catalogue API | Seeded subset of ~30 items for demo; production needs MyKasih agreement |
| Real NADI portal deployment | Built as standalone demo; production needs MCMC partnership |
| Mobile app | Web responsive sufficient for MVP |
| Multi-currency / international pools | Malaysia-only |
| Multiple kampung in single demo | Single kampung (Felda Gedangsa) for demo focus |
| Scam/fraud detection layer (was Pengawal) | Out of Financial Inclusion track scope |
| Investment/robo-advisor recommendations (was Innovation pillar) | Out of Financial Inclusion track scope |
| Voice interface for Penasihat | Future accessibility feature |
| Automated KYC | TNG handles per-user identity; we inherit |
| Group chat within pool | Communication out-of-band (WhatsApp); we are ledger + schedule |

---

## 15. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| TNG sandbox not provisioned by Day 1 | Medium | High | Backend abstracts payment provider; mock TNG client returns success in dev |
| Claude API rate-limit during demo | Low | High | Pre-cache common Penasihat suggestions for demo pool |
| Phase 4 (vote + approval) eats Sunday morning | Medium | Medium | Cut to manual admin-button approval; preserve Phase 5 (repayment) window |
| Phase 6 (NADI portal) ambitious for parallel | Medium | Low | Cut NADI portal to read-only summary; pitch deck still claims feature exists |
| Demo machine fails on stage | Low | Critical | Backup video pre-recorded; pitch narration self-contained without screen |
| Pitch overrun (> 4 minutes) | Medium | High | Strict timer rehearsals (twice Sunday morning); recovery phrases per slide |
| BM register inconsistencies | Low | Medium | Tutur-protocol review by Ijam pre-pitch |
| Penasihat false positives (suggesting impractical items) | Medium | Medium | Curate seeded catalogue tightly; constrain Claude prompt with explicit "must-fit-pool-need" rule |
| Kampung trust score formula reads as punitive | Low | High | Frame collectively (high-trust kampung unlocks better terms) not punitively (low-trust kampung penalised) |
| Judges unfamiliar with NADI / MyKasih | Medium | Medium | Slide 4 explicitly names + hyperlinks the institutions; pitch repeats them by full name once each |
| OA/B40 framing misread as paternalistic | Low | High | Pitch language describes institutional combination, not "saving the poor"; emphasises agency |

---

## 16. Open Questions (resolve before Day 2)

1. **TNG PayLater sandbox** — does TNG actually have a PayLater sandbox? If not, our pitch frames DuitLater as a feature TNG could ship. Verify at organiser briefing.
2. **MyKasih API access** — confirm with organisers if MyKasih Foundation is among TNG FINHACK partners. If yes, request data; if no, demo-only.
3. **NADI partnership** — verify whether MCMC/NADI is an event sponsor or stakeholder. If yes, NADI Felda Gedangsa contact may be obtainable for post-hackathon pilot.
4. **Pitch length specification** — 4 minutes assumed; verify at organiser briefing.
5. **Demo room setup** — projector, audio, network. Confirm Day 1.
6. **Judging rubric weights** — verify if Financial Inclusion track judges weigh certain criteria higher.
7. **Post-hackathon IP terms** — confirm hackathon T&Cs.

---

## 17. Stakeholders & Team

### Core team (R2-D2 · KrackedDevs)

| Member | Role | Codename | Domain |
|---|---|---|---|
| **Ijam** (Zarul Izham) | Business Pitch Lead · Product Owner | *Narrative Spine* | Pitch · positioning · stakeholder framing |
| **Moon** | Backend Lead | *Foundation-Keeper* | Hono · Prisma · Postgres · Better Auth · TNG simulated · MyKasih catalogue |
| **Akmal** | Frontend Lead | *Surface-Weaver* | Next.js 15 · Tailwind v4 · shadcn/ui · TanStack Query · Jotai · pool UI · NADI portal |
| **Kairu** | Product Manager | *Ladder-Keeper* | Phase plan · testable outcomes · scope guard |
| **MatNep** | Classical Designer | *Orthodox Eye* | BRAND · pitch deck · typography · accessibility |

Per-member role cards: [maji-core/heroes/](../../maji-core/heroes/).

### External stakeholders (post-hackathon roadmap)

- **TNG Digital** — PayLater rail provider, hackathon host, potential partner for live pilot
- **MCMC** (via NADI division) — community facilitator partner, NADI Felda Gedangsa contact
- **MyKasih Foundation** — MySARA item catalogue + merchant network partner
- **Bank Negara Malaysia** — financial inclusion desk, regulatory engagement on B40 credit pooling
- Sponsor partners (Alibaba Cloud, OceanBase, VISA, AWS) — infrastructure credits + scale-up partnerships

### Team conventions

- maji-core slash commands as the daily coordination interface
- Akal protocol on every code change
- Jimat penuh register default
- Manual commits — AI never `git commit` automatically
- Personal memory committed to git (team visibility on `git pull`)

---

## 18. Appendix

### 18.1 Reference reading

- [README.md](../../README.md) — repo entry point + quickstart
- [CLAUDE.md](../../CLAUDE.md) — Claude Code project instructions + ownership table
- [WORLD.md](./WORLD.md) — manifesto · cultural anchor · institutional package narrative
- [BRAND.md](./BRAND.md) — visual identity · palette · typography · iconography · voice
- [ARCHITECTURE.md](../tech/ARCHITECTURE.md) — system architecture · sequence diagrams · ER diagram
- [TECH-STACK.md](../tech/TECH-STACK.md) — stack inventory · install commands · version locks
- [tech-stack-manifest.md](../tech/tech-stack-manifest.md) — full 67-item stack inventory
- [TEAM.md](../team/TEAM.md) — roster · phase ownership · norms
- [AGENTS.md](../team/AGENTS.md) — AI assistant onboarding spec
- [ONBOARDING.md](../team/ONBOARDING.md) — Claude Code team onboarding guide
- [DEVELOPMENT-PLAN.md](../process/DEVELOPMENT-PLAN.md) — 7-phase build plan · cut-line strategy
- [QUICKSTART.md](../process/QUICKSTART.md) — 10-minute bootstrap
- [pitch-deck.md](../pitch/pitch-deck.md) — 8-slide deck content
- [pitch-narration.md](../pitch/pitch-narration.md) — 4-minute on-stage script
- [product-manifest.md](../pitch/product-manifest.md) — product manifest with visual flows

### 18.2 Institutional partner references (verified)

| Partner | Source |
|---|---|
| TNG eWallet | <https://www.touchngo.com.my/> |
| NADI (Pusat Sebaran Maklumat Nasional) | <https://www.nadi.my/> · NADI Selangor: <https://www.nadi.my/negeri/selangor/> |
| MCMC USP / NADI parent | <https://www.mcmc.gov.my/usp-annual-report/2021/pusat-ekonomi-digital-keluarga-malaysia-pedi> |
| MyKasih Foundation | <https://www.mykasih.com.my/en/> |
| Sumbangan Asas Rahmah (SARA) | <https://sara.gov.my/en/home.html> |
| JAKOA (for OA-related context) | <https://www.jakoa.gov.my/orang-asli/> |

### 18.3 FINHACK 2026 official details (verified)

- **Event:** TNG Digital FINHACK 2026
- **Date:** 25–26 April 2026
- **Venue:** Grand Summit, CCEC, Bangsar South City, Kuala Lumpur
- **Tracks:** Financial Inclusion · Security & Fraud · Innovation — pick one only
- **Our submission:** **Financial Inclusion**
- **Prize:** RM 100,000+ pool
- **Source:** <https://www.tngdigitalfinhack.com/>

### 18.4 Document conventions

- "BM" = Bahasa Melayu
- "EN" = English
- "TNG" = Touch 'n Go (eWallet provider)
- "NADI" = Pusat Sebaran Maklumat Nasional (MCMC community internet centres)
- "MyKasih" = MyKasih Foundation (operates SARA)
- "MySARA" / "SARA" = Sumbangan Asas Rahmah (federal welfare cashless aid programme)
- "B40" = Bottom 40% household income bracket
- "Felda" = Federal Land Development Authority (smallholder settlement scheme)
- "Penasihat" = advisor (Malay) — the AI brand

---

*PRD v2.0 · 2026-04-25 · authored by team R2-D2 with Prime AI assistance · Financial Inclusion track submission · TNG FINHACK 2026.*

*"Sendiri tak mampu, ramai-ramai boleh."*
