# Development Plan — DuitLater

**Phase-by-phase build · vertical-slice discipline · testable outcome per phase**

Every phase ships **backend + frontend together**. No "Phase 1: backend only, Phase 2: frontend only." A phase that doesn't render an end-to-end testable outcome is a broken rung.

---

## Phase 0 — Stack Activation

**Goal:** Empty repos to "hello world" hitting the stack.

**Backend**
- `npm init -y` · install dependencies per [TECH-STACK.md](./TECH-STACK.md) Section 11
- `tsconfig.json` strict mode
- `src/index.ts` — Hono server bound to :4000 with `/health` endpoint
- `docker-compose.dev.yml` — Postgres only
- Drizzle config + initial empty migration applied

**Frontend**
- `npx create-next-app` per [TECH-STACK.md](./TECH-STACK.md) Section 11
- `npx shadcn init`
- Single landing page renders (DuitLater branded)

**Infra**
- `Dockerfile` for backend
- `Dockerfile` for frontend (Next.js standalone)
- `docker-compose.prod.yml` skeleton
- `Caddyfile` placeholder

**Testable outcome:**
> Run `docker compose -f docker-compose.dev.yml up -d` → run `npm run dev` in both repos → open `http://localhost:3000` (DuitLater landing renders) and `curl http://localhost:4000/health` returns `{"ok": true}`.

**Time estimate:** 60–90 minutes (Saturday 09:00 → 10:30) — pre-scaffolded; team verifies.

---

## Phase 1 — Auth + Individual PayLater

**Goal:** A signed-in user sees their individual TNG PayLater allowance.

**Backend**
- Drizzle schema: `users`, `sessions` (Better Auth), `kampungs`
- `users` table includes: `kampung_id` (FK), `individual_paylater_allowance_cents` (int, seeded per-user for demo), `role` (`member` | `nadi_staff`)
- Migration applied
- Better Auth configured with Postgres adapter
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
- Schema additions: `pools` (id, name, kampung_id, stated_need_text, stated_need_category, target_budget_cents, combined_cap_cents, state)
- Schema additions: `pool_members` (pool_id, user_id, joined_at, individual_allowance_at_lock_cents)
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

## Phase 3 — AI Penasihat (multi-cloud) + MyKasih Catalogue Browse

**Goal:** A locked pool gets ranked item suggestions from the MyKasih catalogue, in BM, grounded in the pool's combined cap and stated need. AI inference routes to Alibaba Cloud Function Compute (Qwen) primary, falls back to Anthropic Claude on 5xx.

**Backend**
- Schema additions: `mykasih_catalogue` (id, name_bm, name_en, category, price_cents, image_url, description_bm) — seeded with ~30 items (rice 100kg, cooking oil 12L, generator 2.5kVA, sewing machine, school supply pack, agricultural sprayer, water filter, basic stove, knapsack sprayer, chainsaw, etc.)
- Schema additions: `pool_suggestions` (pool_id, suggested_at, items_json — array of suggestion objects, provider — `alibaba-qwen` | `anthropic-claude` | `heuristic`)
- Migration: seed catalogue from a seed file
- Routes:
  - `GET /api/catalogue` — list catalogue items (with category filter)
  - `POST /api/penasihat/suggest` — body `{ poolId }`; calls `services/penasihat.ts` which routes to Alibaba FC if configured, else Claude, else heuristic stub. Returns top 5 items with BM reasoning + allocation% + `provider` field; caches result on `pool_suggestions` for 30 min
- **Multi-cloud deploy artifact:** [`alibaba-function-compute/penasihat-suggest/`](./alibaba-function-compute/penasihat-suggest/) — deployable Qwen wrapper. Mung deploys to Alibaba Cloud Function Compute, sets `ALIBABA_FUNCTION_COMPUTE_URL` in backend `.env`. If FC deploy slips on Day 2, backend gracefully falls back to Claude (or heuristic) — no demo blockage.

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
- Schema additions: `pool_votes` (pool_id, user_id, suggestion_item_id, vote `yes | no`, voted_at)
- Schema additions: `pool_transactions` (id, pool_id, item_id, total_amount_cents, approved_at, delivered_at)
- Schema additions: `paylater_obligations` (id, transaction_id, user_id, share_amount_cents, share_pct)
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

## Phase 5 — Repayment Ledger + Kampung Trust Score + NADI Weekly Summary

**Goal:** Members repay their monthly share; ledger reflects; kampung trust score updates. NADI staff get an AI-generated BM-first weekly summary with anomaly detection.

**Backend**
- Schema additions: `repayments` (id, obligation_id, user_id, cycle_number, amount_cents, paid_at, tng_reference)
- Schema additions: `kampung_trust_scores` (kampung_id, score, last_updated_at, signal_count)
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

### Phase 5b — NADI Weekly Summary (2nd AI use-case)

**Backend**
- Route: `POST /api/nadi/summary` — body `{ kampungId, weekStart }`, requires `nadi_staff` role
- Backend assembles weekly context: pools formed, top items requested, kampung trust score Δ, late-payment events
- Calls `services/nadi-summary.ts` which routes to Alibaba Function Compute (Qwen) primary, Anthropic Claude fallback (same multi-cloud pattern as Penasihat suggester)
- Output JSON: `{ headline_bm, observations_bm: string[], anomalies_bm: string[], suggestion_bm }`
- Anomaly detection: clusters of 3+ late payments same week → flagged as kampung-distress signal
- Logged to `nadi_summaries` table (audit + provider observability)

**Frontend**
- NADI portal `/nadi/dashboard`: "Ringkasan Minggu" card showing the AI-generated summary
- Headline + observations + anomalies + suggestion
- "Refresh" button to regenerate (rate-limited)
- Visible only to `nadi_staff` role

**Testable outcome (5b):**
> NADI staff opens `/nadi/dashboard` · sees this week's summary card with: pools-formed count · top-requested item · kampung trust Δ · 0 or more anomalies in BM · BM-first action suggestion · provider used logged for observability.

**Time estimate:** 1.5–2 hours (Sunday 16:00 → 17:30, parallel with Phase 5 main flow if Mung shipped 5a early)

**Cut-line:** if Phase 5 main repayment ledger ate the Sunday afternoon window, NADI summary degrades to hardcoded demo summary (still BM-first, still surfaces anomaly logic) — Penasihat-suggest path on Alibaba FC remains the demonstrable multi-cloud + AI integration.

**Testable outcome (5 main):**
> Active pool with 4 members · cycle 1 begins · all 4 click "Bayar" · all 4 repayments recorded · ledger shows all paid for cycle 1 · cycle 2 begins automatically (or by month tick — for demo, by manual button) · kampung trust score updates → visible on member dashboards.

**Time estimate:** 4 hours main + 1.5h Phase 5b NADI summary (Sunday 13:00 → 17:30)

**Owner:** Mung (ledger + trust calc + NADI summary backend) · Akmal (ledger UI + trust widget + NADI summary card) · Kairu (gate)

---

## Phase 6 — NADI Portal + Pitch Polish

**Goal:** NADI staff dashboard polished + pitch deck + demo video + on-stage rehearsal.

**Tasks (parallel)**
- **Akmal:** Polish NADI portal — kampung-level aggregate stats, no individual PII, pending deliveries, kampung trust score tile
- **Mung:** Deploy to EC2 · run final migrations · seed demo data (NADI Felda Gedangsa kampung + 4-5 demo members + seeded pools at various states)
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
- "useEffect for data fetching"
- "as any" type casts
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
| 0 — Stack Activation | 🟡 Scaffolded (needs `npm install` + verify) | 2026-04-25 ~06:30 | — | — |
| 1 — Auth + Individual PayLater | ⏳ Pending | — | — | — |
| 2 — Pool Formation + Lock | ⏳ Pending | — | — | — |
| 3 — Penasihat + Catalogue | ⏳ Pending | — | — | — |
| 4 — Vote + TNG Approval + Purchase | ⏳ Pending | — | — | — |
| 5 — Repayment + Kampung Trust | ⏳ Pending | — | — | — |
| 5b — NADI Weekly Summary (AI) | ⏳ Pending | — | — | — |
| 6 — NADI Portal + Pitch Polish | ⏳ Pending | — | — | — |

Update this table as phases complete. Symbols: ⏳ pending · 🟡 in progress · ✅ done · ⚠️ blocked.

Phase advancement gated by `/maji-gate` (Kairu's ladder). Testable outcome must pass on a machine other than the author's. See [maji-core/protocols/phase-gate.md](./maji-core/protocols/phase-gate.md).
