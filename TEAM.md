# Team

**TNG FINHACK 2026 · Kutu Digitizer**

---

## Roster

| Member | Role | Primary Surface |
|---|---|---|
| **Ijam (Zarul Izham)** | Business Pitch Lead · Product · Voice on stage | Pitch deck · live demo narration · stakeholder framing |
| **Mung** | Backend · Postgres · Better Auth · AWS SDK | API · schema · migrations · cron · AWS S3 integration |
| **Akmal** | Frontend · Next.js · Interaction Craft | UI · forms · animations · TanStack Query wiring |
| **Kairu** | Product Manager · Phase Discipline | Phase plan · testable outcomes · scope guard |
| **MatNep** *(joining as designer)* | Classical Design Direction · Brand & Typography | Visual identity · pitch-deck design · heritage motif translation |

---

## Working Mode

- **Co-located** at Bangsar South CCEC for 25-26 April
- **Async deliverables** review by MatNep (collaborating remotely or co-located)
- **Communication** primary on WhatsApp group · technical via shared GitHub issues + Slack/Discord (whichever team prefers)
- **Decision authority** Ijam (product) · Kairu (process) · Mung (backend technical) · Akmal (frontend technical)

---

## Phase Ownership

Mapped to Kairu's vertical-slice discipline (every phase = backend + frontend + testable outcome together):

| Phase | Pillar | Goal | Lead | Support |
|---|---|---|---|---|
| **0 — Stack Activation** | foundation | Repo init · Docker compose up · first migration | Mung · Akmal | Kairu (gate) |
| **1 — Auth + First Tabung** | Kutu | Register · login · create tabung · persist · render | Mung · Akmal | Ijam (copy) · MatNep (visual) |
| **2 — Member Invite + Join** | Kutu | Invite link · QR · accept · roster appears | Akmal · Mung | MatNep (invite UI) |
| **3 — Contribution Flow** | Kutu | TNG sandbox auto-deduct · ledger entry · trust score tick | Mung | Akmal (UI) |
| **4 — Rotation Payout** | Kutu | Scheduled cycle · auto-payout to recipient · ledger update | Mung · Kairu | Ijam (logic narrative) |
| **5a — Penasihat Chat** | Innovation | BM chat grounded in tabung state · streaming reply | Akmal · Mung | Ijam (prompt framing) |
| **5b — Penasihat Robo-Advisor** | Innovation | Risk-tuned investment recommendations · BM-first reasoning | Mung · Akmal | Ijam (instrument list curation) · MatNep (recommendation card design) |
| **5c — Pengawal Scam Sentinel** | Security | AI scam pattern detection · BM-first warning modal · community-fed reputation | Mung · Akmal | Ijam (scam-pattern seed list) · MatNep (warning modal) |
| **6 — Pitch Polish** | all | Demo script · video record · deck finalize · Innovation umbrella narrative | Ijam · MatNep | All hands |

---

## Decision Logs

Add new decisions as bullet items below as the build progresses. Each entry: date · decision · context · who.

- **2026-04-25 (pre-hackathon)** · Tech stack locked to Node + TS + Postgres + S3 + Better Auth + Hono + Drizzle + Next.js 15 + shadcn/ui · Mung & Akmal aligned · See [TECH-STACK.md](./TECH-STACK.md)
- **2026-04-25 (pre-hackathon)** · Deployment target: single EC2 t3.medium with Docker (caddy + frontend + app + postgres) · Pattern A (same-domain path-routing) selected for zero-CORS dev velocity · Ijam decision · See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **2026-04-25** · MatNep added as designer · classical direction + brand identity · External addition (not on original FINHACK roster) · Ijam decision
- **2026-04-25** · Track switch from Financial Inclusion to **Innovation** with three-pillar umbrella (Kutu · Penasihat · Pengawal) · rationale: Innovation brief covers the full platform; Financial Inclusion would have been a single-pillar pitch. Phase 5 split into 5a (Penasihat chat) · 5b (Penasihat Robo-Advisor) · 5c (Pengawal scam sentinel). Adam removed from team; R2-D2 final at 5: Ijam, Mung, Akmal, Kairu, MatNep · Ijam decision

---

## Communication Protocol

- **Stand-ups:** Saturday 09:00 · Saturday 21:00 · Sunday 09:00 · Sunday 13:00 (pre-pitch)
- **Phase gates:** Kairu calls "Phase N gate" before next phase begins; team acknowledges or pushes back on testable outcome
- **Blocker escalation:** anyone can call "🛑 stop" — team huddles within 5 minutes
- **Demo rehearsal:** Sunday morning latest, 4-min walkthrough at least twice before judging slot

---

## Norms

- **No "we'll fix it later"** — fix it now or write it down explicitly as TODO with owner + ETA
- **No silent commits to main** — branch + PR even for solo work · 5-minute review by Kairu or Sahih-protocol equivalent
- **No undocumented schema changes** — migration file required · Mung's gate
- **No copy that wasn't BM-checked** — tutur-protocol · Ijam or MatNep approves register
- **Sleep is a feature** — at least 5 hours per night per person · burnt-out hackers don't ship
