# R2-D2-Finhack

A monorepo managed with [pnpm workspaces](https://pnpm.io/workspaces).

## Structure

```
R2-D2-Finhack/
├── packages/
│   ├── backend/     # API server
│   ├── frontend/    # Web client
│   └── db/          # Database schema & migrations (Prisma)
├── docker-compose.yml
├── pnpm-workspace.yaml
└── package.json
```

## Prerequisites

- [Node.js](https://nodejs.org/) >= 22
- [pnpm](https://pnpm.io/) >= 9
- [Docker](https://www.docker.com/) (for PostgreSQL)

```bash
npm install -g pnpm
```

## Getting Started

### First run (one-time setup)

```bash
# 1. Install dependencies across all packages
pnpm install

# 2. Start the PostgreSQL database in Docker
docker compose up -d

# 3. Run the initial database migration
cd packages/db
npx prisma migrate dev --name init

# 4. Open Prisma Studio to verify the database
npx prisma studio
# Opens http://localhost:5555
```

### Development

```bash
# Run all packages in dev mode (backend + frontend in parallel)
pnpm dev

# Build all packages
pnpm build

# Type-check all packages
pnpm typecheck

# Lint all packages
pnpm lint
```

## Packages

### `packages/backend`

API server.

```bash
pnpm --filter backend dev
```

### `packages/frontend`

Web client.

```bash
pnpm --filter frontend dev
```

### `packages/db`

Prisma schema, migrations, and generated client. All Prisma commands are run from inside this directory.

```bash
cd packages/db

npx prisma migrate dev --name <migration-name>   # Create & apply a new migration
npx prisma migrate deploy                         # Apply pending migrations (prod)
npx prisma generate                               # Regenerate Prisma client
npx prisma studio                                 # Open Prisma Studio (http://localhost:5555)
npx prisma db push                                # Push schema without a migration (prototyping)
```

## Database Setup

PostgreSQL runs in Docker via `docker-compose.yml`.

**Environment variables** — create `packages/db/.env` (gitignored):
```
DATABASE_URL=postgresql://kutu:kutu_dev@localhost:5432/kutu_digitizer
```

These match the defaults in `docker-compose.yml`.

```bash
# Start / stop
docker compose up -d
docker compose down

# View logs
docker compose logs -f postgres
```

## Workspace Commands

Add a dependency to a specific package:

```bash
pnpm --filter <package-name> add <dependency>
```

Add a shared dev dependency at the root:

```bash
pnpm add -D -w <dependency>
```

Run a command across all packages:

```bash
pnpm -r <command>
```

## Collaboration

Untuk dapatkan code terbaru (Sync):

```bash
git fetch origin dev
git merge origin/dev
```

Untuk update code ke repository:

```bash
git add .
git commit -m "(info)"
git push origin dev
```
