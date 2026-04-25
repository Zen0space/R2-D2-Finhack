# Quickstart — DuitLater

**For the team arriving Saturday morning at Bangsar South CCEC.**

Phase 0 scaffolds are pre-built. You do not need to `npm init`, `create-next-app`, or write any config files from scratch. Run the commands below and you are at Phase 0 testable outcome.

---

## Step 0 — Maji-core onboarding (~2 min)

Before touching any code: open the repo in your IDE and type `/maji-onboard` in the AI chat. The AI will ask your name, show your role card, current phase task, and create your personal memory file.

This is your first move. Skip it and the rest of the team won't see your state on `/maji-phase`.

After onboarding, commit + push your memory file so the rest of the team picks it up:

```bash
git add maji-core/memory/members/<your-name>.json
git commit -m "onboard: <your-name> first session"
git push
```

If your IDE doesn't autocomplete `/maji-onboard`, just type it in chat anyway — Cursor / Codex / generic AI chat all read [AGENTS.md](./AGENTS.md) at repo root and will execute the flow. See [maji-core/README.md](./maji-core/README.md) → "Slash command mechanism by IDE" for details.

---

## One-time bootstrap (~10 min)

```bash
# 1. Clone the repo
git clone <repo-url> duitlater
cd duitlater

# 2. Install workspace dependencies
pnpm install

# 3. Local env files
cp packages/db/.env.example packages/db/.env
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env.local

# 4. Start Postgres
pnpm db:up

# 5. (Optional but recommended) verify Postgres is up
docker compose -f infra/docker-compose.local.yml ps

# 6. Apply migrations + seed demo data
pnpm db:migrate
pnpm --filter db seed:run
```

---

## Running locally

```bash
pnpm dev
```

---

## Phase 0 testable outcome

- Frontend renders at <http://localhost:3000>
- `curl http://localhost:4000/health` → `{"ok":true,"db":"connected","env":"development"}`
- `curl http://localhost:4000/api/v1/health` → app/demo health

If both pass: Phase 0 complete. Kairu's Tangga Hidup is ready to bear Phase 1.

---

## Phase 1 (Auth + Individual PayLater) kickoff

```bash
# Author schema in packages/db/prisma/schema.prisma
pnpm db:migrate:new -- --name <migration-name>
pnpm db:migrate
```

Better Auth and `/api/v1/me` are already wired; continue from the current phase in [DEVELOPMENT-PLAN.md](./DEVELOPMENT-PLAN.md).

---

## What was pre-scaffolded

- Backend: Hono server with `/health`, `/api/v1/*`, Better Auth, local upload route, Dockerfile
- Frontend: Next.js 15 App Router, Tailwind v4 with brand tokens, landing page at `/`, Dockerfile
- Infra: `infra/docker-compose.local.yml` (laptop Postgres), `infra/docker-compose.dev.yml` + `infra/docker-compose.prod.yml` (VPS dev/prod stacks), `infra/docker-compose.sync.yml` (Syncthing uploads), `infra/Caddyfile` (two-subdomain routing)
- Docs: `pitch-deck.md`, `pitch-narration.md`

## What still needs team authoring (not pre-scaffolded, by design)

- `src/db/schema.ts` actual tables — Moon drafts in Phase 1 huddle
- Better Auth config + middleware — Moon drafts in Phase 1
- Tabung routes + frontend pages — Moon + Akmal in Phase 1
- Additional production hardening and UI polish
- Full automated tests for upload/proxy/failover paths
- shadcn/ui components — run `npx shadcn@latest init` when Phase 1 needs the first input/button

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `DATABASE_URL is required` | `cp packages/backend/.env.example packages/backend/.env` and `cp packages/db/.env.example packages/db/.env` |
| Port 5432 already in use | Another Postgres is running. Stop it, or change port in `infra/docker-compose.local.yml` |
| `pnpm install` fails on `argon2` | Needs build-essentials + python. On macOS: `xcode-select --install`. On Ubuntu: `sudo apt install -y build-essential python3` |
| Next.js complains about Turbopack | Remove `--turbo` from `dev` script in `packages/frontend/package.json` — fallback to webpack |
| Frontend shows default colors, not brand palette | Check `globals.css` imported `"tailwindcss"` and PostCSS picked up `@tailwindcss/postcss` |

---

*Pre-scaffolded by Prime · Imperial Day 499 · 06:30 MYT · ready for team at 09:00 huddle*
