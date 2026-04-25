# Development Plan — Kutu Digitizer

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
- Single landing page renders

**Infra**
- `Dockerfile` for backend
- `Dockerfile` for frontend (Next.js standalone)
- `docker-compose.prod.yml` skeleton
- `Caddyfile` placeholder

**Testable outcome:**
> Run `docker compose -f docker-compose.dev.yml up -d` → run `npm run dev` in both repos → open `http://localhost:3000` (frontend renders) and `curl http://localhost:4000/health` returns `{"ok": true}`.

**Time estimate:** 60-90 minutes (Saturday 09:00 → 10:30)

---

## Phase 1 — Auth + First Tabung

**Goal:** A signed-in user can create a tabung and see it persisted.

**Backend**
- Drizzle schema: `users`, `sessions` (Better Auth), `tabung`, `tabung_members`
- Migration applied
- Better Auth configured with Postgres adapter
- Routes:
  - `POST /api/auth/sign-up`, `POST /api/auth/sign-in`, `POST /api/auth/sign-out` (Better Auth handles)
  - `POST /api/tabung` — create
  - `GET /api/tabung` — list user's tabung

**Frontend**
- `/sign-up` and `/sign-in` pages with shadcn `Form` + `react-hook-form` + zod
- `/dashboard` — list of user's tabung (TanStack Query fetching `GET /api/tabung`)
- Modal: "Create Tabung" form (name · monthly amount · duration months)
- After creation → invalidate query → list re-renders

**Testable outcome:**
> Open `https://kutu.domain.com` → register with email + password → land on dashboard (empty) → click "Create Tabung" → fill form → submit → tabung appears in list → reload page → tabung still there.

**Time estimate:** 3-4 hours (Saturday 10:30 → 14:30)

---

## Phase 2 — Member Invite + Join

**Goal:** A tabung creator can invite others; invitees can accept and appear on the roster.

**Backend**
- Schema additions: invite codes (`nanoid`-generated 8-char codes)
- Routes:
  - `POST /api/tabung/:id/invite` — generate invite code (creator only)
  - `POST /api/tabung/join` — accept invite code (must be authed user)
  - `GET /api/tabung/:id/members` — list members

**Frontend**
- Tabung detail page: members list + "Invite Member" button
- Invite modal: shows generated code + QR (`react-qr-code`) + shareable link
- `/join/:code` page: pre-fills code, "Join Tabung" button → success → redirect to tabung detail

**Testable outcome:**
> Creator generates invite code · copies link · opens in incognito browser · registers second account · accepts invite · roster on creator's view shows two members.

**Time estimate:** 2-3 hours (Saturday 14:30 → 17:30)

---

## Phase 3 — Contribution Flow

**Goal:** Members contribute monthly via TNG eWallet sandbox; ledger reflects.

**Backend**
- Schema: `contributions` table (member_id, tabung_id, amount, paid_at, tng_reference)
- TNG sandbox integration:
  - `POST /api/contributions/initiate` — create pending contribution, return TNG payment URL/QR
  - `POST /api/webhooks/tng` — receive callback, mark contribution as paid, update trust_score
- Idempotency keys on TNG webhook (don't double-process)

**Frontend**
- Tabung detail: per-member ledger row with "Contribute" button (only enabled if user is the member + month not yet paid)
- Click → open TNG sandbox flow → return → ledger entry appears with green checkmark
- Trust score badge updates next to member name

**Testable outcome:**
> Member clicks "Contribute RM 100" · TNG sandbox flow completes · webhook fires · ledger row turns green · trust score ticks +1 · refresh persists state.

**Time estimate:** 4-5 hours (Saturday 17:30 → 22:30)

---

## Phase 4 — Rotation Payout

**Goal:** When a cycle completes, the scheduled recipient receives the pool. Trigger via cron OR manual demo button.

**Backend**
- Schema: `rotations`, `payouts`
- Logic: when all members have contributed for the cycle, generate a `rotation` record with `recipient_member_id` and `cycle_number`
- Cron job (or manual admin endpoint for demo): `POST /api/admin/process-rotations` — finds completed cycles · creates payout record · marks rotation as paid · (in production: triggers TNG transfer to recipient)
- For demo: skip actual TNG transfer — generate `payout` record with mock TNG reference + show "Paid" status

**Frontend**
- Rotation timeline view on tabung detail page (visual: who's next, who's received)
- Payout notification toast when current user is the recipient
- "Trigger rotation" admin button (demo-only) for judges

**Testable outcome:**
> All members contribute for cycle 1 · admin clicks "Trigger rotation" · scheduled recipient sees payout notification · timeline updates · cycle 2 begins.

**Time estimate:** 3-4 hours (Sunday 09:00 → 13:00)

---

## Phase 5 — Innovation + Security pillars (split into 5a / 5b / 5c)

This is the heaviest phase — three sub-features that together prove the Innovation umbrella pitch. Owners are paired across sub-phases. Cut-line awareness: if 5a ships clean, prioritise 5b stub before chasing full 5c polish.

---

### Phase 5a — Penasihat Chat (BM-grounded conversational mode)

**Goal:** Bilingual BM-first chat grounded in the user's actual tabung state.

**Backend**
- Route: `POST /api/penasihat/chat` — receives message, fetches user's tabung context, calls Claude API with system prompt + context, streams response back via SSE
- System prompt: *"You are Penasihat, a bilingual financial advisor. Default BM. Use the user's tabung state below. Cite specific numbers. Never recommend leaving a tabung mid-cycle."*

**Frontend**
- `/penasihat` page with chat UI (shadcn `Dialog` or full-page)
- Streaming display via fetch + ReadableStream
- Quick-prompt chips: *"Patut ke aku join tabung lagi?"* · *"Apa jadi kalau aku miss bulan ni?"* · *"Bila next payout aku?"*

**Testable outcome (5a):**
> Open `/penasihat` · type *"Bila next payout aku?"* · receive streamed BM reply citing the actual rotation date from the user's tabung.

**Time estimate:** 2.5–3 hours

---

### Phase 5b — Penasihat Robo-Advisor (Innovation pillar)

**Goal:** Risk-tuned investment recommendations for surplus capital, BM-first, grounded in completed-cycle history.

**Backend**
- Route: `POST /api/penasihat/recommend` — accepts `{userId, riskProfile, surplusAmount}` → returns three recommendations (conservative · balanced · growth) with BM-first reasoning
- Hardcoded portfolio options for demo (ASNB · money-market · low-cost ETF mix · ASN equity)
- Claude API call with structured output: `{instrument, allocation%, reasoning_bm, reasoning_en, expected_return_pct, risk_band}`
- Risk profile derived from a 5-question questionnaire stored in `user_risk_profiles` table

**Frontend**
- `/penasihat/cadang` page (or modal in dashboard)
- Risk profile questionnaire (5 short questions · radio + slider) on first use
- Recommendation cards (3 across, shadcn `Card`) — each showing instrument, allocation, BM reasoning, expected return, risk band
- "Cadang" button per card — demo stub, logs the recommendation, no real broker integration

**Testable outcome (5b):**
> Member with at least one completed cycle opens *Cadang* · completes risk questionnaire · receives three recommendation cards in BM with cited instruments + allocation% + expected return · clicks one to log the demo stub.

**Time estimate:** 3.5–4 hours

---

### Phase 5c — Pengawal Scam Sentinel (Security pillar)

**Goal:** AI scam sentinel that warns the user before a TNG payment to a flagged or anomalous recipient is confirmed.

**Backend**
- Route: `POST /api/pengawal/check` — accepts `{senderUserId, recipientHandle, amount, messageContext}` → returns `{riskScore: 0–100, flags: string[], recommendation: 'allow' | 'warn' | 'block'}`
- Three-stage check:
  1. **Recipient reputation** — query a community-fed `flagged_recipients` table (seeded for demo)
  2. **Pattern match** — Claude API call with system prompt that scans message context for known scam phrasing in BM, EN, Mandarin (urgent help · investment guarantee · authority impersonation · romance bait · lottery winner)
  3. **Behavioural anomaly** — amount > 3× user median · time in unusual band · first-time recipient outside tabung circle
- New tables: `flagged_recipients` (community-fed seed), `pengawal_checks` (audit log)

**Frontend**
- Pengawal warning modal — shadcn `Dialog`, BM-first
- Triggered in:
  1. Free-form transfer surface (new — minimal UI for demo, no full transfer feature)
  2. Optional: when contributing to a tabung that includes a member with a flagged history (demo only)
- Modal shows risk score, flags as bullet points, two buttons: *"Batal"* (default focused) and *"Teruskan, aku faham risiko"*
- An overridden warning logs to `pengawal_checks` for audit

**Testable outcome (5c):**
> User attempts to transfer RM 800 to a seeded flagged recipient · Pengawal modal appears in BM with concrete red flags · user can override but the override is logged.

**Time estimate:** 3.5–4 hours

---

### Phase 5 totals

- **Combined estimate:** ~10–11 hours (5a + 5b + 5c)
- **Hard requirement:** 5a (Penasihat chat) — without it, the AI brand has no anchor
- **Pitch requirement:** 5b (robo-advisor) + 5c (Pengawal) — without these, the Innovation umbrella is a single-pillar pitch
- **Order to ship:** 5a → 5c → 5b. Pengawal demo lands before Robo-Advisor because Pengawal has fewer dependencies (no questionnaire flow) and pitch slide 5 sequences Penasihat-chat → Penasihat-robo → Pengawal anyway.

**Cut-lines for Phase 5:**

If Phase 4 cut to manual button → Phase 5 has full Sunday morning + early afternoon → ship all three.

If Phase 4 ate Sunday morning → ship 5a + 5c only. 5b becomes "demoed in repo, not on stage". Pitch deck slide 5 grid drops Robo-Advisor screenshot to 5×1 layout.

If Phase 5a + 5c stable but 5b not started by Sunday 14:00 → cut 5b entirely. Pitch reframes Innovation pillar around Penasihat-chat as the AI-driven advisor (still valid Innovation framing, narrower scope).

---

## Phase 6 — Pitch Polish

**Goal:** Demo deck + video + on-stage rehearsal.

**Tasks (parallel)**
- **Ijam:** finalize 8-slide pitch deck · script the 4-min narration · rehearse twice
- **MatNep:** apply brand polish · typography hierarchy · slide composition
- **Akmal:** UI polish · loading states · error states · empty states · final animations
- **Mung:** deploy to EC2 · run final migrations · seed demo data · smoke-test all flows
- **Kairu:** verify all 6 phases gates passed · cut scope ruthlessly if anything wobbly

**Testable outcome:**
> Live URL accessible from any laptop · 4-min demo runs without breakage · pitch deck exported to PDF · demo video uploaded · all submission fields complete on FINHACK portal.

**Time estimate:** 3-4 hours (Sunday 16:00 → 19:30, judging at 20:00)

---

## Cut-Lines (If Behind Schedule)

If by Saturday evening Phase 3 isn't done:

1. **Cut Phase 5 (AI Penasihat)** first. Tabung lifecycle without AI is still a complete demo.
2. **Cut Phase 4 (Rotation auto-trigger)** second. Manual admin button + clearly labeled "Demo: trigger cycle" is acceptable.
3. **Phases 1-3** are non-negotiable — they ARE the product.

If by Sunday morning Phase 4 isn't done:

1. Hardcode rotation payout as a stub function returning success.
2. Show the timeline visualization as if cycles are running.
3. Pitch around "auto-rotation engine" without proving it live — show the schedule visually instead.

---

## Anti-Patterns (Kairu's Refusal List)

The following will trigger Kairu's Tangga Hidup to crack on contact:

- "Backend in Phase X, frontend in Phase X+1"
- "useEffect for data fetching"
- "as any" type casts
- "We'll add migrations later"
- "Just disable Better Auth for now to ship"
- "We'll handle errors in Phase 7"
- Any phase without a Testable Outcome line
- Any commit message that doesn't describe what shipped

---

## Phase Status (Track in This File · Update Live)

| Phase | Status | Started | Completed | Tested by |
|---|---|---|---|---|
| 0 — Stack Activation | 🟡 Scaffolded (needs `npm install` + verify) | 2026-04-25 ~06:30 | — | — |
| 1 — Auth + First Tabung | ⏳ Pending | — | — | — |
| 2 — Member Invite + Join | ⏳ Pending | — | — | — |
| 3 — Contribution Flow | ⏳ Pending | — | — | — |
| 4 — Rotation Payout | ⏳ Pending | — | — | — |
| 5a — Penasihat Chat | ⏳ Pending | — | — | — |
| 5b — Penasihat Robo-Advisor | ⏳ Pending | — | — | — |
| 5c — Pengawal Scam Sentinel | ⏳ Pending | — | — | — |
| 6 — Pitch Polish | ⏳ Pending | — | — | — |

Phase 0 pre-scaffold details live in [QUICKSTART.md](./QUICKSTART.md). Team runs `npm install` in both repos + `docker compose -f docker-compose.dev.yml up -d` to reach the testable outcome.

Update this table as phases complete. Symbols: ⏳ pending · 🟡 in progress · ✅ done · ⚠️ blocked.
