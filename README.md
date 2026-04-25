# R2-D2-Finhack

A monorepo managed with [pnpm workspaces](https://pnpm.io/workspaces).

## Structure

```
R2-D2-Finhack/
├── packages/
│   ├── backend/     # API server
│   ├── frontend/    # Web client
│   └── db/          # Database schema & migrations
├── pnpm-workspace.yaml
└── package.json
```

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 9

```bash
npm install -g pnpm
```

## Getting Started

```bash
# Install all dependencies across packages
pnpm install

# Run all packages in dev mode
pnpm dev

# Build all packages
pnpm build
```

## Packages

### `packages/backend`

API server. See [`packages/backend/README.md`](packages/backend/README.md) for details.

```bash
pnpm --filter backend dev
```

### `packages/frontend`

Web client. See [`packages/frontend/README.md`](packages/frontend/README.md) for details.

```bash
pnpm --filter frontend dev
```

### `packages/db`

Database schema and migrations. See [`packages/db/README.md`](packages/db/README.md) for details.

```bash
# Run migrations
pnpm --filter db migrate

# Generate new migration
pnpm --filter db migrate:new
```

## Workspace Commands

Run a command in a specific package:

```bash
pnpm --filter <package-name> <command>
```

Run a command across all packages:

```bash
pnpm -r <command>
```

Add a dependency to a specific package:

```bash
pnpm --filter <package-name> add <dependency>
```

Add a shared dev dependency at the root:

```bash
pnpm add -D -w <dependency>
```
