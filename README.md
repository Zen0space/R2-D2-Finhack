# DuitLater

**TNG FINHACK 2026 · Financial Inclusion Track · 25–26 April 2026**

A Shared Pool Pay Later product proposed for TNG eWallet, designed for B40 communities. Two to eight users combine their individual TNG PayLater allowances into a shared pool to access bigger-ticket essentials they could never afford alone.

Built around Malaysia's existing **NADI** community network as the on-the-ground facilitator, with **MyKasih MySARA** providing the eligible-item catalogue and a bilingual AI advisor (**Penasihat**) suggesting purchases that match each pool's combined cap and stated needs.

---

## What this is

Every TNG eWallet user has an individual PayLater allowance — small for most B40 households, but real. **DuitLater lets a household pool combine their allowances** so the group can buy what each individual could not.

A single mother with RM 300 PayLater limit cannot afford a sewing machine. Six neighbours pooling RM 300 each can buy one for the kampung. The pool repays monthly, each member at their proportional share. The kampung's reliability accumulates into a visible trust score that grows the next pool's capacity.

**Test bed: NADI Felda Gedangsa** (Hulu Selangor) — a Felda smallholder community already served by an MCMC-run NADI community internet centre. Felda settlements have existing communal management structures; NADI provides the digital infrastructure. DuitLater plugs the financial layer into both.

---

## The institutional package (four-way Malaysian)

| Partner | Role | Existing real institution |
|---|---|---|
| **TNG** | PayLater rail · risk model · transaction processing | Touch 'n Go Digital (TNG eWallet) |
| **NADI** | Community facilitator · pool onboarding · digital literacy support | MCMC's Pusat Sebaran Maklumat Nasional (188 centres nationally · 84 in Selangor) |
| **MyKasih** | MySARA-eligible item catalogue · merchant network · last-mile delivery | MyKasih Foundation (Sumbangan Asas Rahmah programme operator) |
| **B40 households** | Pool members · 2–8 per pool · joint accountability | Felda settlers · rural fishers · urban poor |

Zero foreign reliance. All partners aligned by existing mandate. Pitch is a real Malaysian institutional combination, not a synthetic hackathon construct.

---

## Core features

- **Individual PayLater allowance** (TNG-set, varies by financial track record)
- **Pool formation** — 2 to 8 members per pool, locked roster
- **Combined PayLater cap** — sum of individual allowances; no NGO subsidy stacking (cleaner risk model)
- **AI Penasihat (BM-first)** — suggests top-5 catalogue items per pool's combined cap + stated needs + seasonal context
- **Pool vote** — democratic majority approval before purchase commits
- **MyKasih catalogue** — curated item set seeded for demo (rice, cooking oil, school supplies, generators, agricultural tools, basic appliances, tradesperson tooling); production: full MySARA integration
- **Repayment ledger** — monthly per-member share, transparent, append-only
- **Kampung trust score** — collectivist incentive; kampung-level reliability affects future pool capacity (not individual punishment-based)
- **NADI portal** — centre staff dashboard for monitoring pool health, kampung-level stats, MySARA item delivery confirmation

Built by team **R2-D2** (KrackedDevs): Ijam · Mung · Akmal · Kairu · MatNep.

---

## Getting started — your first 10 minutes

### 1. Clone

```bash
git clone https://github.com/Ijam18/duitlater.git
cd duitlater
```

### 2. Open in your AI-assisted IDE

Any of these work — Claude Code, Cursor, Codex, VS Code with an AI extension, even claude.ai web.

### 3. Run `/maji-onboard`

In your AI chat, type:

```
/maji-onboard
```

The AI will greet you in BM, ask your name, match it against the **R2-D2 whitelist** (Ijam · Mung · Akmal · Kairu · MatNep — strict), show your role card with the current BMAD phase task, and create your personal memory file.

If your IDE doesn't autocomplete `/maji-onboard`, just type it in chat — Cursor / Codex / generic AI all read [`AGENTS.md`](./AGENTS.md) and execute the flow.

### 4. Push your identity

```bash
git add maji-core/memory/members/<your-name>.json
git commit -m "onboard: <your-name> first session"
git push
```

The next teammate who runs `/maji-phase` sees you on the team status.

### 5. Stand up the stack

```bash
docker compose -f docker-compose.dev.yml up -d
cd backend  && cp .env.example .env && npm install && npm run dev
cd frontend && cp .env.example .env && npm install && npm run dev
```

Verify Phase 0:
- Frontend renders at <http://localhost:3000>
- `curl http://localhost:4000/health` → `{"ok":true}`

Full bootstrap details: [QUICKSTART.md](./QUICKSTART.md).

---

## Daily workflow — slash commands

| When | Command |
|---|---|
| First time on this repo | `/maji-onboard` |
| Returning for a session | `/maji-whoami` |
| Want team-wide view | `/maji-phase` |
| Pairing on a task | `/maji-pair` |
| Phase complete, need to advance | `/maji-gate` |
| End of session | `/maji-handoff` |

Full specs: [maji-core/commands/](./maji-core/commands/).

---

## BMAD phases

| Phase | Goal | Lead |
|---|---|---|
| 0 | Stack activation · `/health` + frontend renders | Mung + Akmal |
| 1 | Auth + individual PayLater allowance display | Mung + Akmal |
| 2 | Pool formation · invite · 2–8 members lock | Akmal + Mung |
| 3 | Combined PayLater + MyKasih catalogue browse + AI Penasihat suggestion | Mung + Akmal |
| 4 | Pool vote + TNG approval flow + purchase + delivery confirm | Mung + Kairu |
| 5 | Repayment ledger + kampung trust score | Mung + Akmal |
| 6 | NADI portal (institutional dashboard) + pitch polish | Ijam + MatNep |

Phase status: [DEVELOPMENT-PLAN.md](./DEVELOPMENT-PLAN.md). Methodology: [maji-core/protocols/bmad.md](./maji-core/protocols/bmad.md).

---

## Submission deliverables

- [ ] GitHub repo link (this one)
- [ ] Working prototype deployed to a public URL
- [ ] 4-minute pitch deck (8 slides) → [docs/pitch-deck.md](./docs/pitch-deck.md)
- [ ] 4-minute demo video
- [ ] On-stage pitch (Sunday afternoon) → narration: [docs/pitch-narration.md](./docs/pitch-narration.md)

---

## Sponsor + partner alignment

| Partner | Use |
|---|---|
| **TNG Digital** | DuitLater as proposed eWallet feature · sandbox API extension request |
| **MCMC / NADI** | Community facilitator · 84 Selangor centres ready as distribution channel |
| **MyKasih Foundation** | MySARA-eligible item catalogue · merchant network |
| **AWS** | Primary cloud — EC2 + S3 |
| **Alibaba Cloud** | Fallback compute · scale-out narrative |

---

## Contributing (within R2-D2)

- Honor the maji-core protocols. Run `/maji-onboard` first. Pair via `/maji-pair`. Advance phases via `/maji-gate`.
- Follow the **Akal** discipline ([protocols/akal.md](./maji-core/protocols/akal.md)): THINK · SIMPLE · SURGICAL · VERIFY.
- Default to **jimat penuh** register ([protocols/jimat.md](./maji-core/protocols/jimat.md)) — concise, BM-first, EN for technical terms.
- Commit messages describe **what shipped**, not what was worked on.
- Personal memory files (`maji-core/memory/members/*.json`) are committed — push them so the team sees your state on `/maji-phase`.

---

## License

Built for TNG FINHACK 2026 · Financial Inclusion track. Codebase belongs to its builders per the FINHACK terms; specific license to be added before any post-hackathon distribution.

---

*Project under team R2-D2 stewardship. Not affiliated with any team member's other engagements.*

*"Sendiri tak mampu, ramai-ramai boleh."*
