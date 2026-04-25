# Infra — DuitLater Deployment

**Docker · Caddy · GHCR · VPS · Cloudflare Free DNS · local upload sync**

> **Deploying?** Use **[RELEASE.md](./RELEASE.md)** — the full AWS runbook (provision → first deploy → recurring releases → rollback → troubleshooting). This file is the topology overview and file map.

---

## Files

```
infra/
├── Caddyfile                       # reverse proxy: routes 2 subdomains to 2 stacks
├── docker-compose.local.yml        # laptop dev — Postgres only
├── docker-compose.dev.yml          # VPS dev stack  (dev branch  → dev.duitlater.com; joins prod Caddy network)
├── docker-compose.prod.yml         # VPS prod stack (main branch → duitlater.com)
├── docker-compose.sync.yml         # host-level Syncthing for local uploads
├── .env.example                    # copy to infra/.env on each VPS
└── README.md
```

Pre-baked secrets (gitignored, EC2 only):
- `../packages/backend/.env.prod`, `../packages/backend/.env.dev`
- `../packages/frontend/.env.prod`, `../packages/frontend/.env.dev`

---

## Topology

```
                 duitlater.com  ─────┐
                                      ├──► Caddy (in prod stack) ──► routes by Host
            dev.duitlater.com  ─────┘
                                            │
       ┌────────────────────────────────────┴────────────────────────────┐
       │                                                                  │
   docker compose -p prod                              docker compose -p dev
   ├ duitlater-prod-frontend                           ├ duitlater-dev-frontend
   ├ duitlater-prod-app    (image :latest)             ├ duitlater-dev-app  (image :dev)
   └ duitlater-prod-postgres                           └ duitlater-dev-postgres

   shared docker network: duitlater_web (created by prod, joined by dev as external)
   local upload folders: /var/lib/duitlater/{prod,dev}/uploads
```

Caddy lives in the **prod** stack and proxies to both projects via container DNS (`duitlater-prod-app`, `duitlater-dev-app`, …). Bring prod up before dev.
Syncthing runs once per VPS via `docker-compose.sync.yml` and syncs upload folders only; it never syncs Postgres data.

---

## Image strategy

| Branch | Workflow | Image tags pushed | Compose pulls |
|---|---|---|---|
| `main` | `.github/workflows/backend-release.yml` | `:latest` + `:sha-<short>` | `docker-compose.prod.yml` → `:latest` |
| `dev`  | same workflow                            | `:dev`    + `:dev-sha-<short>` | `docker-compose.dev.yml` → `:dev` |

Backend image: `ghcr.io/zen0space/duitlater-backend`.

> **TODO (Akmal):** add `packages/frontend/Dockerfile` + `frontend-release.yml`. Until then, prod and dev compose `build:` the frontend from source on the VPS.

---

## EC2 Spec

| Item | Value |
|---|---|
| Instance type | t3.medium (2 vCPU · 4 GB RAM) |
| AMI | Ubuntu 24.04 LTS |
| Storage | gp3 EBS · 30 GB |
| Region | ap-southeast-1 (Singapore) |
| Elastic IP | required |

**Security Group inbound:** 22 (team IPs) · 80 · 443.

**Cloudflare Free DNS round-robin:**
```
duitlater.com         A   <VPS_1_IP>   proxied
duitlater.com         A   <VPS_2_IP>   proxied
duitlater.com         A   <VPS_3_IP>   proxied
dev.duitlater.com     A   <VPS_1_IP>   proxied
dev.duitlater.com     A   <VPS_2_IP>   proxied
dev.duitlater.com     A   <VPS_3_IP>   proxied
```

Cloudflare Free has no origin health monitor or priority failover. Remove a bad VPS IP from DNS manually during an incident, or upgrade later to Cloudflare Load Balancing.

---

## Deploy — first time

```bash
ssh ubuntu@<ELASTIC_IP>
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER && newgrp docker

# Clone repo (only used for compose files + frontend build context for now)
git clone <repo-url> duitlater && cd duitlater

# Authenticate to GHCR (read-only PAT with `read:packages` scope)
echo "$GHCR_PAT" | docker login ghcr.io -u <github-username> --password-stdin

# Provision env files (gitignored — author by hand on the box)
cp infra/.env.example infra/.env
cp packages/backend/.env.example  packages/backend/.env.prod
cp packages/backend/.env.example  packages/backend/.env.dev
cp packages/frontend/.env.example packages/frontend/.env.prod
cp packages/frontend/.env.example packages/frontend/.env.dev
nano infra/.env packages/backend/.env.prod packages/backend/.env.dev packages/frontend/.env.prod packages/frontend/.env.dev

# Start Syncthing for upload folders first
docker compose --env-file infra/.env -f infra/docker-compose.sync.yml -p sync up -d

# Bring prod up first (creates the duitlater_web network + Caddy)
docker compose --env-file infra/.env -f infra/docker-compose.prod.yml -p prod pull
docker compose --env-file infra/.env -f infra/docker-compose.prod.yml -p prod up -d --build   # --build needed only until frontend image lands
docker compose --env-file infra/.env -f infra/docker-compose.prod.yml -p prod exec app pnpm --filter db migrate

# Then dev (joins the network)
docker compose --env-file infra/.env -f infra/docker-compose.dev.yml -p dev pull
docker compose --env-file infra/.env -f infra/docker-compose.dev.yml -p dev up -d --build
docker compose --env-file infra/.env -f infra/docker-compose.dev.yml -p dev exec app pnpm --filter db migrate
```

---

## Deploy — subsequent (after a `main` or `dev` push)

GitHub Actions builds + pushes the image. On the VPS:

```bash
# Prod (after main push)
cd /home/ubuntu/duitlater && git pull
docker compose --env-file infra/.env -f infra/docker-compose.prod.yml -p prod pull
docker compose --env-file infra/.env -f infra/docker-compose.prod.yml -p prod up -d
docker compose --env-file infra/.env -f infra/docker-compose.prod.yml -p prod exec app pnpm --filter db migrate

# Dev (after dev push)
cd /home/ubuntu/duitlater && git pull
docker compose --env-file infra/.env -f infra/docker-compose.dev.yml -p dev pull
docker compose --env-file infra/.env -f infra/docker-compose.dev.yml -p dev up -d
docker compose --env-file infra/.env -f infra/docker-compose.dev.yml -p dev exec app pnpm --filter db migrate
```

Both stacks live independently — restarting one does not touch the other.

---

## Local dev (laptop)

```bash
docker compose -f infra/docker-compose.local.yml up -d   # Postgres on :5432
pnpm --filter backend dev                                # :4000
pnpm --filter frontend dev                               # :3000
```

No Caddy, no images, no GHCR. See [docs/process/QUICKSTART.md](../docs/process/QUICKSTART.md).

---

## Owner

Mung (primary) · Ijam (sponsor credit redemption)
