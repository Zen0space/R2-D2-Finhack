# Team

**TNG FINHACK 2026 · DuitLater · Financial Inclusion Track**

---

## Roster

| Member | Role | Primary Surface |
|---|---|---|
| **Ijam (Zarul Izham)** | Business Pitch Lead · Product · Voice on stage | Pitch deck · live demo narration · stakeholder framing |
| **Moon** | Backend · Postgres · Better Auth · AWS SDK | API · schema · migrations · cron · AWS S3 integration |
| **Akmal** | Frontend · Next.js · Interaction Craft | UI · forms · animations · TanStack Query wiring |
| **Kairu** | Product Manager · Phase Discipline | Phase plan · testable outcomes · scope guard |
| **MatNep** *(joining as designer)* | Classical Design Direction · Brand & Typography | Visual identity · pitch-deck design · heritage motif translation |

---

## Working Mode

- **Co-located** at Bangsar South CCEC for 25-26 April
- **Async deliverables** review by MatNep (collaborating remotely or co-located)
- **Communication** primary on WhatsApp group · technical via shared GitHub issues + Slack/Discord (whichever team prefers)
- **Decision authority** Ijam (product) · Kairu (process) · Moon (backend technical) · Akmal (frontend technical)

---

## Phase Ownership

Mapped to Kairu's vertical-slice discipline (every phase = backend + frontend + testable outcome together):

| Phase | Goal | Lead | Support |
|---|---|---|---|
| **0 — Stack Activation** | Repo init · Docker compose up · first migration · DuitLater landing renders | Moon · Akmal | Kairu (gate) |
| **1 — Auth + Individual PayLater** | Register · login · dashboard shows my individual TNG PayLater allowance | Moon · Akmal | Ijam (copy) · MatNep (dashboard visual) |
| **2 — Pool Formation + Lock** | Create pool · invite 1–7 members · lock roster · combined cap computed | Akmal · Moon | MatNep (invite UI) |
| **3 — Penasihat + Catalogue** | Locked pool gets top-5 BM-first item suggestions from MyKasih catalogue | Moon · Akmal | Ijam (catalogue curation + Penasihat prompt review) |
| **4 — Vote + TNG Approval + Purchase** | Members vote · majority triggers simulated TNG approval · purchase commits · NADI confirms delivery | Moon · Kairu | Akmal (vote UI + NADI portal v1) · Ijam (logic narrative) |
| **5 — Repayment + Kampung Trust** | Monthly repayment ledger · kampung trust score updates collectively | Moon · Akmal | Kairu (gate) · MatNep (trust widget visual) |
| **6 — NADI Portal + Pitch Polish** | NADI staff dashboard polished · pitch deck finalised · demo video · on-stage rehearsal | Ijam · MatNep | All hands |

---

## Decision Logs

Add new decisions as bullet items below as the build progresses. Each entry: date · decision · context · who.

- **2026-04-25 (pre-hackathon)** · Tech stack locked to Node + TS + Postgres + Better Auth + Hono + Prisma + Next.js 15 + Tailwind v4 · Moon & Akmal aligned · See [TECH-STACK.md](../tech/TECH-STACK.md)
- **2026-04-25 (pre-hackathon)** · Deployment target: single EC2 t3.medium with Docker (caddy + frontend + app + postgres) · Pattern A (same-domain path-routing) selected for zero-CORS dev velocity · Ijam decision · See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **2026-04-25** · MatNep added as designer · classical direction + brand identity · External addition (not on original FINHACK roster) · Ijam decision
- **2026-04-25** · Track switch from Financial Inclusion to **Innovation** with three-pillar umbrella (Kutu · Penasihat · Pengawal) · rationale: Innovation brief covers the full platform; Financial Inclusion would have been a single-pillar pitch. Phase 5 split into 5a (Penasihat chat) · 5b (Penasihat Robo-Advisor) · 5c (Pengawal scam sentinel). Adam removed from team; R2-D2 final at 5: Ijam, Moon, Akmal, Kairu, MatNep · Ijam decision
- **2026-04-25** · **Pivot to DuitLater · Shared Pool Pay Later · back to Financial Inclusion track** · rationale: stronger institutional fit (TNG + NADI + MyKasih · all real Malaysian institutions with B40 mandate) · cleaner product story (one mechanic, not three pillars) · stronger track-brief alignment (Financial Inclusion explicitly targets B40 underserved) · test bed: NADI Felda Gedangsa, Hulu Selangor. Repo renamed kutu-digitizer → duitlater. Penasihat repurposed as item-suggestion advisor. Pengawal dropped. Phase 5 redesigned around pool + repayment instead of three sub-pillars · Ijam decision

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
- **No undocumented schema changes** — migration file required · Moon's gate
- **No copy that wasn't BM-checked** — tutur-protocol · Ijam or MatNep approves register
- **Sleep is a feature** — at least 5 hours per night per person · burnt-out hackers don't ship
