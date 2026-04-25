# DuitLater

**TNG FINHACK 2026 · Financial Inclusion Track · 25–26 April 2026**

A Shared Pool Pay Later product proposed for TNG eWallet, designed for B40 communities. Two to eight users combine their individual TNG PayLater allowances into a shared pool to access bigger-ticket essentials they could never afford alone.

Built around Malaysia's existing **NADI** community network as the on-the-ground facilitator, with **MyKasih MySARA** providing the eligible-item catalogue and a bilingual AI advisor (**Penasihat**) suggesting purchases that match each pool's combined cap and stated needs.

---

## What this is

Every TNG eWallet user has an individual PayLater allowance — small for most B40 households, but real. **DuitLater lets a household pool combine their allowances** so the group can buy what each individual could not.

A single mother with RM 300 PayLater limit cannot afford a sewing machine. Six neighbours pooling RM 300 each can buy one for the kampung. The pool repays monthly, each member at their proportional share. The kampung's reliability accumulates into a visible trust score that grows the next pool's capacity.

**Test bed: NADI Felda Gedangsa** (Hulu Selangor) — a Felda smallholder community already served by an MCMC-run NADI community internet centre.

---

## The institutional package (four-way Malaysian)

| Partner | Role | Existing real institution |
|---|---|---|
| **TNG** | PayLater rail · risk model · transaction processing | Touch 'n Go Digital (TNG eWallet) |
| **NADI** | Community facilitator · pool onboarding · digital literacy support | MCMC's Pusat Sebaran Maklumat Nasional (188 centres nationally · 84 in Selangor) |
| **MyKasih** | MySARA-eligible item catalogue · merchant network · last-mile delivery | MyKasih Foundation (Sumbangan Asas Rahmah programme operator) |
| **B40 households** | Pool members · 2–8 per pool · joint accountability | Felda settlers · rural fishers · urban poor |

---

## Core features

- **Pool formation** — 2 to 8 members per pool, locked roster
- **Combined PayLater cap** — sum of individual allowances
- **AI Penasihat (BM-first)** — suggests top-5 catalogue items per pool's combined cap + stated needs
- **Pool vote** — democratic majority approval before purchase commits
- **MyKasih catalogue** — curated item set (rice, cooking oil, school supplies, appliances, tools)
- **Repayment ledger** — monthly per-member share, transparent, append-only
- **Kampung trust score** — collectivist incentive; kampung-level reliability affects future pool capacity
- **NADI portal** — centre staff dashboard for pool health and delivery confirmation

Built by team **R2-D2** (KrackedDevs): Ijam · Mung · Akmal · Kairu · MatNep.

---

## Monorepo structure

```
R2-D2-Finhack/
├── packages/              # pnpm workspace packages
│   ├── backend/           # Hono API server (Node 22)
│   ├── frontend/          # Next.js 15 App Router + PWA
│   └── db/                # Prisma schema, migrations, seed
├── infra/                 # Caddyfile + infra docs
├── maji-core/             # Team protocols, heroes, commands
├── docs/                  # Product docs, pitch deck
├── scripts/               # Dev scripts (setup, kill-ports)
├── docker-compose.yml
├── pnpm-workspace.yaml
└── package.json
```

---

## Getting started (pnpm workspace — primary)

### Prerequisites

- [Node.js](https://nodejs.org/) >= 22
- [pnpm](https://pnpm.io/) >= 9
- [Docker](https://www.docker.com/)

### First run — one command

```bash
bash scripts/setup.sh
```

This auto-installs Node 22 via nvm if missing, installs pnpm, installs all deps, generates the Prisma client, and copies `.env.example` files.

### Start dev

```bash
pnpm db:up       # start Postgres in Docker
pnpm db:migrate  # apply migrations
pnpm dev         # backend (4000) + frontend (3000) in parallel
```

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

---

## BMAD phases

| Phase | Goal | Lead |
|---|---|---|
| 0 | Stack activation · `/health` + frontend renders | Mung + Akmal |
| 1 | Auth + individual PayLater allowance display | Mung + Akmal |
| 2 | Pool formation · invite · 2–8 members lock | Akmal + Mung |
| 3 | Combined PayLater + MyKasih catalogue + AI Penasihat | Mung + Akmal |
| 4 | Pool vote + TNG approval + purchase + delivery confirm | Mung + Kairu |
| 5 | Repayment ledger + kampung trust score | Mung + Akmal |
| 6 | NADI portal + pitch polish | Ijam + MatNep |

---

## Workspace commands

```bash
pnpm setup                        # first-time setup (Node 22 + deps + prisma)
pnpm dev                          # run backend + frontend in parallel
pnpm typecheck                    # tsc across all packages
pnpm db:generate                  # regenerate Prisma client after schema change
pnpm db:migrate:new -- --name x   # create a new migration
pnpm db:studio                    # Prisma Studio at localhost:5555
pnpm --filter backend add <pkg>   # add dep to one package
```

---

## Submission deliverables

- [ ] GitHub repo link
- [ ] Working prototype at public URL
- [ ] 4-minute pitch deck → [docs/pitch-deck.md](./docs/pitch-deck.md)
- [ ] 4-minute demo video
- [ ] On-stage pitch → [docs/pitch-narration.md](./docs/pitch-narration.md)

---

*"Sendiri tak mampu, ramai-ramai boleh."*
