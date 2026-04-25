# Development Plan — DuitLater

**Phase-by-phase build · vertical-slice discipline · testable outcome per phase**

Every phase ships **backend + frontend together**. No "Phase 1: backend only, Phase 2: frontend only." A phase that doesn't render an end-to-end testable outcome is a broken rung.

---

## Phase 0 — Stack Activation

**Goal:** Empty repos to "hello world" hitting the stack.

**Backend** ✅ pre-scaffolded
- `packages/backend/src/index.ts` — Hono server bound to :4000 with `/health` + env validation + pino logger
- `packages/backend/Dockerfile` — Node 24-alpine, workspace-aware pnpm build
- Prisma client generated via `pnpm --filter db generate`

**Frontend** ✅ pre-scaffolded
- Next.js 15 App Router + Tailwind v4 brand tokens + landing page at `/`
- `packages/frontend/Dockerfile` — pending (Akmal)

**Infra** ✅ pre-scaffolded
- `infra/docker-compose.local.yml` — Postgres 17 only (laptop dev)
- `infra/docker-compose.dev.yml` + `infra/docker-compose.prod.yml` — VPS stacks, image-pull from GHCR
- `infra/Caddyfile` — two-subdomain routing (duitlater.com + dev.duitlater.com)
- `backend-release.yml` — CI builds `:dev` / `:latest` images on push to `dev` / `main`

**Testable outcome:**
> `pnpm db:up` → `pnpm --filter db migrate` → `pnpm dev` → frontend renders at `http://localhost:3000` (DuitLater landing) and `curl http://localhost:4000/health` returns `{"ok":true,"service":"duitlater-backend","env":"development"}`.

**Time estimate:** 60–90 minutes (Saturday 09:00 → 10:30) — pre-scaffolded; team verifies.

---

## Phase 1 — Auth + Individual PayLater

**Goal:** A signed-in user sees their individual TNG PayLater allowance.

**Backend**
- Prisma schema (`packages/db/prisma/schema.prisma`): `User`, `Session` (Better Auth), `Kampung` models
- `User` includes: `kampungId` (FK), `individualPayLaterAllowanceCents` (int, seeded per-user for demo), `role` (`member` | `nadi_staff`)
- Migration: `pnpm --filter db migrate`
- Better Auth configured with Prisma adapter
- Routes:
  - Better Auth handles sign-up / sign-in / sign-out
  - `GET /api/me` — returns current user + kampung + individual PayLater allowance

**Frontend**
- `/sign-up` and `/sign-in` pages with shadcn `Form` + `react-hook-form` + zod
- `/dashboard` — landing for member role:
  - Member name + kampung
  - Individual PayLater allowance card (large, prominent — JetBrains Mono for the figure)
  - Empty pool list ("Belum ada pool. Cipta atau sertai.")
- Better Auth client hooks for session

**Testable outcome:**
> Open the app → register with email + password → land on dashboard → see "PayLater Saya: RM 300" (or whatever seeded amount) → reload page → still authenticated, still see same allowance.

**Time estimate:** 3–4 hours (Saturday 10:30 → 14:30)

**Owner:** Mung (backend) · Akmal (frontend) · Kairu (gate)

---

## Phase 2 — Pool Formation + Invite + Lock

**Goal:** A user can create a pool, invite 1–7 others, and lock the pool to compute combined cap.

**Backend**
- Prisma schema additions: `Pool` (id, name, kampungId, statedNeedText, statedNeedCategory, targetBudgetCents, combinedCapCents, state), `PoolMember` (poolId, userId, joinedAt, individualAllowanceAtLockCents)
- Migration: `pnpm --filter db migrate`
- Routes:
  - `POST /api/pools` — create pool (initiator becomes member 1)
  - `POST /api/pools/:id/invite` — generate 8-char code (nanoid), valid until pool full or initiator closes
  - `POST /api/pools/join` — accept code (auth required), join if pool not locked + capacity available
  - `POST /api/pools/:id/lock` — initiator-only; freezes roster; computes `combined_cap_cents = sum(member allowances)`
  - `GET /api/pools/:id` — pool details + members
  - `GET /api/pools/mine` — list pools user is in
- Pool state machine: `draft → locked → suggesting → voting → approved → active → completed | dissolved`

**Frontend**
- "Cipta pool" button on dashboard → modal with name + stated need text + category dropdown + target budget
- Pool detail page: members list, combined cap (live updates as members join), invite section (code + QR + shareable link), "Lock pool" button (initiator)
- `/join/:code` page: shows pool preview, "Sertai pool" button → success → redirect to pool detail
- After lock: pool detail shows "Pool dah dikunci. Combined cap: RM X,XXX. Cadangkan barang."

**Testable outcome:**
> User A creates pool · invites code · opens incognito · User B registers + joins via code · pool shows 2 members · A clicks Lock · combined cap = sum of A + B's allowances · pool transitions `draft → locked`.

**Time estimate:** 3 hours (Saturday 14:30 → 17:30)

**Owner:** Akmal (frontend lead) · Mung (backend) · Kairu (gate)

---

## Phase 3 — AI Penasihat + MyKasih Catalogue Browse

**Goal:** A locked pool gets ranked item suggestions from the MyKasih catalogue, in BM, grounded in the pool's combined cap and stated need.

**Backend**
- Prisma schema additions: `MykasihProduct` (id, nameBm, nameEn, category, priceCents, imageUrl, descriptionBm) — **94 products already seeded** across 8 categories (rice, cooking oil, generators, sewing machines, school supplies, agricultural tools, water filters, appliances)
- Prisma schema additions: `PoolSuggestion` (poolId, suggestedAt, itemsJson)
- Migration: `pnpm --filter db migrate` (catalogue seed runs as part of migration)
- Routes:
  - `GET /api/catalogue` — list catalogue items (with category filter)
  - `POST /api/penasihat/suggest` — body `{ poolId }`; backend assembles pool context (cap, stated need, current month for seasonal); calls Claude API with structured-output prompt; returns top 5 items with BM reasoning + allocation%; caches result on `PoolSuggestion` for 30 min

**Frontend**
- On locked pool detail: "Cadangkan barang" button → calls suggest endpoint
- Display: 5 suggestion cards (shadcn `Card`) showing item image (placeholder if missing), name, price, allocation% of pool cap, BM reasoning, category chip
- Category filter chips above suggestions ("Semua · Makanan · Alat sekolah · Peralatan · Elektrik")
- "Pilih barang ini" button per card → moves pool state to `voting`

**Testable outcome:**
> Locked pool with combined cap RM 1,800 · click Cadangkan barang · within 6 seconds see 5 ranked suggestions in BM each citing reasoning · select one · pool state transitions to `voting`.

**Time estimate:** 4 hours (Saturday 17:30 → 22:30)

**Owner:** Mung (Penasihat backend + catalogue) · Akmal (suggestion UI) · Ijam (catalogue curation + Penasihat prompt review)

---

## Phase 4 — Pool Vote + Simulated TNG Approval + Purchase

**Goal:** Pool members vote on the suggested item; majority triggers simulated TNG PayLater approval; purchase commits.

**Backend**
- Prisma schema additions: `PoolVote` (poolId, userId, suggestionItemId, vote `YES | NO`, votedAt), `PoolTransaction` (id, poolId, itemId, totalAmountCents, approvedAt, deliveredAt), `PaylaterObligation` (id, transactionId, userId, shareAmountCents, sharePct)
- Migration: `pnpm --filter db migrate`
- Routes:
  - `POST /api/pools/:id/vote` — body `{ vote }`; one vote per member per voting cycle
  - On all members voted (or majority reached + 24h elapsed): backend tallies; if majority yes, transitions pool to `approved`, creates `pool_transactions` + `paylater_obligations` rows
  - Simulated TNG PayLater call (demo: always succeeds; logs to console; production: TNG sandbox)
  - `POST /api/pools/:id/confirm-delivery` — NADI staff role only; transitions pool `approved → active`
  - `GET /api/pools/:id/voting-state` — show vote tally + members not yet voted

**Frontend**
- On `voting` state: each member sees vote modal on next page load — item details + their proportional share + monthly amount; buttons "Setuju" / "Tak setuju"
- Real-time vote tally on pool detail page (poll every 10s)
- On `approved`: show transaction summary, members' shares, "Menunggu pengesahan dari NADI"
- NADI portal `/nadi/dashboard`: list of approved-but-not-delivered pools; "Sahkan dah hantar" button per pool

**Testable outcome:**
> 4-member pool in `voting` state · 3 of 4 vote yes · majority → pool `approved` · pool transactions + obligations created with correct proportional shares · NADI staff (separate login) opens NADI portal · sees pending delivery · clicks Confirm → pool `active`.

**Time estimate:** 4 hours (Sunday 09:00 → 13:00)

**Owner:** Mung (vote tally + transaction logic) · Akmal (vote UI + NADI portal) · Kairu (gate · cut-line aware)

**Cut-line:** if running long, replace simulated TNG approval with hardcoded success (skip the simulated call entirely). Reduce voting from real-time poll to manual refresh. NADI portal can be cut to a single-page read-only summary if Phase 6 has parallel Akmal time.

---

## Phase 5 — Repayment Ledger + Kampung Trust Score

**Goal:** Members repay their monthly share; ledger reflects; kampung trust score updates.

**Backend**
- Prisma schema additions: `Repayment` (id, obligationId, userId, cycleNumber, amountCents, paidAt, tngReference), `KampungTrustScore` (kampungId, score, lastUpdatedAt, signalCount)
- Migration: `pnpm --filter db migrate`
- Routes:
  - `POST /api/repayments/pay` — body `{ obligationId, cycleNumber }`; simulates TNG payment; creates repayments row; recalculates kampung trust
  - `GET /api/pools/:id/ledger` — append-only repayment log (pool members + cycles + status)
  - `GET /api/kampungs/:id/trust` — kampung trust score + recent signal count
- Trust score formula:
  ```
  score = (completion_rate × 0.6 + on_time_rate × 0.4) × 100
  signal_count = total repayment events for kampung
  ```

**Frontend**
- Pool detail (active state): repayment ledger table — rows: member · cycle · status (paid · pending · overdue) · amount · paid_at
- "Bayar bulan ni" button per member's own row (only enabled if their share for current cycle is unpaid)
- Click → simulated TNG flow → ledger row updates green
- Kampung trust score widget on dashboard (collectivist messaging: "Skor kepercayaan kampung anda: 87 — sangat baik")

**Testable outcome:**
> Active pool with 4 members · cycle 1 begins · all 4 click "Bayar" · all 4 repayments recorded · ledger shows all paid for cycle 1 · cycle 2 begins automatically (or by month tick — for demo, by manual button) · kampung trust score updates → visible on member dashboards.

**Time estimate:** 4 hours (Sunday 13:00 → 17:00)

**Owner:** Mung (ledger + trust calc) · Akmal (ledger UI + trust widget) · Kairu (gate)

---

## Phase 5b — NADI Weekly Summary (AI)

**Goal:** NADI staff get an AI-generated BM-first weekly summary with anomaly detection.

**Backend**
- Route: `POST /api/nadi/summary` — body `{ kampungId, weekStart }`, requires `nadi_staff` role
- Backend assembles weekly context: pools formed, top items requested, kampung trust score Δ, late-payment events
- Calls `services/nadi-summary.ts` → Claude API with structured-output prompt
- Output JSON: `{ headline_bm, observations_bm: string[], anomalies_bm: string[], suggestion_bm }`
- Anomaly detection: clusters of 3+ late payments same week → flagged as kampung-distress signal
- Logged to `NadiSummary` table (audit + provider observability)

**Frontend**
- NADI portal `/nadi/dashboard`: "Ringkasan Minggu" card showing the AI-generated summary
- Headline + observations + anomalies + suggestion
- "Refresh" button to regenerate (rate-limited)
- Visible only to `nadi_staff` role

**Testable outcome:**
> NADI staff opens `/nadi/dashboard` · sees this week's summary card with: pools-formed count · top-requested item · kampung trust Δ · 0 or more anomalies in BM · BM-first action suggestion.

**Time estimate:** 1.5–2 hours (Sunday 16:00 → 17:30, parallel with Phase 5 main flow if Mung shipped 5a early)

**Cut-line:** if Phase 5 main repayment ledger ate the Sunday afternoon window, NADI summary degrades to hardcoded demo summary (still BM-first, still surfaces anomaly logic).

**Owner:** Mung (NADI summary backend) · Akmal (NADI summary card) · Kairu (gate)

---

## Phase 6b — Multi-Cloud Infrastructure + HA

**Goal:** Deploy 3-server AWS HA cluster with Cloudflare auto-failover, Alibaba Cloud Function Compute for AI workloads, and cross-cloud Postgres backup — ready for live judging demo.

**Runs parallel to Phase 6** — Mung handles infra, Ijam + MatNep handle pitch polish. Neither blocks the other.

> Full step-by-step guide: [`docs/tech/multi-cloud-setup.md`](../tech/multi-cloud-setup.md). This phase is a condensed task tracker.

**Bahagian A — AWS (3 EC2 + Cloudflare)**
- Provision 3 × EC2 t3.medium ap-southeast-1, each with Elastic IP + shared Security Group
- Install Docker + pnpm on all 3, GHCR login, clone repo, pull `:latest` backend image
- Server 1: configure Postgres as primary (`wal_level=replica`, `max_wal_senders=5`, replication user)
- Server 2 + 3: `pg_basebackup` from Server 1 → start in standby mode (`pg_is_in_recovery() = t`)
- Cloudflare Pro: create 3 origin pools → health monitor (HTTPS GET `/api/health` · 30s · 2 retries) → Load Balancer with failover order [Pool A → B → C]
- Run all 4 failover tests (Section A.8 of the guide)

**Bahagian B — Alibaba Cloud (AI workloads)**
- Create Alibaba Cloud account → get DashScope API key (Qwen-plus)
- Create FC service `duitlater-fc` in ap-southeast-1
- Deploy `penasihat-suggest` function (Node.js 18 · 512 MB · 10s timeout · HTTP trigger)
- Deploy `nadi-summary` function (same specs)
- Update `packages/backend/.env.prod` on all 3 EC2 with `ALIBABA_FUNCTION_COMPUTE_URL` + `ALIBABA_FUNCTION_COMPUTE_URL_NADI`
- Test curl → FC returns BM suggestions via Qwen; Claude as fallback on 5xx

**Bahagian C — Cross-cloud backup**
- `pg_dump` cron on Server 1 (hourly → AWS S3 `duitlater-postgres-backups`)
- S3 → Alibaba OSS mirror script (daily 02:00 UTC)
- Run one restore drill: download from S3, restore to test container, verify tables

**Testable outcome:**
> All 3 pools showing "healthy" on Cloudflare LB dashboard · `https://duitlater.com/api/health` responds 200 · stop Server 1 app → within 90s traffic auto-routes to Server 2 · start Server 1 back → traffic returns · `POST /api/penasihat/suggest` response includes `provider="alibaba-qwen"` (or `"anthropic-claude"` on fallback) · Postgres backup present in S3.

**Time estimate:** 4–6 hours (Sunday 13:00 → 19:00, parallel with Phase 5 tail + Phase 6)

**Cut-line:** If Alibaba FC deploy slips, backend falls back to Claude API automatically — no demo blockage. If Cloudflare LB setup is incomplete, single-server deploy from `infra/RELEASE.md` is the fallback. Never let infra complexity block Phase 6 pitch polish.

**Owner:** Mung (primary · all infra) · Ijam (Alibaba Cloud sponsor credit redemption)

**Full guide:** [`docs/tech/multi-cloud-setup.md`](../tech/multi-cloud-setup.md) — Bahagian A through F, failover playbook, verification checklist, troubleshooting.

---

## Phase 6 — NADI Portal + Pitch Polish

**Goal:** NADI staff dashboard polished + pitch deck + demo video + on-stage rehearsal.

**Tasks (parallel)**
- **Akmal:** Polish NADI portal — kampung-level aggregate stats, no individual PII, pending deliveries, kampung trust score tile
- **Mung:** Multi-cloud infra complete (Phase 6b) · run final migrations on all 3 EC2 · seed demo data (NADI Felda Gedangsa kampung + 4-5 demo members + seeded pools at various states)
- **Ijam:** Finalise 8-slide pitch deck · script the 4-min narration · rehearse twice
- **MatNep:** Apply brand polish · typography hierarchy · slide composition · ensure DuitLater visual coherence
- **Kairu:** Verify all 6 phases gates passed · cut scope ruthlessly if anything wobbly

**Testable outcome:**
> Live URL accessible from any laptop · 4-min demo runs without breakage covering pool formation → suggestion → vote → approval → NADI confirmation → repayment → trust score · pitch deck exported to PDF · demo video uploaded · all submission fields complete on FINHACK portal.

**Time estimate:** 4 hours (Sunday 14:00 → 19:00, parallel with Phase 5 tail; judging at 20:00)

**Owner:** Ijam · MatNep · all hands

---

## Cut-Lines (If Behind Schedule)

If by Saturday evening Phase 3 isn't done:

1. **Cut category filter chips** in Phase 3 — keep just "Semua" view of suggestions.
2. **Cut Phase 5 (repayment + trust score)** features second — pitch around "ledger + trust score in production roadmap" and demo just one cycle of repayment.
3. **Phases 1–4 are non-negotiable** — they ARE the product (auth → pool → suggest → vote/approve).

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
- "I'll skip pool state machine and just use a boolean" (state machine is correctness — not optional)
- Any phase without a Testable Outcome line
- Any commit message that doesn't describe what shipped

---

## Phase Status (Track in This File · Update Live)

| Phase | Status | Started | Completed | Tested by |
|---|---|---|---|---|
| 0 — Stack Activation | ✅ done | 2026-04-25 ~06:30 | 2026-04-25 | Mung |
| 1 — Auth + Individual PayLater | ✅ done | 2026-04-25 | 2026-04-26 | Mung · Akmal |
| 2 — Pool Formation + Lock | 🟡 In progress (frontend) | 2026-04-25 | — | — |
| 3 — Penasihat + Catalogue | 🟡 In progress (frontend) | 2026-04-26 | — | — |
| 4 — Vote + TNG Approval + Purchase | ⏳ Pending | — | — | — |
| 5 — Repayment + Kampung Trust | ⏳ Pending | — | — | — |
| 5b — NADI Weekly Summary (AI) | ⏳ Pending | — | — | — |
| 6b — Multi-Cloud Infra + HA | ⏳ Pending | — | — | — |
| 6 — NADI Portal + Pitch Polish | ⏳ Pending | — | — | — |

Update this table as phases complete. Symbols: ⏳ pending · 🟡 in progress · ✅ done · ⚠️ blocked.

Phase advancement gated by `/maji-gate` (Kairu's ladder). Testable outcome must pass on a machine other than the author's. See [maji-core/protocols/phase-gate.md](../../maji-core/protocols/phase-gate.md).
