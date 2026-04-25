# Quickstart — Kutu Digitizer

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
git clone <repo-url> kutu-digitizer
cd kutu-digitizer

# 2. Backend
cd backend
cp .env.example .env
npm install
cd ..

# 3. Frontend
cd frontend
cp .env.example .env
npm install
cd ..

# 4. Start Postgres
docker compose -f docker-compose.dev.yml up -d

# 5. (Optional but recommended) verify Postgres is up
docker compose -f docker-compose.dev.yml ps
```

---

## Running locally (two terminals)

```bash
# Terminal 1 — backend (:4000)
cd backend
npm run dev

# Terminal 2 — frontend (:3000)
cd frontend
npm run dev
```

---

## Phase 0 testable outcome

- Frontend renders at <http://localhost:3000>
- `curl http://localhost:4000/health` → `{"ok":true,"service":"kutu-backend","env":"development"}`

If both pass: Phase 0 complete. Kairu's Tangga Hidup is ready to bear Phase 1.

---

## Phase 1 (Auth + First Tabung) kickoff

```bash
cd backend
# Author the schema in src/db/schema.ts (users, sessions, tabung, tabung_members)
npm run db:generate   # generates migration file
npm run db:migrate    # applies it to Postgres
```

Then wire Better Auth + tabung routes per [DEVELOPMENT-PLAN.md](./DEVELOPMENT-PLAN.md) Phase 1.

---

## What was pre-scaffolded

- Backend: Hono server with `/health`, env validation, Drizzle client + config, pino logger, Dockerfile
- Frontend: Next.js 15 App Router, Tailwind v4 with brand tokens, landing page at `/`, Dockerfile
- Infra: `docker-compose.dev.yml` (Postgres only), `docker-compose.prod.yml` (4-container spine), `Caddyfile` (path-routing)
- Docs: `pitch-deck.md`, `pitch-narration.md`

## What still needs team authoring (not pre-scaffolded, by design)

- `src/db/schema.ts` actual tables — Mung drafts in Phase 1 huddle
- Better Auth config + middleware — Mung drafts in Phase 1
- Tabung routes + frontend pages — Mung + Akmal in Phase 1
- shadcn/ui components — run `npx shadcn@latest init` when Phase 1 needs the first input/button

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `DATABASE_URL is required` | `cp .env.example .env` in `backend/` |
| Port 5432 already in use | Another Postgres is running. Stop it, or change port in `docker-compose.dev.yml` |
| `npm install` fails on `argon2` | Needs build-essentials + python. On macOS: `xcode-select --install`. On Ubuntu: `sudo apt install -y build-essential python3` |
| Next.js complains about Turbopack | Remove `--turbo` from `dev` script in `frontend/package.json` — fallback to webpack |
| Frontend shows default colors, not brand palette | Check `globals.css` imported `"tailwindcss"` and PostCSS picked up `@tailwindcss/postcss` |

---

*Pre-scaffolded by Prime · Imperial Day 499 · 06:30 MYT · ready for team at 09:00 huddle*
