# DuitLater (R2-D2)

<p align="center">
<strong>Shared Pool Pay Later for B40 communities</strong>
<br>
<img src="https://img.shields.io/badge/FINHACK-2026-blue.svg" alt="FINHACK 2026">
<img src="https://img.shields.io/badge/node-%3E%3D22-brightgreen.svg" alt="Node >=22">
<img src="https://img.shields.io/badge/pnpm-%3E%3D9-orange.svg" alt="pnpm >=9">
<img src="https://img.shields.io/badge/Next.js-15-black.svg" alt="Next.js 15">
<img src="https://img.shields.io/badge/Hono-API-red.svg" alt="Hono API">
<img src="https://img.shields.io/badge/Postgres-17-blue.svg" alt="Postgres 17">
</p>

<p align="center">
Built by <strong>R2-D2</strong> · <a href="https://krackeddevs.com/">KrackedDevs</a>
</p>

<p align="center">
<a href="#quick-start">Quick Start</a> |
<a href="#local-install-a-to-z">Local Install A-to-Z</a> |
<a href="#maji-operating-system">Maji OS</a> |
<a href="#production-deploy-a-to-z">Deploy A-to-Z</a> |
<a href="#free-multi-vps-mode">Free Multi-VPS</a> |
<a href="#troubleshooting">Troubleshooting</a>
</p>

---

> **Sendiri tak mampu, ramai-ramai boleh.**

DuitLater is a proposed TNG eWallet feature for the **TNG FINHACK 2026 Financial Inclusion Track**. It lets 2-8 B40 users combine individual TNG PayLater allowances into one shared pool, then buy essential MyKasih/MySARA-aligned items through a transparent vote, repayment ledger, and kampung trust score.

Repository:

```bash
https://github.com/Zen0space/R2-D2-Finhack.git
```

---

## What DuitLater Is

Many B40 users have a small PayLater allowance that is useful for daily expenses but too small for bigger essentials. One person with RM300 cannot buy a sewing machine. Six neighbours with RM300 each can form a RM1,800 pool and buy something that helps the household or kampung earn, repair, study, or operate.

DuitLater combines four Malaysian surfaces:

| Surface | Role in DuitLater |
|---|---|
| TNG eWallet | Proposed PayLater rail, per-user allowance, simulated transaction approval |
| NADI / MCMC | Community facilitator and digital support centre |
| MyKasih / MySARA | Eligible item catalogue and merchant fulfilment reference |
| B40 households | Pool members with shared accountability |

Current prototype scope:

1. User signs up and signs in.
2. User sees individual PayLater allowance.
3. User creates a pool and invites members.
4. Pool locks at 2-8 members.
5. Combined PayLater cap is calculated.
6. Penasihat suggests suitable MyKasih catalogue items.
7. Members vote before purchase.
8. TNG approval is simulated.
9. Repayment ledger tracks monthly share.
10. Kampung trust score gives the community a collective incentive.

---

## Current Tech Stack

| Layer | Current implementation |
|---|---|
| Monorepo | pnpm workspace under `packages/*` |
| Frontend | Next.js 15, React 19, Tailwind CSS v4, Serwist PWA |
| Backend | Hono, Better Auth, Zod, Node runtime |
| Database | Prisma, PostgreSQL 17 |
| Local dev DB | `infra/docker-compose.local.yml` |
| Deploy proxy | Caddy, same-domain routing |
| Upload storage | Local VPS disk, served via Caddy, syncable with Syncthing |
| AI | Alibaba Function Compute URL optional; local heuristic fallback exists |
| CI/CD | GitHub Actions for backend CI/release to GHCR |

Important accuracy note:
- Current code has **Penasihat with Alibaba optional + heuristic fallback**.
- Claude fallback and NADI weekly summary are product-roadmap items unless code is added later.
- Free Cloudflare DNS gives round-robin DNS only, not paid health-checked automatic failover.

---

## Project Structure

```text
R2-D2-Finhack/
|-- packages/
|   |-- backend/             # Hono API, Better Auth, routes, services
|   |-- frontend/            # Next.js app
|   `-- db/                  # Prisma schema, migrations, seeds
|-- infra/
|   |-- docker-compose.local.yml
|   |-- docker-compose.prod.yml
|   |-- docker-compose.dev.yml
|   |-- docker-compose.sync.yml
|   |-- Caddyfile
|   |-- .env.example
|   `-- RELEASE.md
|-- maji-core/               # R2-D2 AI operating system
|-- docs/
|   |-- process/
|   |-- product/
|   |-- tech/
|   |-- team/
|   `-- pitch/
|-- .github/workflows/
|-- package.json
|-- pnpm-workspace.yaml
`-- pnpm-lock.yaml
```

---

## Quick Start

Use this if the machine already has Node 22, pnpm, and Docker.

```bash
git clone https://github.com/Zen0space/R2-D2-Finhack.git
cd R2-D2-Finhack

corepack enable
corepack prepare pnpm@9.15.0 --activate
pnpm install --frozen-lockfile

cp packages/db/.env.example packages/db/.env
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env.local

pnpm db:up
pnpm db:generate
pnpm db:migrate
pnpm --filter db seed:run
pnpm dev
```

Verify:

```bash
curl http://localhost:4000/health
curl http://localhost:4000/api/v1/health
open http://localhost:3000
```

Stop local Postgres:

```bash
pnpm db:down
```

---

## Local Install A-to-Z

### 1. Install Git

macOS:

```bash
xcode-select --install
git --version
```

Ubuntu:

```bash
sudo apt update
sudo apt install -y git
git --version
```

### 2. Install Node 22

This repo requires Node `>=22`. `.nvmrc` is set to `22`.

With `nvm`:

```bash
nvm install 22
nvm use 22
node --version
```

Expected major version:

```text
v22.x.x
```

### 3. Install pnpm

Use Corepack so the repo does not depend on a global manual pnpm install.

```bash
corepack enable
corepack prepare pnpm@9.15.0 --activate
pnpm --version
```

Expected:

```text
9.15.0
```

### 4. Install Docker

You need Docker Compose v2 for local Postgres.

macOS:
- Install Docker Desktop.
- Start Docker Desktop before running `pnpm db:up`.

Ubuntu:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
docker --version
docker compose version
```

### 5. Clone the repo

```bash
git clone https://github.com/Zen0space/R2-D2-Finhack.git
cd R2-D2-Finhack
```

### 6. Install dependencies

```bash
pnpm install --frozen-lockfile
```

If native dependencies fail on macOS:

```bash
xcode-select --install
pnpm install --frozen-lockfile
```

If native dependencies fail on Ubuntu:

```bash
sudo apt install -y build-essential python3
pnpm install --frozen-lockfile
```

### 7. Create local env files

```bash
cp packages/db/.env.example packages/db/.env
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env.local
```

Generate a real auth secret:

```bash
openssl rand -base64 32
```

Open `packages/backend/.env` and replace:

```env
BETTER_AUTH_SECRET=change-me-use-openssl-rand-base64-32
```

Keep local defaults unless you intentionally changed the local Postgres compose:

```env
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://duitlater:duitlater_dev@localhost:5432/duitlater
BETTER_AUTH_URL=http://localhost:4000
UPLOAD_DRIVER=local
UPLOAD_ROOT=.local/uploads
UPLOAD_PUBLIC_PATH=/uploads
```

### 8. Start local Postgres

```bash
pnpm db:up
docker compose -f infra/docker-compose.local.yml ps
```

Expected service:

```text
duitlater-postgres-dev
```

### 9. Generate Prisma client

```bash
pnpm db:generate
```

Run this after changing `packages/db/prisma/schema.prisma`.

### 10. Apply migrations

```bash
pnpm db:migrate
```

### 11. Seed data

Required baseline NADI/kampung seeds:

```bash
pnpm --filter db seed:run
```

Optional full MyKasih product catalogue seed:

```bash
pnpm --filter db seed
```

Optional pitch/demo users and locked demo pool:

```bash
pnpm --filter backend tsx src/scripts/seed-demo.ts
```

### 12. Run the app

```bash
pnpm dev
```

This runs:

| Service | URL |
|---|---|
| Frontend | `http://localhost:3000` |
| Backend | `http://localhost:4000` |
| Postgres | `localhost:5432` |

### 13. Verify local health

```bash
curl http://localhost:4000/health
curl http://localhost:4000/api/v1/health
curl http://localhost:4000/api/v1/mykasih/products
```

Expected:
- `/health` returns DB-aware readiness.
- `/api/v1/health` returns app/demo health.
- `/api/v1/mykasih/products` returns catalogue data after product seed.

### 14. Stop local services

Stop the dev server with `Ctrl+C`, then stop Postgres:

```bash
pnpm db:down
```

---

## Local Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Run backend and frontend in parallel |
| `pnpm build` | Build all workspaces |
| `pnpm typecheck` | Typecheck all workspaces |
| `pnpm lint` | Lint all workspaces |
| `pnpm db:up` | Start local Postgres |
| `pnpm db:down` | Stop local Postgres |
| `pnpm db:logs` | Follow local Postgres logs |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Apply Prisma migrations |
| `pnpm db:migrate:new -- --name <name>` | Create a new migration |
| `pnpm db:studio` | Open Prisma Studio |

---

## Maji Operating System

`maji-core/` is the team operating system for R2-D2. It is not a backend service. It is a file-based AI workflow that works through AI-assisted IDE chat.

Moon is the real user name. Mung is a project role/driver inside R2-D2.

### Commands

| Command | Purpose |
|---|---|
| `/maji-onboard` | First session intake, role card, personal memory |
| `/maji-whoami` | Check identity, current role, active task, blockers |
| `/maji-phase` | Read team phase status |
| `/maji-pair` | Log pair work between two members |
| `/maji-gate` | Kairu phase-gate verification |
| `/maji-handoff` | End session memory and handoff note |

### First-time Maji flow

1. Open the repo in Codex, Cursor, Claude Code, or another AI-assisted IDE.
2. Type:

```text
/maji-onboard
```

3. Use one of the whitelisted R2-D2 identities:

```text
Ijam
Mung
Akmal
Kairu
MatNep
```

4. Commit the generated memory file if the command creates or updates one:

```bash
git add maji-core/memory/members/<name>.json
git commit -m "onboard: <name> session"
git push
```

Full command specs:
- [maji-core/README.md](./maji-core/README.md)
- [maji-core/commands](./maji-core/commands)
- [maji-core/protocols/bmad.md](./maji-core/protocols/bmad.md)

---

## Backend API Reference

Current mounted routes from `packages/backend/src/index.ts`:

| Route | Purpose |
|---|---|
| `GET /health` | DB-aware readiness for Caddy/ops |
| `GET /api/v1/health` | App/demo health |
| `/api/auth/*` | Better Auth endpoints |
| `/api/v1/me` | Current user profile and allowance |
| `/api/v1/pools` | Pool creation, membership, voting, suggestions |
| `/api/v1/repayments` | Repayment ledger |
| `/api/v1/kampungs` | Kampung data |
| `/api/v1/mykasih` | MyKasih catalogue |
| `/api/v1/nadi` | NADI centres |
| `/api/v1/uploads` | Authenticated local uploads |

Useful smoke checks:

```bash
curl http://localhost:4000/health
curl http://localhost:4000/api/v1/health
curl http://localhost:4000/api/v1/mykasih/products
```

---

## Environment Files

### Local

| File | Purpose |
|---|---|
| `.env.example` | Local Docker Postgres example |
| `packages/db/.env.example` | Prisma `DATABASE_URL` example |
| `packages/backend/.env.example` | Backend runtime example |
| `packages/frontend/.env.example` | Frontend public env example |

Local files to create:

```bash
cp packages/db/.env.example packages/db/.env
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env.local
```

### VPS

VPS files to create on each server:

```bash
cp infra/.env.example infra/.env
cp packages/backend/.env.example packages/backend/.env.prod
cp packages/backend/.env.example packages/backend/.env.dev
cp packages/frontend/.env.example packages/frontend/.env.prod
cp packages/frontend/.env.example packages/frontend/.env.dev
chmod 600 infra/.env packages/backend/.env.prod packages/backend/.env.dev packages/frontend/.env.prod packages/frontend/.env.dev
```

Required backend values:

```env
PORT=4000
NODE_ENV=production
APP_ENV=prod
PUBLIC_APP_URL=https://duitlater.com
FRONTEND_URL=https://duitlater.com
CORS_ORIGIN=https://duitlater.com
POSTGRES_USER=duitlater
POSTGRES_PASSWORD=<secret>
POSTGRES_DB=duitlater
DATABASE_URL=postgresql://duitlater:<secret>@duitlater-prod-postgres:5432/duitlater
BETTER_AUTH_SECRET=<secret>
BETTER_AUTH_URL=https://duitlater.com
UPLOAD_DRIVER=local
UPLOAD_ROOT=/data/uploads
UPLOAD_PUBLIC_PATH=/uploads
```

Dev backend values are the same shape but use:

```env
APP_ENV=dev
PUBLIC_APP_URL=https://dev.duitlater.com
FRONTEND_URL=https://dev.duitlater.com
CORS_ORIGIN=https://dev.duitlater.com
POSTGRES_DB=duitlater_dev
DATABASE_URL=postgresql://duitlater:<secret>@duitlater-dev-postgres:5432/duitlater_dev
BETTER_AUTH_URL=https://dev.duitlater.com
```

Optional AI values:

```env
ALIBABA_FUNCTION_COMPUTE_URL=
ALIBABA_FUNCTION_COMPUTE_URL_NADI=
ALIBABA_FUNCTION_COMPUTE_KEY=
ANTHROPIC_API_KEY=
```

Current code uses Alibaba Penasihat URL/key if configured. If not configured or failing, it falls back to local heuristic suggestions.

---

## Production Deploy A-to-Z

This is the current deploy baseline: one VPS can run prod and dev stacks, with Caddy routing:

| Hostname | Stack |
|---|---|
| `duitlater.com` | prod |
| `dev.duitlater.com` | dev |

For the deeper runbook, see [infra/RELEASE.md](./infra/RELEASE.md). For topology overview, see [infra/README.md](./infra/README.md).

### 1. Get a VPS or EC2 server

Recommended baseline:

| Item | Value |
|---|---|
| OS | Ubuntu 24.04 LTS |
| Size | 2 vCPU, 4 GB RAM |
| Disk | 30 GB+ |
| Region | nearest to Malaysia/Singapore |
| IP | static public IP or Elastic IP |

### 2. Point DNS

In Cloudflare DNS:

```text
duitlater.com       A   <VPS_IP>   proxied
dev.duitlater.com   A   <VPS_IP>   proxied
```

Cloudflare SSL/TLS mode should be `Full` or `Full (strict)` after Caddy certificates are working.

### 3. Create a GitHub PAT for GHCR

Use GitHub:

1. Open GitHub Settings.
2. Developer settings.
3. Personal access tokens.
4. Create classic token.
5. Give it `read:packages`.
6. Save it as `GHCR_PAT` on the server shell when logging in.

### 4. SSH into the server

```bash
ssh ubuntu@<VPS_IP>
```

### 5. Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
docker --version
docker compose version
```

### 6. Clone the repo

```bash
git clone https://github.com/Zen0space/R2-D2-Finhack.git duitlater
cd duitlater
```

### 7. Login to GHCR

```bash
echo "$GHCR_PAT" | docker login ghcr.io -u <github-username> --password-stdin
```

### 8. Create env files

```bash
cp infra/.env.example infra/.env
cp packages/backend/.env.example packages/backend/.env.prod
cp packages/backend/.env.example packages/backend/.env.dev
cp packages/frontend/.env.example packages/frontend/.env.prod
cp packages/frontend/.env.example packages/frontend/.env.dev
```

Edit them:

```bash
nano infra/.env
nano packages/backend/.env.prod
nano packages/backend/.env.dev
nano packages/frontend/.env.prod
nano packages/frontend/.env.dev
```

Generate secrets:

```bash
openssl rand -base64 32
```

Lock them down:

```bash
chmod 600 infra/.env packages/backend/.env.prod packages/backend/.env.dev packages/frontend/.env.prod packages/frontend/.env.dev
```

### 9. Create upload folders

```bash
sudo mkdir -p /var/lib/duitlater/prod/uploads
sudo mkdir -p /var/lib/duitlater/dev/uploads
sudo mkdir -p /var/lib/duitlater/syncthing/config
sudo chown -R 1000:1000 /var/lib/duitlater
```

### 10. Start Syncthing service

```bash
docker compose --env-file infra/.env -f infra/docker-compose.sync.yml -p sync up -d
```

This only starts Syncthing. Device pairing and folder sharing still need to be configured through the Syncthing GUI.

### 11. Start prod first

Prod creates the shared `duitlater_web` Docker network and runs Caddy.

```bash
docker compose --env-file infra/.env -f infra/docker-compose.prod.yml -p prod pull app
docker compose --env-file infra/.env -f infra/docker-compose.prod.yml -p prod up -d --build
```

Backend container entrypoint already runs Prisma migrations and seeds on container start.

Verify:

```bash
docker compose --env-file infra/.env -f infra/docker-compose.prod.yml -p prod ps
curl -s https://duitlater.com/health
curl -s https://duitlater.com/api/v1/health
```

### 12. Start dev second

Important: current dev compose uses `BACKEND_TAG`; set it to `dev` when starting dev.

```bash
BACKEND_TAG=dev docker compose --env-file infra/.env -f infra/docker-compose.dev.yml -p dev pull app
BACKEND_TAG=dev docker compose --env-file infra/.env -f infra/docker-compose.dev.yml -p dev up -d --build
```

Verify:

```bash
curl -s https://dev.duitlater.com/health
curl -s https://dev.duitlater.com/api/v1/health
```

### 13. Recurring release

Prod after `main` changes:

```bash
cd /home/ubuntu/duitlater
git pull origin main
docker compose --env-file infra/.env -f infra/docker-compose.prod.yml -p prod pull app
docker compose --env-file infra/.env -f infra/docker-compose.prod.yml -p prod up -d app
```

Dev after `dev` changes:

```bash
cd /home/ubuntu/duitlater
git pull origin dev
BACKEND_TAG=dev docker compose --env-file infra/.env -f infra/docker-compose.dev.yml -p dev pull app
BACKEND_TAG=dev docker compose --env-file infra/.env -f infra/docker-compose.dev.yml -p dev up -d app
```

---

## Free Multi-VPS Mode

Goal: keep cost low and avoid WireGuard. Use multiple VPS records behind Cloudflare Free DNS, sync uploaded files with Syncthing, and keep database architecture explicit.

### What is free and works now

| Need | Free approach |
|---|---|
| One domain on several VPS origins | Cloudflare Free DNS with multiple proxied A records |
| `duitlater.com` and `dev.duitlater.com` | Both hostnames get the same set of VPS records |
| Local image/PDF upload sync | Syncthing between VPS folders |
| No WireGuard | Public IP allowlist only |
| Manual incident failover | Remove broken VPS IP from Cloudflare DNS |

DNS example:

```text
duitlater.com       A   <VPS_1_IP>   proxied
duitlater.com       A   <VPS_2_IP>   proxied
duitlater.com       A   <VPS_3_IP>   proxied
dev.duitlater.com   A   <VPS_1_IP>   proxied
dev.duitlater.com   A   <VPS_2_IP>   proxied
dev.duitlater.com   A   <VPS_3_IP>   proxied
```

Limitations:
- Cloudflare Free DNS is not a health-checked load balancer.
- It does not guarantee automatic failover.
- If a VPS breaks, remove that IP manually from both DNS records.
- `dig +short duitlater.com` returns Cloudflare proxy IPs when proxied, not the VPS IPs.

### Database reality

Current compose baseline runs local Postgres inside each prod/dev stack. True multi-VPS shared database or Postgres replication is **not fully implemented by compose yet**.

Use one of these modes:

| Mode | Status | Use when |
|---|---|---|
| Single VPS prod/dev | Works with current compose | Demo, staging, first production |
| Multi-VPS DNS + independent DB per VPS | Possible but not safe for real writes | Static/demo only |
| Multi-VPS with one primary DB | Requires publishing/allowlisting Postgres or external DB | Next infra step |
| Full Postgres streaming replication | Planned in docs, not compose-complete | Later HA step |

For current compose baseline, use Docker service names:

```env
# prod
DATABASE_URL=postgresql://duitlater:<secret>@duitlater-prod-postgres:5432/duitlater

# dev
DATABASE_URL=postgresql://duitlater:<secret>@duitlater-dev-postgres:5432/duitlater_dev
```

Do not Syncthing Postgres data directories. Syncthing is for uploaded files only.

### Syncthing setup

On each VPS:

```bash
sudo mkdir -p /var/lib/duitlater/prod/uploads
sudo mkdir -p /var/lib/duitlater/dev/uploads
sudo mkdir -p /var/lib/duitlater/syncthing/config
sudo chown -R 1000:1000 /var/lib/duitlater

docker compose --env-file infra/.env -f infra/docker-compose.sync.yml -p sync up -d
```

Open Syncthing GUI through SSH tunnel:

```bash
ssh -L 8384:127.0.0.1:8384 ubuntu@<VPS_IP>
```

Then open:

```text
http://127.0.0.1:8384
```

Create and share two folders:

```text
prod-uploads -> /var/syncthing/prod-uploads
dev-uploads  -> /var/syncthing/dev-uploads
```

Recommended mode:
- Send & Receive on all VPS peers.
- Do not sync database folders.
- Do not expose Syncthing GUI publicly.
- Allow port `22000` only between VPS public IPs.

---

## Alibaba Function Compute

Alibaba Function Compute is optional for Penasihat AI.

Backend env:

```env
ALIBABA_FUNCTION_COMPUTE_URL=
ALIBABA_FUNCTION_COMPUTE_URL_NADI=
ALIBABA_FUNCTION_COMPUTE_KEY=
```

Behavior:
- If `ALIBABA_FUNCTION_COMPUTE_URL` and key are configured, backend calls Alibaba for Penasihat suggestions.
- If Alibaba is missing or fails, backend uses local heuristic fallback.
- `ALIBABA_FUNCTION_COMPUTE_URL_NADI` is reserved for future NADI summary work.

Test after configuration:

```bash
curl -s https://duitlater.com/api/v1/health
```

Then use the frontend pool flow to request suggestions for a locked pool.

---

## Uploads

Current upload mode is local disk:

```env
UPLOAD_DRIVER=local
UPLOAD_ROOT=/data/uploads
UPLOAD_PUBLIC_PATH=/uploads
UPLOAD_MAX_MB=10
UPLOAD_ALLOWED_MIME=image/jpeg,image/png,image/webp,application/pdf
```

Backend route:

```text
POST /api/v1/uploads
```

Security behavior:
- Auth required.
- Randomized stored filename.
- MIME allowlist.
- Basic magic-byte validation.
- File metadata stored in `UploadAsset`.
- Public URL served under `/uploads/*` by Caddy.

VPS host paths:

```text
/var/lib/duitlater/prod/uploads
/var/lib/duitlater/dev/uploads
```

---

## Verification Checklist

### Local

```bash
pnpm db:up
pnpm db:generate
pnpm db:migrate
pnpm --filter db seed:run
pnpm dev
curl http://localhost:4000/health
curl http://localhost:4000/api/v1/health
curl http://localhost:4000/api/v1/mykasih/products
```

### Static checks

```bash
pnpm --filter backend typecheck
pnpm --filter frontend typecheck
pnpm build
```

### Docker config checks

Syncthing:

```bash
docker compose -f infra/docker-compose.sync.yml config
```

Prod/dev require VPS env files first:

```bash
docker compose --env-file infra/.env -f infra/docker-compose.prod.yml -p prod config
docker compose --env-file infra/.env -f infra/docker-compose.dev.yml -p dev config
```

### Public deploy

```bash
curl -s https://duitlater.com/health
curl -s https://duitlater.com/api/v1/health
curl -s https://dev.duitlater.com/health
curl -s https://dev.duitlater.com/api/v1/health
```

---

## Team Workflow

| Member | Role | Primary surface |
|---|---|---|
| Ijam | Business pitch lead, product voice | Pitch, demo narration, stakeholder framing |
| Mung | Backend and infra driver | API, schema, migrations, deploy |
| Akmal | Frontend engineer | UI, forms, interaction, frontend deploy |
| Kairu | Product manager and gatekeeper | Scope, testable outcomes, phase gates |
| MatNep | Design and brand | Visual direction, accessibility, deck polish |

Rules:
- Run `/maji-onboard` before project work.
- Pair through `/maji-pair` when collaborating.
- Use `/maji-gate` before declaring a phase complete.
- Commit generated memory files when Maji writes them.
- Keep code identifiers and comments in English unless the task explicitly needs BM.
- Keep product copy BM-first where the user sees financial decisions.

---

## Product Docs

| Doc | Purpose |
|---|---|
| [docs/product/PRD.md](./docs/product/PRD.md) | Product requirements |
| [docs/product/WORLD.md](./docs/product/WORLD.md) | Narrative and context |
| [docs/ai-methodology.md](./docs/ai-methodology.md) | Three-layer AI methodology |
| [docs/process/QUICKSTART.md](./docs/process/QUICKSTART.md) | Local bootstrap |
| [docs/process/DEVELOPMENT-PLAN.md](./docs/process/DEVELOPMENT-PLAN.md) | Phase plan |
| [docs/tech/ARCHITECTURE.md](./docs/tech/ARCHITECTURE.md) | System architecture |
| [docs/tech/multi-cloud-setup.md](./docs/tech/multi-cloud-setup.md) | Free multi-VPS guide |
| [infra/README.md](./infra/README.md) | Infra topology |
| [infra/RELEASE.md](./infra/RELEASE.md) | Release runbook |
| [docs/team/TEAM.md](./docs/team/TEAM.md) | R2-D2 roster |
| [docs/team/AGENTS.md](./docs/team/AGENTS.md) | AI agent guide |

Some older tech and pitch docs still contain pre-pivot wording. Treat this README, current code, `infra/README.md`, and `infra/RELEASE.md` as the setup source of truth.

---

## Troubleshooting

### `pnpm install` fails on native dependency

macOS:

```bash
xcode-select --install
pnpm install --frozen-lockfile
```

Ubuntu:

```bash
sudo apt install -y build-essential python3
pnpm install --frozen-lockfile
```

### `DATABASE_URL is required`

Create env files:

```bash
cp packages/db/.env.example packages/db/.env
cp packages/backend/.env.example packages/backend/.env
```

Then confirm `packages/backend/.env` has no trailing space in the filename.

### Port 5432 is already used

Another Postgres is running. Stop it or change `infra/docker-compose.local.yml`.

```bash
docker ps
pnpm db:down
```

### Backend says Prisma client is missing or model does not exist

Regenerate Prisma client:

```bash
pnpm db:generate
```

### Public `/api/v1/*` returns 404 through Caddy

Caddy must preserve `/api`. Correct route style:

```caddy
handle /api/* {
    reverse_proxy duitlater-prod-app:4000
}
```

Do not use `handle_path /api/*` for this backend because the Hono routes include `/api`.

### `dev.duitlater.com` deploys the prod backend image

Current dev compose uses `BACKEND_TAG`. Start dev with:

```bash
BACKEND_TAG=dev docker compose --env-file infra/.env -f infra/docker-compose.dev.yml -p dev up -d --build
```

### Upload appears on one VPS but not another

Check:

```bash
docker compose --env-file infra/.env -f infra/docker-compose.sync.yml -p sync ps
```

Then open Syncthing through SSH tunnel and confirm:
- devices are paired
- `prod-uploads` is shared
- `dev-uploads` is shared
- folder status is `Up to Date`

### Cloudflare Free DNS still sends users to a broken VPS

This is expected with free DNS round-robin. Remove the broken VPS IP from:

```text
duitlater.com
dev.duitlater.com
```

Add it back only after:

```bash
curl -s https://<fixed-hostname-or-ip>/health
```

---

## License

Built for TNG FINHACK 2026 Financial Inclusion track by team R2-D2. Final post-hackathon license to be confirmed before public distribution.

---

<p align="center">
<strong>Sendiri tak mampu, ramai-ramai boleh.</strong><br>
<em>DuitLater by R2-D2 · KrackedDevs</em>
</p>
