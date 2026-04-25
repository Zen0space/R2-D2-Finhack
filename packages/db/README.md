# db

Prisma schema, migrations, and generated client. Consumed by `backend` (and later `frontend`) via `workspace:*`.

## Quick start

```bash
# 1. Bring up Postgres (from repo root)
docker compose up -d postgres

# 2. Apply schema (creates the database tables)
pnpm --filter db migrate:new -- --name init

# 3. Sanity check
pnpm --filter db studio   # opens Prisma Studio at http://localhost:5555
```

## Scripts

| Script | What it does |
|---|---|
| `pnpm --filter db generate` | Regenerate Prisma client from `schema.prisma` |
| `pnpm --filter db migrate:new -- --name <x>` | Author a new migration in dev |
| `pnpm --filter db migrate` | Apply pending migrations (prod / EC2) |
| `pnpm --filter db studio` | Launch Prisma Studio GUI |
| `pnpm --filter db db:push` | Push schema without a migration (prototyping only) |

## Files

- `prisma/schema.prisma` — single source of truth for the data model
- `prisma/migrations/` — versioned SQL migrations (auto-generated)
- `.env` — local `DATABASE_URL` (gitignored; copy from `.env.example`)
- `src/index.ts` — re-exports `PrismaClient` and a singleton `prisma` instance

## Schema today

Just a `HealthCheck` smoke-test model so we can verify Postgres + Prisma talk to each other before layering on the real Kutu domain (tabung, members, ledger, rotations).
