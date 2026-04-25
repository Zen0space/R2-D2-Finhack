# DuitLater · Release Runbook (Free Multi-VPS)

End-to-end runbook for deploying dev + prod stacks to VPS/EC2 hosts using GHCR images, Caddy, Cloudflare Free DNS round-robin, and local upload sync.

> Topology overview: see [`infra/README.md`](./README.md). This doc is the **cookbook** — every command you'll run from "blank AWS account" to "two stacks live."

---

## Table of contents

1. [Prerequisites](#1-prerequisites)
2. [One-time AWS provisioning](#2-one-time-aws-provisioning)
3. [One-time EC2 host setup](#3-one-time-ec2-host-setup)
4. [Environment files](#4-environment-files)
5. [First deploy — prod then dev](#5-first-deploy)
6. [Recurring release flow](#6-recurring-release-flow)
7. [Rollback](#7-rollback)
8. [Common operations](#8-common-operations)
9. [Troubleshooting](#9-troubleshooting)
10. [Decommission](#10-decommission)

---

## 1. Prerequisites

| You need | Why |
|---|---|
| VPS/EC2 account with static public IPs | Provision the boxes |
| Domain `duitlater.com` in Cloudflare Free DNS | Multiple proxied A records for apex + `dev.` |
| GitHub PAT (classic) with `read:packages` scope | VPS authenticates to GHCR to pull images |
| Local SSH key pair | Connecting to EC2 |
| Peer VPS public IPs | Firewall allowlist for Postgres + Syncthing |

The Actions workflow `backend-release.yml` is already wired — no setup needed in GitHub beyond merging code.

---

## 2. One-time VPS provisioning

### 2.1 EC2 instance

| Setting | Value |
|---|---|
| Region | `ap-southeast-1` (Singapore) |
| AMI | Ubuntu Server 24.04 LTS (HVM, SSD) |
| Instance type | `t3.medium` (2 vCPU · 4 GB RAM) |
| Storage | 30 GB gp3, encrypted |
| Key pair | create or reuse — save `.pem` locally |

> **Why t3.medium and not t3.small:** frontend builds can still be memory-heavy until frontend image-pull automation lands.

### 2.2 Security Group

Create one SG, attach to the instance.

| Type | Port | Source | Purpose |
|---|---|---|---|
| SSH | 22 | team IPs (`/32` each) | console |
| HTTP | 80 | `0.0.0.0/0` | Caddy → ACME challenge + 80→443 redirect |
| HTTPS | 443 | `0.0.0.0/0` | Caddy serves both subdomains |
| Postgres | 5432 | peer VPS public IPs only | app-to-primary + replication |
| Syncthing | 22000 | peer VPS public IPs only | upload file sync |

Outbound: allow all (default).

### 2.3 Elastic IP

Allocate one EIP. Associate with the instance. Use this IP for DNS — without an EIP, a stop/start changes the public IP and breaks DNS.

### 2.4 DNS

In Cloudflare DNS, create these proxied records:

```
duitlater.com         A   <VPS_1_IP>   proxied
duitlater.com         A   <VPS_2_IP>   proxied
duitlater.com         A   <VPS_3_IP>   proxied
dev.duitlater.com     A   <VPS_1_IP>   proxied
dev.duitlater.com     A   <VPS_2_IP>   proxied
dev.duitlater.com     A   <VPS_3_IP>   proxied
```

Verify before continuing:
```bash
dig +short duitlater.com
dig +short dev.duitlater.com
```
Caddy needs both resolving correctly to obtain Let's Encrypt certs.
Cloudflare Free DNS has no paid health monitor; remove a broken VPS IP manually during incidents.

---

## 3. One-time EC2 host setup

```bash
ssh -i ~/.ssh/duitlater.pem ubuntu@<ELASTIC_IP>

# Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
docker --version       # sanity

# Authenticate to GHCR (paste your PAT when prompted)
echo "$GHCR_PAT" | docker login ghcr.io -u <github-username> --password-stdin

# Clone the repo (compose files + frontend build context live here)
git clone https://github.com/Zen0space/R2-D2-Finhack.git duitlater
cd duitlater
```

> **Why clone the repo at all** — the compose files live in the repo, and until the frontend Dockerfile ships, prod/dev compose `build:` from `../packages/frontend`. Once frontend image-pull lands, the repo on the VPS is only needed for compose files.

---

## 4. Environment files

`.env.prod` and `.env.dev` are **gitignored** and authored on the VPS. Use the examples as a starting point.

```bash
cd /home/ubuntu/duitlater

cp infra/.env.example infra/.env
nano infra/.env

# Backend
cp packages/backend/.env.example packages/backend/.env.prod
cp packages/backend/.env.example packages/backend/.env.dev
nano packages/backend/.env.prod         # fill all values
nano packages/backend/.env.dev          # fill all values

# Frontend
cp packages/frontend/.env.example packages/frontend/.env.prod
cp packages/frontend/.env.example packages/frontend/.env.dev
nano packages/frontend/.env.prod
nano packages/frontend/.env.dev
```

Each `.env.*` file must define at minimum:

| Variable | Prod example | Dev example |
|---|---|---|
| `POSTGRES_USER` | `duitlater` | `duitlater` |
| `POSTGRES_PASSWORD` | `<32-byte secret>` | `<different 32-byte secret>` |
| `POSTGRES_DB` | `duitlater` | `duitlater_dev` |
| `DATABASE_URL` | `postgresql://duitlater:<pwd>@<primary-vps-ip>:5432/duitlater` | `postgresql://duitlater:<pwd>@<primary-vps-ip>:5432/duitlater_dev` |
| `BETTER_AUTH_SECRET` | `<random 32 bytes>` | `<different random 32 bytes>` |
| `BETTER_AUTH_URL` | `https://duitlater.com` | `https://dev.duitlater.com` |
| `NODE_ENV` | `production` | `production` (yes — the dev *branch* runs in production mode on the VPS) |
| `CORS_ORIGIN` | `https://duitlater.com` | `https://dev.duitlater.com` |
| `FRONTEND_URL` | `https://duitlater.com` | `https://dev.duitlater.com` |
| `UPLOAD_ROOT` | `/data/uploads` | `/data/uploads` |
| `UPLOAD_PUBLIC_PATH` | `/uploads` | `/uploads` |

Generate secrets:
```bash
openssl rand -base64 32      # password / auth secret
```

Lock down the files:
```bash
chmod 600 infra/.env packages/backend/.env.* packages/frontend/.env.*
```

---

## 5. First deploy

**Order matters: prod first.** The prod stack creates the `duitlater_web` Docker network and runs Caddy. Dev joins that network as external.

### 5.1 Bring prod up

```bash
cd /home/ubuntu/duitlater

# Start upload sync service first
docker compose --env-file infra/.env -f infra/docker-compose.sync.yml -p sync up -d

# Pull the backend image, build the frontend (until Dockerfile pull lands)
docker compose --env-file infra/.env -f infra/docker-compose.prod.yml -p prod pull
docker compose --env-file infra/.env -f infra/docker-compose.prod.yml -p prod up -d --build

# Wait for postgres healthy
docker compose --env-file infra/.env -f infra/docker-compose.prod.yml -p prod ps

# Apply DB migrations inside the running app container
docker compose --env-file infra/.env -f infra/docker-compose.prod.yml -p prod exec app pnpm --filter db migrate
```

Verify:
```bash
curl -sI https://duitlater.com               # 200 / 308 from Caddy
curl -s  https://duitlater.com/health        # {"ok":true,"db":"connected","env":"production"}
curl -s  https://duitlater.com/api/v1/health # app/demo health
```

### 5.2 Bring dev up

```bash
docker compose --env-file infra/.env -f infra/docker-compose.dev.yml -p dev pull
docker compose --env-file infra/.env -f infra/docker-compose.dev.yml -p dev up -d --build
docker compose --env-file infra/.env -f infra/docker-compose.dev.yml -p dev exec app pnpm --filter db migrate
```

Verify:
```bash
curl -s https://dev.duitlater.com/health
curl -s https://dev.duitlater.com/api/v1/health
```

You now have two independent stacks behind one Caddy.

---

## 6. Recurring release flow

After the first deploy, every release is image-pull + restart. **No `--build`** for backend (we pull); `--build` for frontend stays until the frontend Dockerfile/workflow lands.

### 6.1 Dev release (push or merge to `dev` branch)

1. Push triggers `.github/workflows/backend-release.yml`.
2. CI builds + pushes `ghcr.io/zen0space/duitlater-backend:dev`.
3. SSH to the VPS:

```bash
cd /home/ubuntu/duitlater
git pull origin dev      # only needed if compose / Caddyfile changed

docker compose --env-file infra/.env -f infra/docker-compose.dev.yml -p dev pull app
docker compose --env-file infra/.env -f infra/docker-compose.dev.yml -p dev up -d app

# If schema changed
docker compose --env-file infra/.env -f infra/docker-compose.dev.yml -p dev exec app pnpm --filter db migrate

# Tail logs to confirm boot
docker compose --env-file infra/.env -f infra/docker-compose.dev.yml -p dev logs -f app
```

Smoke test:
```bash
curl -s https://dev.duitlater.com/health
```

### 6.2 Prod release (merge to `main`)

Same flow, prod compose:

```bash
cd /home/ubuntu/duitlater
git pull origin main

docker compose --env-file infra/.env -f infra/docker-compose.prod.yml -p prod pull app
docker compose --env-file infra/.env -f infra/docker-compose.prod.yml -p prod up -d app
docker compose --env-file infra/.env -f infra/docker-compose.prod.yml -p prod exec app pnpm --filter db migrate

curl -s https://duitlater.com/health
```

### 6.3 Frontend release (until image-pull lands)

```bash
cd /home/ubuntu/duitlater
git pull origin <branch>
docker compose --env-file infra/.env -f infra/docker-compose.<dev|prod>.yml -p <dev|prod> up -d --build frontend
```

Slow on `t3.medium` (~2-4 min for `next build`). Mitigate by merging less often or by shipping `packages/frontend/Dockerfile` + `frontend-release.yml`.

---

## 7. Rollback

Every backend image is also tagged with the commit SHA: `:sha-abc1234` for prod, `:dev-sha-abc1234` for dev. Roll back by pinning to a known-good SHA.

```bash
# 1. Find the SHA you want to revert to (in GHCR, GitHub commits, or `docker image ls`)
# 2. Edit the compose file's `image:` line:
#    image: ghcr.io/zen0space/duitlater-backend:sha-abc1234
# 3. Apply:
docker compose -f infra/docker-compose.prod.yml -p prod up -d app
```

Or override without editing the file:
```bash
BACKEND_TAG=sha-abc1234 docker compose --env-file infra/.env -f infra/docker-compose.prod.yml -p prod up -d app
```

**Database rollback is harder.** If a migration broke prod, restore from a `pg_dump` (see [§8](#8-common-operations)) — there is no auto-rollback for schema changes. Prefer forward-only migrations.

---

## 8. Common operations

### Logs

```bash
# Tail one service
docker compose -f infra/docker-compose.prod.yml -p prod logs -f app

# Last 200 lines, all services
docker compose -f infra/docker-compose.prod.yml -p prod logs --tail=200

# Caddy access log (JSON)
docker compose -f infra/docker-compose.prod.yml -p prod logs caddy | jq .
```

### Exec into a container

```bash
docker compose -f infra/docker-compose.prod.yml -p prod exec app sh
docker compose -f infra/docker-compose.prod.yml -p prod exec postgres psql -U duitlater duitlater
```

### Run a Prisma migration

```bash
docker compose -f infra/docker-compose.<env>.yml -p <env> exec app pnpm --filter db migrate
```

### Database backup

```bash
# Prod nightly snapshot
docker compose -f infra/docker-compose.prod.yml -p prod exec -T postgres \
  pg_dump -U duitlater duitlater | gzip > /home/ubuntu/backups/prod-$(date +%F).sql.gz

# Restore
gunzip -c prod-2026-04-25.sql.gz | docker compose -f infra/docker-compose.prod.yml -p prod exec -T postgres psql -U duitlater duitlater
```

Schedule via cron:
```cron
0 2 * * *  /home/ubuntu/scripts/backup-prod.sh
```

### Restart one service

```bash
docker compose -f infra/docker-compose.prod.yml -p prod restart app
```

### Reset dev database (destructive)

```bash
docker compose -f infra/docker-compose.dev.yml -p dev down -v   # -v drops volume
docker compose -f infra/docker-compose.dev.yml -p dev up -d
docker compose -f infra/docker-compose.dev.yml -p dev exec app pnpm --filter db migrate
```

> **Never run `down -v` on prod** — that deletes the Postgres volume.

---

## 9. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `docker pull` returns `denied` / `unauthorized` | GHCR PAT expired or missing scope | Regenerate PAT with `read:packages`, `docker login ghcr.io` again |
| Caddy serves but `/api/*` returns 502 | App container not healthy yet | `docker compose ... ps` — wait for `healthy`, check app logs |
| `dev.duitlater.com` shows prod content | Caddy didn't reload after Caddyfile change | `docker compose -f infra/docker-compose.prod.yml -p prod restart caddy` |
| Let's Encrypt cert pending forever | DNS hasn't propagated, or port 80 blocked | `dig +short <domain>` returns EIP? SG allows 80 from 0.0.0.0/0? |
| Frontend build OOMs on EC2 | `t3.small` not enough RAM | Resize to `t3.medium`, or wait for frontend image-pull |
| `connection refused` from app to postgres | Postgres not on shared network, or env var typo | `DATABASE_URL` host must match container name (`duitlater-prod-postgres`) |
| Dev stack can't reach Caddy | Network missing | Bring prod up first — it creates `duitlater_web`. Verify: `docker network inspect duitlater_web` |
| Migrations fail with `relation already exists` | Migration history out of sync | Check `_prisma_migrations` table, mark applied: `pnpm --filter db prisma migrate resolve --applied <name>` |

---

## 10. Decommission

Tearing down for cost reasons (post-hackathon):

```bash
# On the box
docker compose -f infra/docker-compose.dev.yml  -p dev  down
docker compose -f infra/docker-compose.prod.yml -p prod down
# (Add -v to delete data volumes; NOT REVERSIBLE)
```

In AWS console:
1. Take a final EBS snapshot if you want the data preserved
2. Disassociate + release Elastic IP (charges accrue while held idle)
3. Terminate EC2 instance
4. Delete Security Group

GHCR images stay; delete manually in GitHub → Packages if desired.

---

## Owner

Mung (primary deploy operator) · Ijam (sponsor credit + AWS account holder)

*Last updated: 2026-04-25 · post-monorepo restructure*
