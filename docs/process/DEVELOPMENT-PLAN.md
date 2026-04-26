# Development Plan â€” DuitLater

**Phase-by-phase build Â· vertical-slice discipline Â· testable outcome per phase**

Every phase ships **backend + frontend together**. No "Phase 1: backend only, Phase 2: frontend only." A phase that doesn't render an end-to-end testable outcome is a broken rung.

---

## Phase 0 â€” Stack Activation

**Goal:** Empty repos to "hello world" hitting the stack.

**Backend** âœ… pre-scaffolded
- `packages/backend/src/index.ts` â€” Hono server bound to :4000 with `/health` + env validation + pino logger
- `packages/backend/Dockerfile` â€” Node 24-alpine, workspace-aware pnpm build
- Prisma client generated via `pnpm --filter db generate`

**Frontend** âœ… pre-scaffolded
- Next.js 15 App Router + Tailwind v4 brand tokens + landing page at `/`
- `packages/frontend/Dockerfile` â€” pending (Akmal)

**Infra** âœ… pre-scaffolded
- `infra/docker-compose.local.yml` â€” Postgres 17 only (laptop dev)
- `infra/docker-compose.dev.yml` + `infra/docker-compose.prod.yml` â€” VPS stacks, image-pull from GHCR
- `infra/Caddyfile` â€” two-subdomain routing (duitlater.com + dev.duitlater.com)
- `backend-release.yml` â€” CI builds `:dev` / `:latest` images on push to `dev` / `main`

**Testable outcome:**
> `pnpm db:up` â†’ `pnpm --filter db migrate` â†’ `pnpm dev` â†’ frontend renders at `http://localhost:3000` (DuitLater landing) and `curl http://localhost:4000/health` returns `{"ok":true,"service":"duitlater-backend","env":"development"}`.

**Time estimate:** 60â€“90 minutes (Saturday 09:00 â†’ 10:30) â€” pre-scaffolded; team verifies.

---

## Phase 1 â€” Auth + Individual PayLater

**Goal:** A signed-in user sees their individual TNG PayLater allowance.

**Backend**
- Prisma schema (`packages/db/prisma/schema.prisma`): `User`, `Session` (Better Auth), `Kampung` models
- `User` includes: `kampungId` (FK), `individualPayLaterAllowanceCents` (int, seeded per-user for demo), `role` (`member` | `nadi_staff`)
- Migration: `pnpm --filter db migrate`
- Better Auth configured with Prisma adapter
- Routes:
  - Better Auth handles sign-up / sign-in / sign-out
  - `GET /api/me` â€” returns current user + kampung + individual PayLater allowance

**Frontend**
- `/sign-up` and `/sign-in` pages with shadcn `Form` + `react-hook-form` + zod
- `/dashboard` â€” landing for member role:
  - Member name + kampung
  - Individual PayLater allowance card (large, prominent â€” JetBrains Mono for the figure)
  - Empty pool list ("Belum ada pool. Cipta atau sertai.")
- Better Auth client hooks for session

**Testable outcome:**
> Open the app â†’ register with email + password â†’ land on dashboard â†’ see "PayLater Saya: RM 300" (or whatever seeded amount) â†’ reload page â†’ still authenticated, still see same allowance.

**Time estimate:** 3â€“4 hours (Saturday 10:30 â†’ 14:30)

**Owner:** Moon (backend) Â· Akmal (frontend) Â· Kairu (gate)

---

## Phase 2 â€” Pool Formation + Invite + Lock

**Goal:** A user can create a pool, invite 1â€“7 others, and lock the pool to compute combined cap.

**Backend**
- Prisma schema additions: `Pool` (id, name, kampungId, statedNeedText, statedNeedCategory, targetBudgetCents, combinedCapCents, state), `PoolMember` (poolId, userId, joinedAt, individualAllowanceAtLockCents)
- Migration: `pnpm --filter db migrate`
- Routes:
  - `POST /api/pools` â€” create pool (initiator becomes member 1)
  - `POST /api/pools/:id/invite` â€” generate 8-char code (nanoid), valid until pool full or initiator closes
  - `POST /api/pools/join` â€” accept code (auth required), join if pool not locked + capacity available
  - `POST /api/pools/:id/lock` â€” initiator-only; freezes roster; computes `combined_cap_cents = sum(member allowances)`
  - `GET /api/pools/:id` â€” pool details + members
  - `GET /api/pools/mine` â€” list pools user is in
- Pool state machine: `draft â†’ locked â†’ suggesting â†’ voting â†’ approved â†’ active â†’ completed | dissolved`

**Frontend**
- "Cipta pool" button on dashboard â†’ modal with name + stated need text + category dropdown + target budget
- Pool detail page: members list, combined cap (live updates as members join), invite section (code + QR + shareable link), "Lock pool" button (initiator)
- `/join/:code` page: shows pool preview, "Sertai pool" button â†’ success â†’ redirect to pool detail
- After lock: pool detail shows "Pool dah dikunci. Combined cap: RM X,XXX. Cadangkan barang."

**Testable outcome:**
> User A creates pool Â· invites code Â· opens incognito Â· User B registers + joins via code Â· pool shows 2 members Â· A clicks Lock Â· combined cap = sum of A + B's allowances Â· pool transitions `draft â†’ locked`.

**Time estimate:** 3 hours (Saturday 14:30 â†’ 17:30)

**Owner:** Akmal (frontend lead) Â· Moon (backend) Â· Kairu (gate)

---

## Phase 3 â€” AI Penasihat + MyKasih Catalogue Browse

**Goal:** A locked pool gets ranked item suggestions from the MyKasih catalogue, in BM, grounded in the pool's combined cap and stated need.

**Backend**
- Prisma schema additions: `MykasihProduct` (id, nameBm, nameEn, category, priceCents, imageUrl, descriptionBm) â€” **94 products already seeded** across 8 categories (rice, cooking oil, generators, sewing machines, school supplies, agricultural tools, water filters, appliances)
- Prisma schema additions: `PoolSuggestion` (poolId, suggestedAt, itemsJson)
- Migration: `pnpm --filter db migrate` (catalogue seed runs as part of migration)
- Routes:
  - `GET /api/catalogue` â€” list catalogue items (with category filter)
  - `POST /api/penasihat/suggest` â€” body `{ poolId }`; backend assembles pool context (cap, stated need, current month for seasonal); calls Alibaba FC/Qwen when configured or local heuristic fallback; returns top 5 items with BM reasoning + allocation%; caches result on `PoolSuggestion` for 30 min

**Frontend**
- On locked pool detail: "Cadangkan barang" button â†’ calls suggest endpoint
- Display: 5 suggestion cards (shadcn `Card`) showing item image (placeholder if missing), name, price, allocation% of pool cap, BM reasoning, category chip
- Category filter chips above suggestions ("Semua Â· Makanan Â· Alat sekolah Â· Peralatan Â· Elektrik")
- "Pilih barang ini" button per card â†’ moves pool state to `voting`

**Testable outcome:**
> Locked pool with combined cap RM 1,800 Â· click Cadangkan barang Â· within 6 seconds see 5 ranked suggestions in BM each citing reasoning Â· select one Â· pool state transitions to `voting`.

**Time estimate:** 4 hours (Saturday 17:30 â†’ 22:30)

**Owner:** Moon (Penasihat backend + catalogue) Â· Akmal (suggestion UI) Â· Ijam (catalogue curation + Penasihat prompt review)

---

## Phase 4 â€” Pool Vote + Simulated TNG Approval + Purchase

**Goal:** Pool members vote on the suggested item; majority triggers simulated TNG PayLater approval; purchase commits.

**Backend**
- Prisma schema additions: `PoolVote` (poolId, userId, suggestionItemId, vote `YES | NO`, votedAt), `PoolTransaction` (id, poolId, itemId, totalAmountCents, approvedAt, deliveredAt), `PaylaterObligation` (id, transactionId, userId, shareAmountCents, sharePct)
- Migration: `pnpm --filter db migrate`
- Routes:
  - `POST /api/pools/:id/vote` â€” body `{ vote }`; one vote per member per voting cycle
  - On all members voted (or majority reached + 24h elapsed): backend tallies; if majority yes, transitions pool to `approved`, creates `pool_transactions` + `paylater_obligations` rows
  - Simulated TNG PayLater call (demo: always succeeds; logs to console; production: TNG sandbox)
  - `POST /api/pools/:id/confirm-delivery` â€” NADI staff role only; transitions pool `approved â†’ active`
  - `GET /api/pools/:id/voting-state` â€” show vote tally + members not yet voted

**Frontend**
- On `voting` state: each member sees vote modal on next page load â€” item details + their proportional share + monthly amount; buttons "Setuju" / "Tak setuju"
- Real-time vote tally on pool detail page (poll every 10s)
- On `approved`: show transaction summary, members' shares, "Menunggu pengesahan dari NADI"
- NADI portal `/nadi/dashboard`: list of approved-but-not-delivered pools; "Sahkan dah hantar" button per pool

**Testable outcome:**
> 4-member pool in `voting` state Â· 3 of 4 vote yes Â· majority â†’ pool `approved` Â· pool transactions + obligations created with correct proportional shares Â· NADI staff (separate login) opens NADI portal Â· sees pending delivery Â· clicks Confirm â†’ pool `active`.

**Time estimate:** 4 hours (Sunday 09:00 â†’ 13:00)

**Owner:** Moon (vote tally + transaction logic) Â· Akmal (vote UI + NADI portal) Â· Kairu (gate Â· cut-line aware)

**Cut-line:** if running long, replace simulated TNG approval with hardcoded success (skip the simulated call entirely). Reduce voting from real-time poll to manual refresh. NADI portal can be cut to a single-page read-only summary if Phase 6 has parallel Akmal time.

---

## Phase 5 â€” Repayment Ledger + Kampung Trust Score

**Goal:** Members repay their monthly share; ledger reflects; kampung trust score updates.

**Backend**
- Prisma schema additions: `Repayment` (id, obligationId, userId, cycleNumber, amountCents, paidAt, tngReference), `KampungTrustScore` (kampungId, score, lastUpdatedAt, signalCount)
- Migration: `pnpm --filter db migrate`
- Routes:
  - `POST /api/repayments/pay` â€” body `{ obligationId, cycleNumber }`; simulates TNG payment; creates repayments row; recalculates kampung trust
  - `GET /api/pools/:id/ledger` â€” append-only repayment log (pool members + cycles + status)
  - `GET /api/kampungs/:id/trust` â€” kampung trust score + recent signal count
- Trust score formula:
  ```
  score = (completion_rate Ã— 0.6 + on_time_rate Ã— 0.4) Ã— 100
  signal_count = total repayment events for kampung
  ```

**Frontend**
- Pool detail (active state): repayment ledger table â€” rows: member Â· cycle Â· status (paid Â· pending Â· overdue) Â· amount Â· paid_at
- "Bayar bulan ni" button per member's own row (only enabled if their share for current cycle is unpaid)
- Click â†’ simulated TNG flow â†’ ledger row updates green
- Kampung trust score widget on dashboard (collectivist messaging: "Skor kepercayaan kampung anda: 87 â€” sangat baik")

**Testable outcome:**
> Active pool with 4 members Â· cycle 1 begins Â· all 4 click "Bayar" Â· all 4 repayments recorded Â· ledger shows all paid for cycle 1 Â· cycle 2 begins automatically (or by month tick â€” for demo, by manual button) Â· kampung trust score updates â†’ visible on member dashboards.

**Time estimate:** 4 hours (Sunday 13:00 â†’ 17:00)

**Owner:** Moon (ledger + trust calc) Â· Akmal (ledger UI + trust widget) Â· Kairu (gate)

---

## Phase 5b â€” NADI Weekly Summary (AI)

**Goal:** NADI staff get an AI-generated BM-first weekly summary with anomaly detection.

**Backend**
- Route: `POST /api/nadi/summary` â€” body `{ kampungId, weekStart }`, requires `nadi_staff` role
- Backend assembles weekly context: pools formed, top items requested, kampung trust score Î”, late-payment events
- Calls `services/nadi-summary.ts` â†’ Alibaba FC/Qwen when configured, otherwise heuristic summary
- Output JSON: `{ headline_bm, observations_bm: string[], anomalies_bm: string[], suggestion_bm }`
- Anomaly detection: clusters of 3+ late payments same week â†’ flagged as kampung-distress signal
- Logged to `NadiSummary` table (audit + provider observability)

**Frontend**
- NADI portal `/nadi/dashboard`: "Ringkasan Minggu" card showing the AI-generated summary
- Headline + observations + anomalies + suggestion
- "Refresh" button to regenerate (rate-limited)
- Visible only to `nadi_staff` role

**Testable outcome:**
> NADI staff opens `/nadi/dashboard` Â· sees this week's summary card with: pools-formed count Â· top-requested item Â· kampung trust Î” Â· 0 or more anomalies in BM Â· BM-first action suggestion.

**Time estimate:** 1.5â€“2 hours (Sunday 16:00 â†’ 17:30, parallel with Phase 5 main flow if Moon shipped 5a early)

**Cut-line:** if Phase 5 main repayment ledger ate the Sunday afternoon window, NADI summary degrades to hardcoded demo summary (still BM-first, still surfaces anomaly logic).

**Owner:** Moon (NADI summary backend) Â· Akmal (NADI summary card) Â· Kairu (gate)

---

## Phase 6b â€” Multi-Cloud Infrastructure + HA

**Goal:** Deploy 3-server AWS HA cluster with Cloudflare auto-failover, Alibaba Cloud Function Compute for AI workloads, and cross-cloud Postgres backup â€” ready for live judging demo.

**Runs parallel to Phase 6** â€” Moon handles infra, Ijam + MatNep handle pitch polish. Neither blocks the other.

> Full step-by-step guide: [`docs/tech/multi-cloud-setup.md`](../tech/multi-cloud-setup.md). This phase is a condensed task tracker.

**Bahagian A â€” AWS (3 EC2 + Cloudflare)**
- Provision 3 Ã— EC2 t3.medium ap-southeast-1, each with Elastic IP + shared Security Group
- Install Docker + pnpm on all 3, GHCR login, clone repo, pull `:latest` backend image
- Server 1: configure Postgres as primary (`wal_level=replica`, `max_wal_senders=5`, replication user)
- Server 2 + 3: `pg_basebackup` from Server 1 â†’ start in standby mode (`pg_is_in_recovery() = t`)
- Cloudflare Pro: create 3 origin pools â†’ health monitor (HTTPS GET `/api/health` Â· 30s Â· 2 retries) â†’ Load Balancer with failover order [Pool A â†’ B â†’ C]
- Run all 4 failover tests (Section A.8 of the guide)

**Bahagian B â€” Alibaba Cloud (AI workloads)**
- Create Alibaba Cloud account â†’ get DashScope API key (Qwen-plus)
- Create FC service `duitlater-fc` in ap-southeast-1
- Deploy `penasihat-suggest` function (Node.js 18 Â· 512 MB Â· 10s timeout Â· HTTP trigger)
- Deploy `nadi-summary` function (same specs)
- Update `packages/backend/.env.prod` on all 3 EC2 with `ALIBABA_FUNCTION_COMPUTE_URL` + `ALIBABA_FUNCTION_COMPUTE_URL_NADI`
- Test curl â†’ FC returns BM suggestions via Qwen; heuristic fallback on 5xx

**Bahagian C â€” Cross-cloud backup**
- `pg_dump` cron on Server 1 (hourly â†’ AWS S3 `duitlater-postgres-backups`)
- S3 â†’ Alibaba OSS mirror script (daily 02:00 UTC)
- Run one restore drill: download from S3, restore to test container, verify tables

**Testable outcome:**
> All 3 pools showing "healthy" on Cloudflare LB dashboard Â· `https://duitlater.com/api/health` responds 200 Â· stop Server 1 app â†’ within 90s traffic auto-routes to Server 2 Â· start Server 1 back â†’ traffic returns Â· `POST /api/penasihat/suggest` response includes `provider="alibaba-qwen"` (or `"anthropic-claude"` on fallback) Â· Postgres backup present in S3.

**Time estimate:** 4â€“6 hours (Sunday 13:00 â†’ 19:00, parallel with Phase 5 tail + Phase 6)

**Cut-line:** If Alibaba FC deploy slips, backend falls back to heuristic ranking automatically â€” no demo blockage. If Cloudflare LB setup is incomplete, single-server deploy from `infra/RELEASE.md` is the fallback. Never let infra complexity block Phase 6 pitch polish.

**Owner:** Moon (primary Â· all infra) Â· Ijam (Alibaba Cloud sponsor credit redemption)

**Full guide:** [`docs/tech/multi-cloud-setup.md`](../tech/multi-cloud-setup.md) â€” Bahagian A through F, failover playbook, verification checklist, troubleshooting.

---

## Phase 6 â€” NADI Portal + Pitch Polish

**Goal:** NADI staff dashboard polished + pitch deck + demo video + on-stage rehearsal.

**Tasks (parallel)**
- **Akmal:** Polish NADI portal â€” kampung-level aggregate stats, no individual PII, pending deliveries, kampung trust score tile
- **Moon:** Multi-cloud infra complete (Phase 6b) Â· run final migrations on all 3 EC2 Â· seed demo data (NADI Felda Gedangsa kampung + 4-5 demo members + seeded pools at various states)
- **Ijam:** Finalise 8-slide pitch deck Â· script the 4-min narration Â· rehearse twice
- **MatNep:** Apply brand polish Â· typography hierarchy Â· slide composition Â· ensure DuitLater visual coherence
- **Kairu:** Verify all 6 phases gates passed Â· cut scope ruthlessly if anything wobbly

**Testable outcome:**
> Live URL accessible from any laptop Â· 4-min demo runs without breakage covering pool formation â†’ suggestion â†’ vote â†’ approval â†’ NADI confirmation â†’ repayment â†’ trust score Â· pitch deck exported to PDF Â· demo video uploaded Â· all submission fields complete on FINHACK portal.

**Time estimate:** 4 hours (Sunday 14:00 â†’ 19:00, parallel with Phase 5 tail; judging at 20:00)

**Owner:** Ijam Â· MatNep Â· all hands

---

## Cut-Lines (If Behind Schedule)

If by Saturday evening Phase 3 isn't done:

1. **Cut category filter chips** in Phase 3 â€” keep just "Semua" view of suggestions.
2. **Cut Phase 5 (repayment + trust score)** features second â€” pitch around "ledger + trust score in production roadmap" and demo just one cycle of repayment.
3. **Phases 1â€“4 are non-negotiable** â€” they ARE the product (auth â†’ pool â†’ suggest â†’ vote/approve).

If by Sunday morning Phase 4 isn't done:

1. Hardcode TNG PayLater approval as immediate success (no simulated delay).
2. Cut Phase 6 NADI portal to read-only summary screen.
3. Pitch around "auto-approval after vote majority" without demonstrating the simulation latency.

If by Sunday 14:00 Phase 5 isn't done:

1. Stub the kampung trust score with a seeded "high trust" value for demo.
2. Manual single-payment demo for each member; skip cycle progression.
3. Pitch deck slide 5 demo grid drops the trust score tile.

---

## Anti-Patterns (Kairu's Refusal List)

The following will trigger Kairu's Tangga Hidup to crack on contact:

- "Backend in Phase X, frontend in Phase X+1"
- `useEffect` for data fetching (use TanStack Query)
- `as any` type casts
- "We'll add migrations later"
- "Just disable Better Auth for now to ship"
- "We'll handle errors in Phase 7"
- "I'll skip pool state machine and just use a boolean" (state machine is correctness â€” not optional)
- Any phase without a Testable Outcome line
- Any commit message that doesn't describe what shipped

---

## Phase Status (Track in This File Â· Update Live)

| Phase | Status | Started | Completed | Tested by |
|---|---|---|---|---|
| 0 — Stack Activation | ✅ done | 2026-04-25 ~06:30 | 2026-04-25 | Moon |
| 1 — Auth + Individual PayLater | ✅ done | 2026-04-25 | 2026-04-26 | Moon · Akmal |
| 2 — Pool Formation + Lock | 🟡 In progress (frontend) | 2026-04-25 | — | — |
| 3 — Penasihat + Catalogue | 🟡 In progress (frontend) | 2026-04-26 | — | — |
| 4 — Vote + TNG Approval + Purchase | ✅ done (frontend slice) | 2026-04-26 | 2026-04-26 | Akmal |
| 5 — Repayment + Kampung Trust | ✅ done (frontend slice + repayment route) | 2026-04-26 | 2026-04-26 | Akmal |
| 5b — NADI Weekly Summary (AI) | 🟡 In progress (frontend slice + summary route) | 2026-04-26 | — | Akmal |
| 6b — Multi-Cloud Infra + HA | ⏳ Pending | — | — | — |
| 6 — NADI Portal + Pitch Polish | ⏳ Pending | — | — | — |

Update this table as phases complete. Symbols: â³ pending Â· ðŸŸ¡ in progress Â· âœ… done Â· âš ï¸ blocked.

Phase advancement gated by `/maji-gate` (Kairu's ladder). Testable outcome must pass on a machine other than the author's. See [maji-core/protocols/phase-gate.md](../../maji-core/protocols/phase-gate.md).

