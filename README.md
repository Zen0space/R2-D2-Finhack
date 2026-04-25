# Kutu Digitizer

**TNG FINHACK 2026 · Innovation Track · 25–26 April 2026**

A TNG-powered platform with three pillars on one rail — savings, growth, and protection — for the unbanked and underserved Malaysian community.

---

## What this is

Kutu Digitizer is a single eWallet-native platform built around three pillars:

| Pillar | What it does | Track alignment |
|---|---|---|
| **Kutu** | Communal rotating savings on TNG rails — auto-deduct, transparent ledger, trust score | Financial Inclusion |
| **Penasihat** | Bilingual AI robo-advisor for community-pool investment recommendations, grounded in tabung state | Innovation (core) |
| **Pengawal** | AI scam sentinel — detects fraud patterns before users send money to fraudsters | Security & Fraud |

The three pillars share one TNG eWallet rail, one Postgres ledger, one Better Auth identity, and one Claude API for AI features. Submitted to the **Innovation** track per FINHACK rules (single track per team) — chosen because the Innovation brief covers AI-driven transparency, regulatory compliance, and real-time financial insights, which describe the platform across all three pillars.

**Why Innovation track:** Communal savings (Kutu) without growth-path (Penasihat) leaves the unbanked stuck below the formal financial system. Communal savings without fraud protection (Pengawal) exposes vulnerable users to the scams that target them disproportionately. The umbrella is necessary; one feature alone is not the answer.

**Core capabilities across all pillars:**
- Auto-deduct monthly contributions via TNG eWallet
- Transparent immutable ledger (every member sees every transaction)
- Visible trust score per member (portable reputation across tabung)
- AI Penasihat robo-advisor for risk-tuned investment recommendations (BM-first)
- AI Pengawal scam sentinel that warns before money leaves the user's hand
- Rotation scheduling with auto-payout to the scheduled recipient

Built by team **R2-D2** (KrackedDevs): Ijam · Mung · Akmal · Kairu · MatNep.

---

## Getting started — your first 10 minutes

### 1. Clone

```bash
git clone https://github.com/Ijam18/kutu-digitizer.git
cd kutu-digitizer
```

### 2. Open in your AI-assisted IDE

Any of these work — Claude Code, Cursor, Codex, VS Code with an AI extension, even claude.ai web.

### 3. Run `/maji-onboard`

In your AI chat, type:

```
/maji-onboard
```

The AI will:
1. Greet you in BM and ask your name
2. Match your name against the **R2-D2 whitelist** (`ijam`, `mung`, `akmal`, `kairu`, `matnep` — strict, no other names accepted)
3. Show your **role card**: archetype, signature tools, skills, refusals, code ownership
4. Read `DEVELOPMENT-PLAN.md` and tell you the **current BMAD phase + your specific task**
5. Create your personal memory file at `maji-core/memory/members/<your-name>.json`

If your IDE doesn't autocomplete `/maji-onboard`, just type it in chat — Cursor / Codex / generic AI all read [`AGENTS.md`](./AGENTS.md) and execute the flow. See [maji-core/README.md](./maji-core/README.md) → "Slash command mechanism by IDE" for details.

### 4. Push your identity to the team

After onboarding, commit + push your memory file:

```bash
git add maji-core/memory/members/<your-name>.json
git commit -m "onboard: <your-name> first session"
git push
```

The next teammate who runs `/maji-phase` will see you on the team status.

### 5. Stand up the stack

```bash
# Postgres (one-time)
docker compose -f docker-compose.dev.yml up -d

# Backend (terminal 1)
cd backend
cp .env.example .env
npm install
npm run dev

# Frontend (terminal 2)
cd frontend
cp .env.example .env
npm install
npm run dev
```

**Verify Phase 0 testable outcome:**
- Frontend renders at <http://localhost:3000>
- Backend: `curl http://localhost:4000/health` → `{"ok":true}`

If both pass, Phase 0 is done. Run `/maji-gate` to advance to Phase 1.

Full bootstrap details: [QUICKSTART.md](./QUICKSTART.md).

---

## Daily workflow — slash commands

maji-core ships six slash commands. All work in any AI-assisted IDE.

| When | Command | What it does |
|---|---|---|
| First time on this repo | `/maji-onboard` | Intake · role card · current phase task · creates memory |
| Returning for a session | `/maji-whoami` | Quick identity · current task · open blockers |
| Want team-wide view | `/maji-phase` | Cross-team BMAD phase status + per-member state |
| Pairing on a task | `/maji-pair` | Logs collaboration · both members see it |
| Phase complete, need to advance | `/maji-gate` | Kairu's ladder check · refuses without verifier + evidence |
| End of session | `/maji-handoff` | Saves session note · optionally logs blocker |

All commands respect:
- **Strict whitelist** — only the five R2-D2 names work
- **Pre-flight checks** — fails fast if required files are missing or malformed
- **Manual commits** — AI never runs `git commit`; it prompts you to commit yourself

Full command specs: [`maji-core/commands/`](./maji-core/commands/).

---

## Tutorial — three common scenarios

### Scenario A · "I just pulled and want to see what changed"

```
/maji-phase
```

Output (example):

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BMAD Phase Status — Kutu Digitizer · R2-D2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✅  Phase 0 — Stack Activation
  🟡  Phase 1 — Auth + First Tabung           (Mung + Akmal · Kairu)
  ⏳  Phase 2 — Member Invite + Join
  ...

Team state
  Ijam    · session #2 · last 1h ago · Phase 1
  Mung    · session #4 · last 8m ago · Phase 1 🤝 pair with Akmal
  Akmal   · session #4 · last 8m ago · Phase 1 🤝 pair with Mung
  Kairu   · session #1 · last 3h ago · Phase 1
  MatNep  · session #2 · last 2h ago · Phase 1
```

### Scenario B · "I'm pairing with Akmal on the auth flow"

```
/maji-pair
```

Then follow the prompts:
- *Pair dengan siapa?* → `akmal`
- *Apa task kau pair on?* → `Phase 1 auth schema + form handshake`
- *Confirm? (yes / no)* → `yes`

The AI updates both `mung.json` and `akmal.json`, appends a PAIR entry to `team-ledger.md`, and prompts you to commit. You run:

```bash
git add maji-core/memory/members/mung.json \
        maji-core/memory/members/akmal.json \
        maji-core/memory/team-ledger.md
git commit -m "pair: mung+akmal on phase-1-auth"
git push
```

When Akmal pulls and runs `/maji-whoami`, they see the pair record.

### Scenario C · "Phase 1 is verified, ready to mark done"

```
/maji-gate
```

The gate refuses unless:
- All previous phases are ✅
- The verifier is **NOT** the primary lead of the phase
- You provide concrete evidence (screenshot / terminal output / video URL)

On pass, it updates `DEVELOPMENT-PLAN.md` Phase Status, appends `PHASE ✅` to `team-ledger.md`, updates everyone's `phasesCompleted`, and prompts you to commit.

---

## Repository layout

```
kutu-digitizer/
├── README.md                    # this file
├── QUICKSTART.md                # 10-minute bootstrap for new clones
├── CLAUDE.md                    # AI assistant rules (Claude Code reads this)
├── AGENTS.md                    # AI assistant rules (Cursor/Codex/generic)
│
├── WORLD.md                     # the why · cultural foundation · public-facing
├── ARCHITECTURE.md              # system architecture · mermaid diagrams
├── TECH-STACK.md                # complete 60-item tech inventory
├── BRAND.md                     # visual identity · palette · typography
├── DEVELOPMENT-PLAN.md          # 7-phase build plan + live status table
├── TEAM.md                      # roster · phase ownership · norms
│
├── backend/                     # Hono + Drizzle + Postgres + Better Auth + AWS S3
├── frontend/                    # Next.js 15 + Tailwind v4 + shadcn/ui + TanStack Query
├── infra/                       # Caddyfile + deployment configs
├── docs/                        # pitch deck + narration + demo script
│
├── maji-core/                   # team coordinator (slash commands · memory · BMAD)
│   ├── README.md
│   ├── protocols/               # onboarding · bmad · akal · jimat · phase-gate · schema · preflight
│   ├── heroes/                  # role cards (5 members)
│   ├── commands/                # slash command specs (6 commands)
│   └── memory/                  # team-ledger.md + members/<name>.json
│
├── docker-compose.dev.yml       # Postgres only (local dev)
├── docker-compose.prod.yml      # 4-container spine (Caddy + frontend + app + Postgres)
└── .claude/ + .cursor/          # IDE-specific slash command wiring
```

---

## Tech stack snapshot

| Layer | Choice |
|---|---|
| **Runtime** | Node.js 20 LTS · TypeScript 5.4+ |
| **Backend framework** | Hono 4 |
| **Database** | PostgreSQL 16 |
| **ORM** | Drizzle |
| **Auth** | Better Auth (with argon2) |
| **Frontend** | Next.js 15 App Router + React 19 |
| **Styling** | Tailwind v4 + shadcn/ui |
| **State** | TanStack Query v5 + Better Auth hooks |
| **Object storage** | AWS S3 |
| **AI** | Anthropic Claude API |
| **Reverse proxy** | Caddy 2 (auto-SSL) |
| **Container** | Docker Compose |

Deploy target: single EC2 t3.medium · 4 containers · same-domain path-routing.

Full inventory + version locks: [TECH-STACK.md](./TECH-STACK.md).

---

## BMAD phases

| Phase | Goal | Pillar | Lead |
|---|---|---|---|
| 0 | Stack activation · `/health` + frontend renders | foundation | Mung + Akmal |
| 1 | Auth + first tabung created | Kutu | Mung + Akmal |
| 2 | Member invite + join | Kutu | Akmal + Mung |
| 3 | Contribution flow via TNG sandbox | Kutu | Mung |
| 4 | Rotation payout (auto or manual demo) | Kutu | Mung + Kairu |
| 5a | Penasihat — robo-advisor for surplus-capital investment recommendations (BM-first) | Innovation | Akmal + Mung |
| 5b | Pengawal — AI scam sentinel warning before TNG payment | Security | Mung + Akmal |
| 5c | Penasihat-chat grounded in tabung state (carry-over from original Phase 5) | Kutu × Innovation | Akmal + Mung |
| 6 | Pitch polish (deck · video · rehearsal) | all | Ijam + MatNep |

Live phase status: [DEVELOPMENT-PLAN.md](./DEVELOPMENT-PLAN.md) → Phase Status table.

Phase methodology + cut-line rules: [maji-core/protocols/bmad.md](./maji-core/protocols/bmad.md).

Phase gate discipline: [maji-core/protocols/phase-gate.md](./maji-core/protocols/phase-gate.md).

---

## Submission deliverables

- [ ] GitHub repo link (this one)
- [ ] Working prototype deployed to a public URL
- [ ] 4-minute pitch deck (8 slides) → [docs/pitch-deck.md](./docs/pitch-deck.md)
- [ ] 4-minute demo video
- [ ] On-stage pitch (Sunday afternoon) → narration: [docs/pitch-narration.md](./docs/pitch-narration.md)

---

## Sponsor credits to redeem

| Sponsor | Use |
|---|---|
| **AWS** | Primary cloud — EC2 + S3 |
| **Alibaba Cloud** | Fallback compute · scale-out narrative |
| **OceanBase / VISA** | Explore use-case fit |
| **TNG eWallet** | Sandbox API access for contribution flow |

---

## Contributing (within R2-D2)

- Honor the maji-core protocols. Run `/maji-onboard` first. Pair via `/maji-pair`. Advance phases via `/maji-gate`.
- Follow the **Akal** discipline ([protocols/akal.md](./maji-core/protocols/akal.md)): THINK · SIMPLE · SURGICAL · VERIFY.
- Default to **jimat penuh** register ([protocols/jimat.md](./maji-core/protocols/jimat.md)) — concise, BM-first, EN for technical terms.
- Commit messages describe **what shipped**, not what was worked on. Bad: `wip`. Good: `add POST /api/tabung endpoint`.
- Personal memory files (`maji-core/memory/members/*.json`) are committed — push them so the team sees your state on `/maji-phase`.

---

## License

Built for TNG FINHACK 2026 · Financial Inclusion track. Codebase belongs to its builders per the FINHACK terms; specific license to be added before any post-hackathon distribution.

---

*Project under team R2-D2 stewardship. Not affiliated with any team member's other engagements.*
