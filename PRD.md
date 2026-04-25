# Product Requirements Document — Kutu Digitizer

| Field | Value |
|---|---|
| **Product** | Kutu Digitizer |
| **Tagline** | *Three pillars on one TNG rail.* |
| **Submission** | TNG Digital FINHACK 2026 · Innovation Track |
| **Event date** | 25–26 April 2026 · Grand Summit, CCEC, Bangsar South City, Kuala Lumpur |
| **Document version** | 1.0 |
| **Last updated** | 2026-04-25 |
| **Document owner** | Ijam (Narrative Spine) |
| **Engineering owner** | Mung (Foundation-Keeper) |
| **Design owner** | MatNep (Orthodox Eye) |
| **PM owner** | Kairu (Ladder-Keeper) |

---

## 1. Executive Summary

Kutu Digitizer is a TNG eWallet-native platform that brings communal rotating savings (kutu) to the unbanked while layering an AI robo-advisor and an AI scam sentinel on top of the same rail. The platform consists of three pillars — **Kutu** (savings), **Penasihat** (growth), and **Pengawal** (security) — sharing a single Postgres ledger, a single Better Auth identity layer, a single TNG eWallet integration, and a single Claude API for the AI features. All three pillars together address the TNG FINHACK 2026 Innovation track brief verbatim.

The platform is built for the **15% of adult Malaysians who remain unbanked** but already carry TNG eWallet — and for the millions more who practise rotating savings outside formal financial systems. It honours an existing cultural practice rather than replacing it, and it surfaces invisible financial discipline into a record that compounds over time.

---

## 2. The Problem

### 2.1 Practice without record

Rotating savings circles — *kutu* in Malaysian, *arisan* in Indonesia, *ajo* in Yoruba, *susu* in the Caribbean — are practised by an estimated 2.5 billion people worldwide. The practice is ancient, communally enforced, and culturally trusted. In Malaysia, an estimated 15% of adults remain unbanked or underbanked (Bank Negara Malaysia, Financial Inclusion Report 2024); a substantial fraction of them practise kutu via WhatsApp groups and Excel sheets.

Their discipline is invisible to credit bureaus, social-security systems, and fintech evaluations. When these participants apply for housing loans, business financing, or even formal employment background checks, they appear as if they have **no financial history**, despite years of flawless monthly contributions.

The practice is sound. The infrastructure is missing.

### 2.2 No path from saving to growth

Even a member who completes a tabung successfully receives the payout in a lump sum and has no obvious next step. They lack risk-tuned investment guidance in their own language, grounded in their actual financial state. Existing robo-advisors (Wealthsimple, StashAway, Betterment) target users who already have brokerage relationships and English-language financial literacy.

A vulnerable population that just demonstrated saving discipline is left at the threshold of formal investment with no bridge.

### 2.3 Targeted scam exposure

The same vulnerable population is disproportionately targeted by scam operators. Scams arrive in the user's native language (BM, Mandarin, Tamil) and exploit the trust patterns of communal financial culture (*"kawan kau invest dah lima ribu seminggu"*). Existing fraud detection is bank-side, English-language, and fires too late — after the transfer is initiated.

There is no pre-payment guardrail in the user's own language, sitting between intent and confirmation, that pattern-matches the messages and recipients flagged by community knowledge.

### 2.4 Three problems, one rail

All three problems exist for the same population, on the same eWallet (TNG), in the same cultural context. Solving them piecemeal — three separate apps, three separate authentications, three separate trust relationships — is the gap. A single platform addressing all three under one TNG rail is the opportunity.

---

## 3. Mission & Vision

### Mission

Bring the kutu onto rails the unbanked already use, layer growth and protection on the same rail, and surface invisible financial discipline into a record that compounds.

### Vision (12-month outlook)

Kutu Digitizer becomes the default platform for community savings circles in Malaysia, with a community-fed scam database serving as the country's most accurate informal-payment fraud signal, and a portable trust score recognised by Bank Negara as a credit-history input for traditionally invisible populations.

### Hackathon scope (48-hour window)

Ship a working prototype that demonstrates all three pillars end-to-end, with a 4-minute demo that lands on stage and a deck that explains the umbrella story.

---

## 4. Target Users

### 4.1 Primary persona — Mak Cik Aminah (Active kutu participant, 47)

- Operates two kutu circles via WhatsApp (RM 200/month and RM 500/month)
- Has TNG eWallet (uses for groceries, parking, Touch'n Go reload)
- Has SBI savings account but never applied for credit
- Speaks BM primarily, switches to English for transactions
- Trust mode: trusts neighbours and family, suspicious of "fintech" branding
- Smartphone: mid-tier Android (5+ years)

### 4.2 Secondary persona — Adik Faiz (Young earner, 24)

- New gig worker (Grab/Foodpanda) without traditional payslip
- Has TNG (essential for daily) and one bank account
- Wants to save and invest but has been declined for credit
- Tries kutu through workplace circle (RM 100/month with 5 colleagues)
- BM/EN bilingual, comfortable with apps
- Smartphone: current generation

### 4.3 Tertiary persona — Cik Suri (Single mother, 35)

- Targeted twice by phone scams in past year (one successful, lost RM 800)
- Uses TNG for daily transfers to family
- Practises kutu (RM 50/month with 6 neighbours) for school expenses
- Speaks BM primarily; her children explain English app interfaces to her
- Trust mode: cautious, asks family before any large transfer

### 4.4 What the personas have in common

- TNG eWallet already installed and used regularly
- BM is the comfortable register for emotional/financial decisions
- Existing trust patterns are community-anchored, not institution-anchored
- Targeted by scams in their native language
- Excluded from formal financial advice products

---

## 5. Solution Overview — The Three Pillars

### Pillar 1 — Kutu (Financial Inclusion-aligned)

A digital ROSCA platform on TNG eWallet rails. Auto-deduct monthly contributions, transparent ledger, visible trust score that follows the member across tabung. The practice members already know — formalised, recorded, made portable.

### Pillar 2 — Penasihat (Innovation-aligned)

A bilingual AI advisor with two operating modes:

- **Chat mode** — answers tabung-specific questions in BM, grounded in the user's actual numbers (e.g., *"Bila next payout aku?"* answered with the real rotation date).
- **Robo-advisor mode** — for members who completed at least one tabung cycle, presents three risk-tuned investment recommendations (conservative · balanced · growth) with BM-first reasoning citing real instruments (ASNB, money-market, low-cost ETFs).

### Pillar 3 — Pengawal (Security-aligned)

An AI scam sentinel that fires before TNG payment confirmation. Three-stage check:

1. **Recipient reputation** — community-fed flagged-recipient database
2. **Pattern match** — Claude-powered scan of message context for known scam phrasing (BM, EN, Mandarin)
3. **Behavioural anomaly** — amount vs. user median, time, first-time recipient outside tabung circle

Output: a BM-first warning modal that the user can override but not bypass silently. Every override is logged for audit.

### The umbrella

All three pillars share:

- One TNG eWallet integration (single rail)
- One Postgres ledger (single source of truth)
- One Better Auth identity (single sign-on)
- One Claude API account (shared AI infrastructure)
- One brand voice (Cormorant Garamond + Inter, BM-first register, songket geometric motifs)

Three problems. One platform. One rail. That is the Innovation umbrella.

---

## 6. Goals & Success Metrics

### Hackathon goals (48-hour window)

| Goal | Measure | Threshold |
|---|---|---|
| Working prototype | All 3 pillars demo-able end-to-end | Pass / Fail |
| 4-minute pitch | Stage delivery within strict time | ≤ 4:00 |
| Live URL | Public deployment accessible from any laptop | URL responds in < 3s |
| Submission complete | All FINHACK portal fields filled | Pass / Fail |
| Track placement | Top-3 in Innovation track | Stretch goal |

### Product success metrics (post-hackathon, 6-month outlook)

| Metric | Target | Rationale |
|---|---|---|
| Active tabung created | 100 | Indicates real adoption, not just curiosity |
| Members per tabung (median) | 6 | Healthy circle size for risk distribution |
| Cycle completion rate | > 95% | The practice's strength is reliability |
| Penasihat queries per active user (month) | ≥ 4 | Indicates engagement beyond setup |
| Pengawal warnings shown | Tracked | Proxy for fraud prevented |
| Pengawal override rate | < 10% | If users override often, signal-to-noise too low |
| Trust score continuity | > 80% of members complete second tabung | Score is portable and useful |

### Quality gates (must hold throughout)

- WCAG 2.2 AA contrast on all text
- BM-first register on every user-facing string (English fallback only when BM unnatural)
- 65ch maximum body-copy measure
- All money math in integer cents — no floating point
- All TNG webhooks HMAC-verified before any state mutation
- Append-only payment ledger (no destructive updates)

---

## 7. Track Submission — Innovation

### 7.1 Why Innovation (and not Financial Inclusion)

The TNG FINHACK 2026 Innovation track brief reads verbatim:

> *"Build a secure, AI-driven eWallet platform that enhances digital payment transparency, automates regulatory compliance, and delivers real-time financial insights for users and regulators."*

This describes the three-pillar platform literally. Financial Inclusion would have constrained the pitch to a single pillar (Kutu) and required dropping the AI advisory and security framing. Innovation lets all three pillars sit under one submission.

### 7.2 Track brief mapping

| Brief keyword | Pillar that delivers |
|---|---|
| **Secure** | Pengawal — pre-payment scam detection |
| **AI-driven** | Penasihat (robo-advisor + chat) + Pengawal (pattern matching) |
| **eWallet platform** | Single TNG integration shared across pillars |
| **Transparency** | Kutu ledger — every member sees every transaction |
| **Regulatory compliance** | Append-only ledger + Pengawal audit trail + portable trust score (regulator-friendly) |
| **Real-time insights for users** | Penasihat chat grounded in live tabung state |
| **Real-time insights for regulators** | Aggregate flow data (anonymised) — roadmap, not in MVP |

### 7.3 Track rules honoured

- Single track submitted (Innovation)
- Solution within track scope (no out-of-track features submitted)
- Per-track judging respected (we do not claim simultaneous Financial Inclusion or Security & Fraud submission)

---

## 8. User Stories

### 8.1 Kutu pillar

**US-K1 — Create a tabung**
> As a registered member, I want to create a tabung with a name, monthly amount, and duration, so that I can invite my circle to join.
- **Acceptance:** Form validates monthly amount > 0 and duration in [3, 24] months. Tabung persists. Creator becomes member 1 with rotation order 1. Visible in dashboard after reload.

**US-K2 — Invite members**
> As a tabung creator, I want to generate an invite code and share it as a link or QR, so that my circle members can join without manual onboarding.
- **Acceptance:** 8-character invite code generated via nanoid. Shareable link `/join/<code>` works in incognito. QR rendered client-side via `react-qr-code`. Invitee registers + accepts → roster updates within 1 refresh.

**US-K3 — Contribute monthly**
> As a tabung member, I want to make my monthly contribution via TNG sandbox, so that the ledger records my participation.
- **Acceptance:** Contribute button enabled only if user is the member AND month not yet paid. Click → TNG sandbox flow → webhook fires → ledger row turns green within 2s of webhook receipt. Trust score ticks +1. Reload persists state.

**US-K4 — Receive scheduled payout**
> As the next-rotation member, I want to receive the pool when all members have contributed, so that the cycle continues.
- **Acceptance:** When all members `paid` for cycle N, a `rotations` row is created with `recipient_member_id = next-in-rotation`. A `payouts` row is created with TNG payout reference (sandbox/demo). Recipient sees notification. Timeline updates. Cycle N+1 begins.

**US-K5 — See visible trust score**
> As a member, I want my trust score to reflect my paid-on-time history, so that I have a portable reputation.
- **Acceptance:** Trust score = count of paid contributions across all tabung. Displayed beside name in roster. Updates immediately on confirmed payment. Visible to other members in the same tabung.

### 8.2 Penasihat pillar

**US-P1 — Ask Penasihat about my tabung (Phase 5a)**
> As a member, I want to ask Penasihat questions in BM about my tabung state, so that I get advice grounded in my actual numbers.
- **Acceptance:** Open `/penasihat`. Type *"Bila next payout aku?"*. Streamed BM reply citing the actual rotation date for that member's tabung. Generic questions outside tabung scope receive a BM-first redirect.

**US-P2 — Get investment recommendations (Phase 5b)**
> As a member with at least one completed cycle, I want three risk-tuned investment recommendations in BM, so that I know what to do with my payout.
- **Acceptance:** Open `/penasihat/cadang`. First-time: 5-question risk questionnaire. After: three recommendation cards (conservative · balanced · growth) showing instrument, allocation%, expected return, BM reasoning. Click one to log the demo stub.

**US-P3 — Re-take risk questionnaire**
> As a member whose financial situation changed, I want to update my risk profile, so that future recommendations match my current state.
- **Acceptance:** "Update profile" button on `/penasihat/cadang`. Re-completes questionnaire. New `risk_band` saved. Subsequent recommendations use the new band.

### 8.3 Pengawal pillar

**US-G1 — Get warned before sending money to a flagged recipient (Phase 5c)**
> As a TNG user about to confirm a transfer, I want Pengawal to warn me if the recipient is flagged or the message context is suspicious, so that I can stop before the money leaves my hand.
- **Acceptance:** When confirming a transfer (free-form or contribution to a non-tabung member), `POST /api/pengawal/check` runs. If `riskScore ≥ 60`, modal appears in BM listing concrete flags. User sees "Batal" (default-focused) and "Teruskan, aku faham risiko". Override is logged.

**US-G2 — See why a recipient was flagged**
> As a user receiving a warning, I want to see specific red flags, so that I can decide informedly.
- **Acceptance:** Modal lists up to 5 flag reasons in BM (e.g., *"Akaun penerima baru join 2 hari"*, *"5 aduan komuniti"*, *"Mesej ada pattern 'investment guarantee 30%'"*). No vague *"high risk"* language without a reason.

**US-G3 — Audit my Pengawal interactions**
> As a member, I want to see my Pengawal warning history, so that I know what was caught.
- **Acceptance:** `/pengawal/log` shows all checks for the user (read-only audit). Each row: timestamp, recipient handle, risk score, recommendation, override (yes/no).

### 8.4 Cross-pillar

**US-X1 — One sign-on, three pillars**
> As a member, I want to sign in once and access all three pillars, so that I don't manage three identities.
- **Acceptance:** Better Auth session covers all routes. `/`, `/penasihat`, `/pengawal/log` all share the same authenticated identity.

**US-X2 — One ledger, three pillars**
> As a member, I want my Penasihat advice and Pengawal checks grounded in my actual tabung history, so that the AI knows my context.
- **Acceptance:** Penasihat reads `tabung_members`, `contributions`, `rotations`, `payouts`. Pengawal reads `users.medianTransfer` and recent recipient history. Both AI features reference live data, not stale snapshots.

---

## 9. Functional Requirements

### 9.1 Authentication & Identity

- **F-A1** Email + password registration (Better Auth + argon2)
- **F-A2** Session via HttpOnly Secure SameSite=Lax cookie
- **F-A3** Sign-out invalidates session server-side
- **F-A4** Protected routes hide chrome before hydration to avoid flash

### 9.2 Tabung lifecycle

- **F-T1** Create tabung: name (≤ 50 chars), monthly amount in cents (positive integer), duration in months [3, 24]
- **F-T2** Generate 8-char invite codes via nanoid; codes are tabung-scoped
- **F-T3** Accept invite: authenticated user joins via `/join/:code`
- **F-T4** Member roster visible to all members in the tabung
- **F-T5** Tabung dashboard lists all tabung the user belongs to

### 9.3 Contribution + ledger

- **F-C1** Initiate contribution: backend creates `pending` contribution + TNG payment intent + returns payment URL
- **F-C2** TNG webhook: HMAC-verified before any state change; idempotency key prevents double-processing
- **F-C3** On confirmed payment: contribution `pending → paid`; trust score increments; ledger UI updates
- **F-C4** Contribution row is append-only after `paid` (no destructive updates)
- **F-C5** Ledger displays per-member rows for the cycle with status badges

### 9.4 Rotation engine

- **F-R1** When all members `paid` for cycle N, create `rotations` row with `recipient = next-in-order`
- **F-R2** Create `payouts` row with TNG payout reference (sandbox/demo)
- **F-R3** Notify recipient via in-app banner
- **F-R4** Increment cycle counter; rotation order advances
- **F-R5** Demo button "Trigger rotation" available for judges (production: cron-driven)

### 9.5 Penasihat (chat — 5a)

- **F-PC1** `POST /api/penasihat/chat`: body `{ message: string }`, requires auth
- **F-PC2** Backend fetches user's tabung context (active tabung, completed cycles, next payout)
- **F-PC3** Claude API streamed call with locked system prompt (BM-first, tabung-grounded)
- **F-PC4** Response streamed to client via SSE
- **F-PC5** Quick-prompt chips on `/penasihat` page: *Patut ke aku join tabung lagi?* · *Apa jadi kalau aku miss bulan ni?* · *Bila next payout aku?*

### 9.6 Penasihat (robo-advisor — 5b)

- **F-PR1** Risk questionnaire: 5 questions (multiple-choice + slider), persisted to `user_risk_profiles`
- **F-PR2** `POST /api/penasihat/recommend`: body `{ surplusAmount: int }`, requires auth + completed risk profile + at least one completed cycle
- **F-PR3** Backend assembles context (risk band, completed cycles, instrument list); calls Claude with structured-output prompt
- **F-PR4** Response: 3 recommendations as `{ instrument, allocation%, reasoning_bm, reasoning_en, expected_return_pct, risk_band }`
- **F-PR5** Recommendations rendered as 3 shadcn `Card`s with BM reasoning + allocation + expected return
- **F-PR6** "Pilih" button logs recommendation to `recommendation_taken` (demo stub, no real broker)

### 9.7 Pengawal (scam sentinel — 5c)

- **F-PG1** `POST /api/pengawal/check`: body `{ recipientHandle, amount, messageContext }`
- **F-PG2** Three-stage signal collection:
  1. `flagged_recipients` table query
  2. Claude API pattern-match on `messageContext` (BM/EN/Mandarin)
  3. Behavioural anomaly check (amount vs. median, time, first-time recipient)
- **F-PG3** Risk score combination: weighted sum, output 0–100
- **F-PG4** Recommendation: `allow` (< 30) | `warn` (30–79) | `block` (≥ 80, soft-blocked with override)
- **F-PG5** All checks logged to `pengawal_checks` (audit) regardless of outcome
- **F-PG6** Warning modal in BM with concrete flags listed
- **F-PG7** Override action logs to `pengawal_overrides`; cannot bypass without explicit click

### 9.8 Brand & visual surface

- **F-B1** Cormorant Garamond for display + headings (font lock)
- **F-B2** Inter for body (font lock)
- **F-B3** JetBrains Mono for monetary figures (font lock, tabular figures)
- **F-B4** Brand palette tokens (BM-first names: tabung-gold, tabung-maroon, tabung-cream, etc.)
- **F-B5** 12-column fluid responsive grid · 8pt baseline · 65ch body measure
- **F-B6** All custom heritage glyphs structured-geometric (diamond-within-diamond, songket-derived) — no floral baroque

---

## 10. Non-Functional Requirements

### 10.1 Performance

- Frontend Time-to-Interactive < 3s on a fresh laptop on conference WiFi
- API p95 < 500ms for non-AI routes
- Penasihat chat first token < 2s; full response < 6s
- Pengawal check synchronous response < 800ms (no streaming)

### 10.2 Security

- All passwords hashed with argon2 (Better Auth default config)
- Sessions HttpOnly Secure SameSite=Lax
- TNG webhooks HMAC-verified before any state mutation
- Pengawal override action requires explicit user click (no silent default)
- Append-only payment ledger (no DELETE, no destructive UPDATE)
- No PII passed to Claude API beyond first name + tabung context numbers

### 10.3 Accessibility

- WCAG 2.2 AA contrast on all text (4.5:1 body · 3:1 large)
- Keyboard navigation for every interactive surface
- Focus rings visible (tabung-gold)
- Motion-reduction respected (`prefers-reduced-motion`)
- Alt text on every image
- BM-first labels with EN supplemental where needed

### 10.4 Privacy

- Member identity visible only within their own tabung
- Penasihat does not log conversation content beyond audit metadata
- Pengawal logs `pengawal_checks` for audit but does not retain raw `messageContext` beyond 30 days (production policy; demo retains for inspection)
- No third-party tracking pixels in MVP

### 10.5 Bilingual (BM-first)

- Default register: BM with natural EN code-switch
- Every Penasihat response defaults to BM
- Every Pengawal warning surfaces in BM
- English fallback only where BM phrasing is unnatural (e.g., technical instrument names)
- *"Tutur protocol"* — emotional/cultural beats in BM, technical nouns in EN

### 10.6 Resilience

- Graceful degradation if TNG sandbox is unreachable: contribution flow shows specific error and retries
- Graceful degradation if Claude API is rate-limited: Penasihat shows "Penasihat sedang sibuk, cuba lagi sebentar" and falls back; Pengawal proceeds with non-AI signals (still warns based on flagged_recipients + behavioural)
- Database connection failures surface as 503 with retry hint, not 500

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
        [ TNG eWallet API ] · [ Claude API ] · [ AWS S3 ]
```

Full mermaid diagrams + ER diagram: [ARCHITECTURE.md](./ARCHITECTURE.md).

Tech stack inventory (60+ items): [TECH-STACK.md](./TECH-STACK.md).

---

## 12. Data Model (Summary)

### Core (Phases 0–4)

`users` · `sessions` · `tabung` · `tabung_members` · `contributions` · `rotations` · `payouts`

### Phase 5 additions

`user_risk_profiles` · `penasihat_recommendations` · `flagged_recipients` · `pengawal_checks` · `pengawal_overrides`

Key invariants:

- Money columns are integer cents (never float)
- `contributions.status` is monotonic (`pending → paid`); never reverses
- `rotations` exists only after all members of the cycle are `paid`
- `pengawal_checks` is append-only audit
- `flagged_recipients` is community-fed (seeded for demo)

Full ER diagram: [ARCHITECTURE.md](./ARCHITECTURE.md) → Section 8.

---

## 13. Build Phases & Timeline

The 48-hour window is divided into 7 phases (Phase 0 through 6). Phase 5 splits into 5a, 5b, 5c per pillar feature. Phase definitions, testable outcomes, and ownership: [DEVELOPMENT-PLAN.md](./DEVELOPMENT-PLAN.md).

| Window | Phases targeted |
|---|---|
| Sat 09:00–10:30 | Phase 0 (stack activation) — pre-scaffolded; team verifies |
| Sat 10:30–14:30 | Phase 1 (auth + first tabung) |
| Sat 14:30–17:30 | Phase 2 (invite + join) |
| Sat 17:30–22:30 | Phase 3 (contribution flow) |
| Sun 09:00–13:00 | Phase 4 (rotation payout) |
| Sun 13:00–18:00 | Phase 5a (Penasihat chat) → 5c (Pengawal) → 5b (Robo-Advisor) |
| Sun 16:00–19:30 | Phase 6 (pitch polish — parallel with 5 tail) |
| Sun 20:00 | Judging |

Stand-ups: Sat 09:00, Sat 21:00, Sun 09:00, Sun 13:00.

Phase advancement: gated by `/maji-gate` (Kairu's ladder). Testable outcome must pass on a machine other than the author's. See [maji-core/protocols/phase-gate.md](./maji-core/protocols/phase-gate.md).

---

## 14. Out of Scope (Hackathon Window)

The following are deliberately excluded from the 48-hour MVP. They are roadmap items for post-hackathon, not "didn't have time" gaps.

| Item | Why deferred |
|---|---|
| Real broker integration for Robo-Advisor execution | Demo stub sufficient for pitch; production needs broker partnership |
| Live community-fed scam list ingestion | Seeded list demonstrates the mechanism; production needs partner data feed |
| Mobile app | Web responsive is sufficient for MVP; native app is a 6-month effort |
| Multi-currency / international tabung | Malaysia-only for v1 |
| Insurance integrations (takaful) | Adjacent product space; later integration |
| Regulator API for aggregated flow data | Roadmap item; requires regulatory engagement before architecture |
| Multi-region deployment | One region (ap-southeast-1) is sufficient for MVP |
| WhatsApp / Telegram bot integration | Not in scope; web-first |
| Voice interface for Penasihat | Future accessibility feature |
| Automated KYC beyond Better Auth | Better Auth + TNG-bound identity is sufficient for MVP |
| Group chat within tabung | Communication happens out-of-band (WhatsApp); we are ledger + schedule, not messenger |

---

## 15. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| TNG sandbox not provisioned by Day 1 | Medium | High | Backend abstracts payment provider; mock TNG client returns success in dev; switch when keys arrive |
| Claude API rate-limit hit during demo | Low | High | Pre-cache common Penasihat responses for demo; Pengawal degrades gracefully to non-AI signals |
| Phase 4 (rotation) eats Sunday morning | High | Medium | Cut to manual admin button (acceptable per development plan); preserve Phase 5 window |
| Phase 5b (Robo-Advisor) too ambitious | Medium | Low | Sub-feature is cuttable; reframe Innovation pillar around Penasihat-chat alone; pitch deck slide 5 drops one screenshot |
| Pengawal pattern match returns false positives in demo | Medium | High | Pre-seed `flagged_recipients` with one known-bad handle for demo; tune Claude prompt for high-precision over high-recall in MVP |
| Demo machine fails on stage | Low | Critical | Backup video pre-recorded; pitch narration self-contained without screen |
| Pitch overrun (> 4 minutes) | Medium | High | Strict timer rehearsals (twice Sunday morning); recovery phrases per slide |
| Member confusion about three pillars | Medium | Medium | Slide 3 is the "three pillars on one rail" anchor; slide 4 maps brief verbatim; pitch repeats *"tiga tiang, satu landasan"* three times |
| BM register inconsistencies | Low | Medium | Tutur-protocol review by Ijam pre-pitch; quick-prompt chips and warning copy reviewed line-by-line |
| HMAC signature verification fails on TNG webhooks | Medium | Critical | Test thoroughly in Phase 3; explicit error logging; fallback rejects unverified webhooks (correct behaviour) |

---

## 16. Open Questions (resolve before Day 2)

1. **TNG sandbox key arrival time** — when do organisers distribute? If late, contribution flow demo uses mocked client.
2. **Pitch length specification** — official site does not state the on-stage pitch duration explicitly. Memory says 4 minutes; verify at organiser briefing on Day 1.
3. **Demo room setup** — projector aspect ratio, audio output, backup laptop policy. Confirm with FINHACK ops.
4. **Stage demo network** — venue WiFi reliability for live API calls. Have a hotspot backup.
5. **Sponsor booth deliverable** — does each team submit a one-pager or just the deck? Ask organisers Day 1.
6. **Judging rubric weights** — are Innovation track judges weighting differently from Financial Inclusion? Ask Day 1 if criteria sheet available.
7. **Post-hackathon IP terms** — confirm hackathon T&Cs; the team retains rights to the codebase, but verify any sponsor-introduced clauses.

---

## 17. Stakeholders & Team

### Core team (R2-D2 · KrackedDevs)

| Member | Role | Codename | Domain |
|---|---|---|---|
| **Ijam** (Zarul Izham) | Business Pitch Lead · Product Owner | *Narrative Spine* | Pitch · positioning · stakeholder framing · final product call |
| **Mung** | Backend Lead | *Foundation-Keeper* | Hono · Drizzle · Postgres · Better Auth · TNG · Pengawal backend |
| **Akmal** | Frontend Lead | *Surface-Weaver* | Next.js · Tailwind · shadcn/ui · TanStack Query · interaction craft |
| **Kairu** | Product Manager | *Ladder-Keeper* | Phase plan · testable outcomes · scope guard · phase-gate verifier |
| **MatNep** | Classical Designer | *Orthodox Eye* | BRAND · pitch deck design · typography · accessibility-as-craft |

Per-member role cards: [maji-core/heroes/](./maji-core/heroes/).

### External stakeholders (post-hackathon roadmap)

- TNG Digital — eWallet rail provider, hackathon host, potential partner for live data
- Bank Negara Malaysia — financial inclusion desk, potential regulatory engagement
- Securities Commission Malaysia — digital-product sandbox, potential broker-side regulatory review
- Sponsor partners (Alibaba Cloud, OceanBase, VISA, AWS) — infrastructure credits + scale-up partnerships

### Team conventions

- maji-core slash commands as the daily coordination interface (`/maji-onboard`, `/maji-whoami`, `/maji-phase`, `/maji-gate`, `/maji-pair`, `/maji-handoff`)
- Akal protocol on every code change ([maji-core/protocols/akal.md](./maji-core/protocols/akal.md))
- Jimat penuh register default ([maji-core/protocols/jimat.md](./maji-core/protocols/jimat.md))
- Manual commits — AI never `git commit` automatically
- Personal memory committed to git (team visibility on `git pull`)

---

## 18. Appendix

### 18.1 Reference reading

- [README.md](./README.md) — repo entry point + quickstart tutorial
- [WORLD.md](./WORLD.md) — manifesto · cultural anchor · 3-pillar narrative
- [ARCHITECTURE.md](./ARCHITECTURE.md) — system architecture · sequence diagrams · ER diagram
- [TECH-STACK.md](./TECH-STACK.md) — 60-item stack inventory · install commands · version locks
- [BRAND.md](./BRAND.md) — visual identity · palette · typography · iconography · voice
- [TEAM.md](./TEAM.md) — roster · phase ownership · norms
- [DEVELOPMENT-PLAN.md](./DEVELOPMENT-PLAN.md) — 7-phase build plan · cut-line strategy · phase status table
- [QUICKSTART.md](./QUICKSTART.md) — 10-minute bootstrap for new team members
- [docs/pitch-deck.md](./docs/pitch-deck.md) — 8-slide deck content
- [docs/pitch-narration.md](./docs/pitch-narration.md) — 4-minute on-stage script

### 18.2 Comparable references

| Reference | Pillar | What we learn |
|---|---|---|
| MoneyFellows ($31M raised, Egypt) | Kutu | ROSCA digitisation is fundable on local rails |
| Esusu ($130M, USA, ~$1B valuation 2023) | Kutu | Trust-score aspect translates to credit-bureau impact |
| Stokfella (South Africa) | Kutu | Stokvel digitisation — same model, different cultural anchor |
| Money Club (~$17M, India) | Kutu | UPI rails parallel to TNG rails — pattern works |
| Wealthsimple (Canada, USD 5B+) | Penasihat | Robo-advisor productisation; UX for non-investors |
| StashAway (SEA, regional leader) | Penasihat | BM/EN bilingual robo-advisor; SEA-specific risk profiles |
| Betterment (USA) | Penasihat | Risk-tuned recommendations for retail; questionnaire UX |
| Bolster (USA, $40M+) | Pengawal | Bot/scam detection at scale |
| Sift (USA, $50M+) | Pengawal | Real-time fraud signals |
| Trustpair (Global, $47M) | Pengawal | Vendor verification before payment |

### 18.3 FINHACK 2026 official details (verified)

- **Event:** TNG Digital FINHACK 2026
- **Date:** 25–26 April 2026 (Saturday–Sunday)
- **Venue:** Grand Summit, CCEC, Bangsar South City, Level M1, The Vertical, No. 8, Jalan Kerinchi, 59200 Kuala Lumpur
- **Day 1:** 08:00–19:30 (24-hour hacking)
- **Day 2:** 08:00–17:00 (submission + semi-final + finals)
- **Tracks:** Financial Inclusion · Security & Fraud · **Innovation (our submission)** — pick one only
- **Prize:** RM 100,000+ pool
- **Registration:** closed (deadline 1 April 2026)
- **Eligibility:** Malaysian citizens, by invitation
- **Free to register**

Source: <https://www.tngdigitalfinhack.com/>

### 18.4 Document conventions

- "BM" = Bahasa Melayu
- "EN" = English (in technical/code contexts)
- "TNG" = Touch 'n Go (eWallet provider)
- "ROSCA" = Rotating Savings and Credit Association
- "Tabung" = the savings pool itself (Malay)
- "Kutu" = the rotating savings practice (Malay informal)
- "Penasihat" = advisor (Malay) — the AI brand
- "Pengawal" = guardian (Malay) — the security brand

---

*PRD v1.0 · 2026-04-25 · authored by team R2-D2 with Prime AI assistance · Innovation track submission · TNG FINHACK 2026.*

*"Tiga tiang, satu landasan."*
