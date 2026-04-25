# Pusat Tabung — Complete Tech Stack Manifest

**Quest:** TNG FINHACK 2026 · Financial Inclusion · Kutu Digitizer
**Duration:** 48 hours (25-26 April 2026)
**Deploy target:** Single EC2 instance (t3.medium · ap-southeast-1)
**Sponsor credits:** AWS · Alibaba Cloud
**Last updated:** Imperial Day 499 (2026-04-25) · pnpm-workspace + Prisma + PWA-first revision

---

## TL;DR — Full Inventory

| Layer | Count | Category |
|---|---|---|
| Core mandated (TNG) | 5 | Runtime · Language · DB · Storage · Auth |
| Monorepo tooling | 2 | pnpm · `packages/db` workspace pkg |
| Backend critical | 12 | Framework · Prisma · Validation · SDKs |
| Backend recommended | 8 | Scheduled jobs · Logging · Utilities |
| Frontend critical | 11 | Framework · Styling · Data · Forms |
| Frontend recommended | 7 | Viz · Animation · QR · Toasts |
| **PWA (primary deliverable)** | **5** | Serwist · manifest · icons · offline · install-prompt |
| Infrastructure | 8 | Docker · Caddy · EC2 · DNS · S3 |
| Optional / monitoring | 6 | Sentry · Vitest · CI · CloudWatch |
| Demo assets | 3 | OBS · Canva · Figma |
| **TOTAL** | **67** | Full stack |

---

## Section 0 — TNG Core Mandates

Locked by organizer. Non-negotiable.

| # | Tech | Version | Role |
|---|---|---|---|
| 1 | Node.js | 22.x LTS | Runtime (Active LTS as of 2026) |
| 2 | TypeScript | 5.7+ | Language |
| 3 | PostgreSQL | 17.x | Primary database |
| 4 | AWS S3 | — | Object storage |
| 5 | Better Auth | latest | Authentication |

---

## Section 0.5 — Monorepo Layout (pnpm Workspace)

Single repo, three workspace packages — layout inherited from the existing scaffold (`README.md`). **pnpm** chosen for content-addressable store, strict dep resolution (no phantom deps), and `workspace:*` protocol so backend and frontend both consume the Prisma client + zod schemas from `packages/db`.

### Layout

```
R2-D2-Finhack/
├── package.json           # workspace root (private, scripts only)
├── pnpm-workspace.yaml    # workspace declarations
├── pnpm-lock.yaml         # single lockfile for entire repo
├── .npmrc                 # node-linker=hoisted if Next.js needs it
└── packages/
    ├── backend/           # Hono API (Node 22)
    │   ├── package.json
    │   └── src/
    ├── frontend/          # Next.js 15 App Router · PWA target
    │   ├── package.json
    │   ├── public/
    │   │   ├── manifest.webmanifest
    │   │   └── icons/        # 192, 512, maskable
    │   └── src/
    └── db/                # Prisma schema · migrations · generated client · zod types
        ├── package.json
        ├── prisma/
        │   ├── schema.prisma
        │   └── migrations/
        └── src/
            └── index.ts      # re-exports PrismaClient + generated zod
```

Package names (per `README.md`): `backend`, `frontend`, `db`. Filtered as `pnpm --filter db migrate`, etc.

### Root files

**`pnpm-workspace.yaml`:**
```yaml
packages:
  - 'packages/*'
```

**Root `package.json`:**
```json
{
  "name": "r2-d2-finhack",
  "private": true,
  "packageManager": "pnpm@9.15.0",
  "engines": {
    "node": ">=22.0.0",
    "pnpm": ">=9.0.0"
  },
  "scripts": {
    "dev": "pnpm --parallel --filter './packages/{backend,frontend}' dev",
    "build": "pnpm --filter db generate && pnpm -r build",
    "lint": "pnpm -r lint",
    "typecheck": "pnpm -r typecheck",
    "db:generate": "pnpm --filter db generate",
    "db:migrate": "pnpm --filter db migrate",
    "db:migrate:new": "pnpm --filter db migrate:new",
    "db:studio": "pnpm --filter db studio"
  }
}
```

**`.npmrc` (if Next.js plugin resolution misbehaves with hoisting):**
```
node-linker=hoisted
strict-peer-dependencies=false
auto-install-peers=true
```

### Workspace dep wiring

`backend` and `frontend` both depend on `db` via the `workspace:*` protocol — pnpm symlinks it locally:

```json
// packages/backend/package.json
"dependencies": {
  "db": "workspace:*"
}

// packages/frontend/package.json
"dependencies": {
  "db": "workspace:*"
}
```

This gives one source of truth for: Prisma schema → generated client (used by backend) → generated zod schemas (used by both for validation) → inferred TS types (used by frontend forms + RQ).

---

## Section 1 — Backend (Node + TS + Postgres)

### 1.1 Runtime & Framework

| Package | Version | Role | Why |
|---|---|---|---|
| `hono` | ^4.6 | HTTP framework | Fastest modern TS framework, middleware-first, minimal bloat |
| `@hono/node-server` | ^1.13 | Node adapter | Runs Hono on Node runtime |
| `tsx` | ^4.19 | Dev TS runner | Zero-config TS execution in dev |
| `typescript` | ^5.7 | Type system | Strict mode mandatory |

### 1.2 Database & ORM (Prisma — lives in `packages/db`)

| Package | Version | Workspace | Role |
|---|---|---|---|
| `prisma` | ^6.1 | db (devDep) | CLI: schema, migrate, generate, studio |
| `@prisma/client` | ^6.1 | db (dep) | Generated type-safe client (re-exported to backend) |
| `zod-prisma-types` | ^3.2 | db (devDep) | Generator: emits zod schemas alongside Prisma client (`prisma generate` produces both) |
| `pg` | ^8.13 | backend | Raw driver — only needed because Better Auth uses node-postgres directly |

**Why Prisma over Drizzle for this project:**
- Single declarative schema file (`schema.prisma`) — easier handoff between Mung, Mahir, Kinetic during 48h crunch
- `prisma migrate dev` workflow is more forgiving than hand-edited SQL migrations
- Prisma Studio gives judges a visible "ledger inspector" during demo
- Better Auth ships a first-class Prisma adapter (Section 7.2)

### 1.3 Validation & Environment

| Package | Version | Role |
|---|---|---|
| `zod` | ^3.23 | Request/response validation · forms · shared (auto-generated from Prisma via `zod-prisma-types`) |
| `@t3-oss/env-core` | ^0.11 | Runtime env-var validation (fail fast on missing vars) |
| `dotenv` | ^16.4 | Load `.env` files (dev only) |

### 1.4 Authentication

| Package | Version | Role |
|---|---|---|
| `better-auth` | ^1.1 | Auth library (runs inside app, not separate service) — uses **Prisma adapter** |
| `argon2` | ^0.41 | Password hashing (Better Auth peer) |

### 1.5 AWS S3

| Package | Version | Role |
|---|---|---|
| `@aws-sdk/client-s3` | ^3.700 | S3 SDK v3 (modular) |
| `@aws-sdk/s3-request-presigner` | ^3.700 | Presigned URL generator (direct-upload pattern) |

### 1.6 AI — Claude (Penasihat)

| Package | Version | Role |
|---|---|---|
| `@anthropic-ai/sdk` | ^0.32 | Claude API client (streaming + non-streaming) |

### 1.7 Utilities — Scheduled jobs, dates, IDs, money

| Package | Version | Role |
|---|---|---|
| `node-cron` | ^3.0 | Monthly rotation triggers (core Kutu feature) |
| `date-fns` | ^4.1 | Date arithmetic (v4 — built-in TZ support) |
| `nanoid` | ^5.0 | Short secure IDs + invite codes (`KT-A1B2C3`) |
| `dinero.js` (optional) | ^2.0 | Money math — or stick to integer cents approach |

### 1.8 Logging & Observability

| Package | Version | Role |
|---|---|---|
| `pino` | ^9.5 | Structured JSON logging (fast) |
| `pino-pretty` | ^13.0 | Dev console formatter for readable logs |
| `hono-pino` | ^0.7 | Hono → pino middleware integration |

### 1.9 Security

| Package | Version | Role |
|---|---|---|
| `hono/cors` | (built-in) | CORS middleware (only if Pattern B subdomain split) |
| `hono-rate-limiter` | ^0.4 | API rate limiting (public endpoints) |
| `hono/secure-headers` | (built-in) | CSP, X-Frame-Options, HSTS, etc |

### 1.10 TNG eWallet Integration

| Package | Version | Role |
|---|---|---|
| Native `fetch` (Node 22) | — | HTTP client for TNG sandbox API |
| `undici` | ^6.21 | Lower-level HTTP if streaming/pooling needed |
| `jose` | ^5.9 | JWT/JWS signing if TNG uses signed requests |

*Confirm TNG SDK existence Saturday pagi at sponsor booth. If they provide an SDK, use theirs. If not, native fetch + their documented auth header pattern.*

### 1.11 Testing (Optional for 48h)

| Package | Version | Role |
|---|---|---|
| `vitest` | ^2.1 | Test runner |
| `@vitest/ui` | ^2.1 | Test UI |
| `supertest` | ^7.0 | HTTP endpoint testing |
| `msw` | ^2.6 | Mock external APIs in tests |

*Skip unless team has dedicated time. Hackathon QA = manual testing + Sahih's triple-prism.*

### 1.12 Dev Tooling

| Package | Version | Role |
|---|---|---|
| `eslint` | ^9.16 | Linter (flat config) |
| `typescript-eslint` | ^8.18 | TS-aware lint rules (unified package, replaces split plugin/parser) |
| `prettier` | ^3.4 | Formatter |
| `@types/node` | ^22.10 | Node 22 type definitions |
| `@types/pg` | ^8.11 | pg type definitions |
| `@types/node-cron` | ^3.0 | node-cron types |

---

## Section 2 — Frontend (Next.js + React)

### 2.1 Framework

| Package | Version | Role |
|---|---|---|
| `next` | ^15.1 | App Router framework · standalone output for Docker |
| `react` | ^19.0 | Bundled with Next (stable Dec 2024) |
| `react-dom` | ^19.0 | Bundled with Next |

### 2.2 Styling

| Package | Version | Role |
|---|---|---|
| `tailwindcss` | ^4.0 | Styling (Oxide engine — Rust-powered) |
| `@tailwindcss/postcss` | ^4.0 | PostCSS plugin for v4 |
| `tw-animate-css` | ^1.2 | Animation utilities (replaces deprecated `tailwindcss-animate` for v4) |
| `class-variance-authority` | ^0.7 | Variant-based component styling |
| `clsx` | ^2.1 | Conditional className joiner |
| `tailwind-merge` | ^2.5 | Merge conflicting Tailwind classes |

### 2.3 Component Library — shadcn/ui

**Not a pnpm install — copy-paste pattern via CLI (run from `packages/frontend`):**

```bash
npx shadcn@latest init
npx shadcn@latest add button input form label card dialog dropdown-menu \
                      select checkbox radio-group switch textarea toast \
                      avatar badge tabs sheet separator
```

**shadcn brings as peer deps (installed automatically):**
- `@radix-ui/react-*` (dozens of primitives)
- `cmdk` (command palette)
- `vaul` (drawers)

### 2.4 Icons

| Package | Version | Role |
|---|---|---|
| `lucide-react` | ^0.469 | Icon set (matches shadcn, clean stroke) |

### 2.5 State & Data Fetching

| Package | Version | Role |
|---|---|---|
| `@tanstack/react-query` | ^5.62 | Server state · no useEffect for fetching |
| `better-auth` | ^1.1 | Client auth hooks via `better-auth/react` (same package as backend) |
| `zustand` (optional) | ^5.0 | Light client state (v5 — React 19 ready) |

### 2.6 Forms & Validation

| Package | Version | Role |
|---|---|---|
| `react-hook-form` | ^7.54 | Form state management |
| `@hookform/resolvers` | ^3.9 | zod adapter for react-hook-form |
| `zod` | ^3.23 | Shared schemas via `db` workspace (auto-generated from Prisma) |

### 2.7 Visualization & Animation

| Package | Version | Role |
|---|---|---|
| `recharts` | ^2.15 | Charts (ledger trends, trust-score history, rotation timeline) |
| `motion` | ^11.15 | Micro-interactions (rebrand of `framer-motion`; same API) |
| `sonner` | ^1.7 | Toast notifications (shadcn-compatible) |

### 2.8 QR Codes & Invites

| Package | Version | Role |
|---|---|---|
| `qrcode` | ^1.5 | Server-side QR generation (invite PDFs etc) |
| `react-qr-code` | ^2.0 | Client-side QR display (invite screen) |

### 2.9 Utilities

| Package | Version | Role |
|---|---|---|
| `date-fns` | ^4.1 | Display dates, relative time, countdowns |
| `nanoid` | ^5.0 | Client-side IDs if needed |

### 2.10 PWA — **Primary deliverable** (not optional)

Kutu Digitizer ships **as a PWA first**. The pitch story is "install on phone, run offline-tolerant, push install prompt during demo." This isn't a late add-on — it's a Day 1 scaffolding step in `packages/frontend`.

| Package | Version | Role |
|---|---|---|
| `@serwist/next` | ^9.0 | Next.js plugin — wires service worker into App Router build |
| `serwist` | ^9.0 | Service worker runtime (Workbox successor, TS-first) |
| `@serwist/sw` | ^9.0 | Service-worker-side helpers (precaching, runtime caching) |

**Required asset checklist (lives in `packages/frontend/public/`):**

| Asset | Purpose |
|---|---|
| `manifest.webmanifest` | App metadata (name, theme_color, icons array, display: "standalone", start_url) |
| `icons/icon-192.png` | Android home-screen icon |
| `icons/icon-512.png` | Splash screen icon |
| `icons/icon-maskable-512.png` | Android adaptive icon (safe zone) |
| `icons/apple-touch-icon.png` | iOS home-screen icon (180×180) |
| `app/offline/page.tsx` | Fallback page when service worker has no cache hit and network fails |

**Caching strategy (configured in `app/sw.ts`):**

| Route pattern | Strategy | Rationale |
|---|---|---|
| `/_next/static/*` | CacheFirst | Build-versioned, immutable |
| `/api/auth/*` | NetworkOnly | Never cache auth |
| `/api/tabung/*` | NetworkFirst (5s timeout → cache) | Show stale ledger if offline |
| `/api/penasihat/chat` | NetworkOnly | LLM responses must be fresh |
| Pages (`document` requests) | NetworkFirst with offline fallback | Graceful degradation |
| `/icons/*`, fonts | CacheFirst | Static assets |

**Install prompt UX:**
- Capture `beforeinstallprompt` event in a client component, stash to zustand
- Surface custom "Pasang Kutu" button after first successful tabung action (intent signal)
- iOS doesn't fire `beforeinstallprompt` — show "Add to Home Screen" instructions in a `<Sheet>` triggered by user-agent sniff

**Demo script:** judge clicks install button → app opens standalone → kill wifi → app still loads cached tabung → reconnect → ledger syncs. Three-beat narrative.

### 2.11 Dev Tooling (Frontend)

| Package | Version | Role |
|---|---|---|
| `eslint-config-next` | ^15.1 | Next.js ESLint preset (includes `@next/eslint-plugin-next`) |
| `prettier-plugin-tailwindcss` | ^0.6 | Auto-sort Tailwind classes |

---

## Section 3 — Infrastructure & Deployment

### 3.1 Containerization

| Tool | Version | Role |
|---|---|---|
| Docker Engine | 24+ | Container runtime (EC2 + laptops) |
| Docker Compose | v2 plugin | Multi-container orchestration |

### 3.2 Reverse Proxy

| Tool | Version | Role |
|---|---|---|
| Caddy | 2.x-alpine | HTTPS termination · Let's Encrypt auto-SSL · path-based routing |

### 3.3 Host Environment (EC2)

| Item | Spec |
|---|---|
| Instance type | t3.medium (2 vCPU · 4 GB RAM) |
| AMI | Ubuntu 24.04 LTS (ami-0d3e5ee74e79c8ca7 · ap-southeast-1) |
| Storage | gp3 EBS · 30 GB |
| IP | Elastic IP (stable through reboots) |
| Region | ap-southeast-1 (Singapore) |
| Security Group | 22 (team IPs) · 80 (public) · 443 (public) |

### 3.4 DNS & Domain

| Item | Notes |
|---|---|
| Registrar | Namecheap / Porkbun / Cloudflare Registrar |
| Budget | RM 40-60/year |
| Record | `kutu.yourdomain.com` A → Elastic IP |
| SSL | Let's Encrypt via Caddy (automatic) |

### 3.5 AWS Services (Sponsor Credit)

| Service | Role |
|---|---|
| S3 | `kutu-uploads` bucket · presigned-URL uploads |
| IAM | Service-user credentials for app container |
| CloudWatch (optional) | Log aggregation + basic monitoring |
| SES (optional) | Transactional email (account verification) |

### 3.6 Alibaba Cloud (Sponsor Credit)

| Service | Role | Priority |
|---|---|---|
| ECS | Backup compute (scale-out story for judges) | Low |
| OSS | S3-compatible alternative if AWS unreachable | Fallback |
| RDS | Managed Postgres fallback | Fallback |

*Primary stack stays on VPS + AWS S3. Alibaba credit = scale-out narrative for pitch.*

---

## Section 4 — Monitoring & Observability (Optional)

| Tool | Role | Cost |
|---|---|---|
| `@sentry/node` + `@sentry/nextjs` | Error tracking across FE + BE | Free tier generous |
| Better Stack Uptime | Endpoint monitoring + status page | Free tier |
| AWS CloudWatch | Infra metrics (covered by sponsor credit) | Sponsor credit |
| Loki + Grafana (self-hosted) | Log aggregation | Skip for 48h |

*Add Sentry ONLY if setup takes <15 min. Otherwise skip — `docker compose logs` is sufficient for demo.*

---

## Section 5 — CI/CD (Optional)

| Tool | Role | 48h Verdict |
|---|---|---|
| GitHub Actions | Automated build + deploy to EC2 on push | Skip — manual SSH deploy faster to set up |
| Dependabot | Dependency PR automation | Skip for hackathon |
| Docker Hub / GHCR | Image registry | Skip — build on EC2 directly |

**Recommended 48h approach:** manual `git pull && docker compose up -d --build` on VPS. Automate POST-hackathon if project continues.

---

## Section 6 — Demo & Pitch Assets

| Tool | Role |
|---|---|
| Canva / Figma | 8-slide pitch deck (4-min pitch) |
| OBS Studio / Loom / QuickTime | 4-min demo video recording |
| Cleanshot X / macOS Screenshot | Screenshot assets for deck |
| ngrok (backup) | Public tunnel if VPS fails mid-demo |

---

## Section 7 — Integration Patterns

### 7.1 Single source of truth — `packages/db` (Prisma + zod)

```
packages/db/prisma/schema.prisma  ──┐
                                    │
                         prisma generate
                                    │
              ┌─────────────────────┴─────────────────────┐
              ▼                                           ▼
       @prisma/client (TS types + runtime)      generated zod schemas
                                                (via zod-prisma-types)
                                    │
              ┌─────────────────────┴─────────────────────┐
              ▼                                           ▼
packages/backend (Hono routes,             packages/frontend (RHF + RQ,
 Prisma queries, zod request validation)    zod inferred types for forms)
  import { prisma, schemas } from "db"       import { schemas, type Tabung } from "db"
```

**`packages/db/prisma/schema.prisma` (excerpt):**
```prisma
generator client {
  provider = "prisma-client-js"
}

generator zod {
  provider = "zod-prisma-types"
  output   = "../src/generated/zod"
  createInputTypes      = true
  addInputTypeValidation = true
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**`packages/db/src/index.ts`:**
```typescript
export { PrismaClient } from "@prisma/client";
export * as schemas from "./generated/zod";
export * from "@prisma/client"; // re-export model types
import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();
```

**`packages/db/package.json` scripts:**
```json
{
  "scripts": {
    "generate": "prisma generate",
    "migrate": "prisma migrate deploy",
    "migrate:new": "prisma migrate dev",
    "studio": "prisma studio"
  }
}
```

One source of truth — no copy/sync. Schema change → `pnpm db:generate` → both packages pick up new types and zod validators on next tsc.

### 7.2 Better Auth ↔ Prisma adapter

Better Auth ships an official Prisma adapter. Wiring:

```typescript
// packages/backend/src/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
});
```

Better Auth needs these models in `schema.prisma`:
- `User` — auto-created identity record
- `Session` — active sessions
- `Account` — OAuth provider links (optional)
- `Verification` — email OTP / reset tokens (optional)

**Bootstrap path:** run `pnpm dlx @better-auth/cli generate --output packages/db/prisma/schema.prisma` — it appends the required models, then `pnpm db:migrate:new -- --name add_better_auth` creates the migration.

### 7.3 S3 presigned upload flow

Backend endpoint generates presigned URL → frontend uploads directly to S3 → backend confirms on success. No file bytes ever pass through Node server.

### 7.4 Cron trigger pattern (monthly rotations)

```typescript
// packages/backend/src/jobs/rotation.ts
import cron from "node-cron";
import { prisma } from "db";

cron.schedule("0 9 1 * *", async () => {  // 09:00 on 1st of every month
  const dueTabung = await prisma.tabung.findMany({
    where: { status: "ACTIVE" },
  });
  for (const t of dueTabung) await processRotation(t.id);
});
```

For demo — add a manual "trigger rotation" button in admin UI so judges can see rotation fire on-demand.

### 7.5 AI Penasihat context injection

Each chat request includes the user's tabung state as system context. Penasihat answers grounded in their actual data, not generic advice.

---

## Section 8 — Environment Variables (Complete Reference)

```bash
# ============ BACKEND ============
NODE_ENV=production
PORT=4000

# Database
DATABASE_URL=postgresql://kutu:<password>@postgres:5432/kutu_digitizer

# Better Auth
BETTER_AUTH_URL=https://kutu.yourdomain.com
BETTER_AUTH_SECRET=<openssl rand -base64 32>

# AWS S3 (sponsor credit)
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=<secret>
S3_BUCKET=kutu-uploads

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-...

# TNG eWallet (confirm at sponsor booth)
TNG_API_BASE=https://sandbox.tngwallet.com.my
TNG_CLIENT_ID=<tbd>
TNG_CLIENT_SECRET=<tbd>

# Logging
LOG_LEVEL=info

# Rate limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=60

# Sentry (optional)
SENTRY_DSN=<optional>

# ============ FRONTEND ============
# Same-origin via Caddy, no API base URL needed
NEXT_PUBLIC_API_BASE=/api

# If Pattern B subdomain split:
# NEXT_PUBLIC_API_BASE=https://api.kutu.yourdomain.com

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN=<optional>
```

---

## Section 9 — Version Locks & Compatibility Notes

- **Node 22 LTS** — current Active LTS (since Oct 2024). Native `fetch`, `--watch`, built-in `.env` loading, stable WebStreams. No 23/24 in prod.
- **Postgres 17** — current stable (since Sep 2024). Drizzle 0.36+ + `pg` 8.13+ both fully compatible.
- **pnpm 9.x** — workspace + `workspace:*` protocol. Pin via `packageManager` field in root `package.json` so all team members + CI use identical version.
- **Next.js 15 App Router (not Pages)** — caching defaults flipped to opt-in; React 19 RC built in; turbopack dev stable. Pages Router is legacy.
- **Tailwind v4 (not v3)** — Oxide engine; config moves from `tailwind.config.js` to CSS `@theme` blocks; `@import "tailwindcss"` replaces the three `@tailwind` directives.
- **React 19 (stable Dec 2024)** — use Actions, `useActionState`, `useOptimistic`, and the `use()` hook for async boundaries. No more `forwardRef` (ref is a regular prop).
- **date-fns v4 (not v3)** — adds first-class IANA timezone support without `date-fns-tz` peer dep.
- **`motion` (not `framer-motion`)** — same API, official rebrand. Existing `framer-motion` imports keep working but new code uses `motion`.
- **TypeScript strict mode** — `"strict": true` + `"noUncheckedIndexedAccess": true` in tsconfig for all workspaces.
- **ESLint flat config** — `eslint.config.js` only; legacy `.eslintrc` is dead.
- **Prisma 6 only** — no Drizzle anywhere. Schema in `packages/db/prisma/schema.prisma`. Generated client + zod ship from `db` workspace.
- **PWA on Day 1** — `@serwist/next` plugin, `manifest.webmanifest`, and icon set committed in the first frontend scaffold pass. Don't defer service worker config to Sunday.
- **Single lockfile** — only `pnpm-lock.yaml` at repo root. No nested lockfiles in `packages/*`.
- **`packages/db` is a build dependency** — every CI step and Docker build must run `pnpm --filter db generate` before backend/frontend `tsc`.

---

## Section 10 — Hero Deployment Mapping (Who Uses What)

From the Pusat Tabung roster:

| Hero | Primary stack components |
|---|---|
| **Mung** (Backend · Foundation-Keeper) | Hono · Prisma (`packages/db`) · Better Auth · AWS SDK · pino · node-cron · zod |
| **Akmal** (Frontend · Surface-Weaver) | Next.js · React · TanStack Query · react-hook-form · motion · sonner · lucide-react · **@serwist/next (PWA)** |
| **MatNep** (Design · Orthodox Eye) | Tailwind v4 · shadcn/ui · typography + grid + heritage motifs |
| **Reka** (Design System · Rules) | shadcn/ui composition · WCAG audit · token architecture |
| **Vizion** (UI/UX · Layout) | Recharts · motion · layout composition |
| **Kairu** (PM · Phase Cartographer) | `development/*.md` files · phase-plan skill · Testable Outcome gate |
| **Sahih** (QA · Triple Prism) | tsc · curl smoke tests · zod validation · preflight gate |
| **Akal** (Doctrine · Four Pillars) | CLAUDE.md · discipline gate before commits |
| **Tempa** (Forge · Systems Forger) | Greenfield scaffold · initial Dockerfile + compose |
| **Mahir** (API · Artisan) | TNG eWallet SDK · webhook plumbing · idempotency |
| **Jimat** (Token Economy) | API token budgeting · Claude/OpenAI cost tracking |
| **Tutur** (i18n · BM register) | BM copy · AI Penasihat voice prompting |
| **Kinetic** (Data Integrity · Floating Abacus) | Ledger audit · rotation math · Prisma transaction guards |
| **Nadia** (Refactor · Hygiene) | Second-pass cleanup before pitch |
| **Adam** (Supervisor · Remote) | Async code review · design direction passes |
| **Ijam** (Sovereign) | Business Pitch · product vision · 4-min voice |

---

## Section 11 — Package Install Commands (pnpm Workspace — reference, don't run yet)

All commands run from the **repo root** unless noted. The `--filter <name>` flag scopes installs to a single workspace package.

### 11.1 One-time workspace bootstrap

```bash
# Install pnpm via corepack (recommended on Node 22)
corepack enable
corepack prepare pnpm@9.15.0 --activate

# Workspace layout matches the existing README scaffold:
#   packages/backend · packages/frontend · packages/db
mkdir -p packages

# Frontend scaffold (use pnpm flag so create-next-app emits pnpm lockfile entries)
pnpm dlx create-next-app@latest packages/frontend \
  --typescript --tailwind --app --src-dir \
  --import-alias "@/*" --use-pnpm --no-git

# Backend skeleton
mkdir -p packages/backend/src && cd packages/backend && pnpm init && cd ../..

# DB package skeleton (Prisma lives here)
mkdir -p packages/db/src && cd packages/db && pnpm init && cd ../..
# Edit packages/db/package.json: "name": "db", "main": "./src/index.ts"
```

### 11.2 `packages/db` — Prisma + zod generator

```bash
# Prisma toolchain
pnpm --filter db add @prisma/client
pnpm --filter db add -D prisma zod-prisma-types typescript

# Init schema + datasource (creates packages/db/prisma/schema.prisma + .env)
cd packages/db
pnpm dlx prisma init --datasource-provider postgresql
# Edit schema.prisma: add `generator zod { provider = "zod-prisma-types" ... }`
# Append Better Auth models via:  pnpm dlx @better-auth/cli generate --output prisma/schema.prisma
cd ../..

# Generate client + zod schemas (re-run after every schema edit)
pnpm db:generate

# Create first migration once schema is drafted
pnpm db:migrate:new -- --name init
```

### 11.3 `packages/backend` — complete

```bash
# Core + TNG critical
pnpm --filter backend add \
  hono @hono/node-server \
  better-auth argon2 pg \
  zod @t3-oss/env-core dotenv \
  @aws-sdk/client-s3 @aws-sdk/s3-request-presigner \
  @anthropic-ai/sdk

# Workspace dependency on Prisma client + zod schemas
pnpm --filter backend add db@workspace:*

# Utilities + scheduled
pnpm --filter backend add node-cron date-fns nanoid pino pino-pretty hono-pino

# Security
pnpm --filter backend add hono-rate-limiter jose

# HTTP client for TNG sandbox (Node 22 fetch covers most cases; undici for streaming/pooling)
pnpm --filter backend add undici

# Optional monitoring
pnpm --filter backend add @sentry/node

# Dev tooling
pnpm --filter backend add -D \
  typescript tsx \
  eslint typescript-eslint prettier \
  @types/node @types/pg @types/node-cron

# Optional testing
pnpm --filter backend add -D vitest @vitest/ui supertest msw
```

### 11.4 `packages/frontend` — complete (PWA-first)

```bash
# Core libraries
pnpm --filter frontend add \
  better-auth \
  @tanstack/react-query \
  react-hook-form @hookform/resolvers zod \
  lucide-react motion sonner recharts \
  date-fns nanoid \
  qrcode react-qr-code zustand

# Tailwind v4 + shadcn helper deps
pnpm --filter frontend add \
  clsx tailwind-merge class-variance-authority tw-animate-css

# PWA — primary deliverable, install Day 1
pnpm --filter frontend add @serwist/next serwist
pnpm --filter frontend add -D @serwist/sw

# Workspace dep on Prisma-generated types + zod schemas
pnpm --filter frontend add db@workspace:*

# Optional: monitoring
pnpm --filter frontend add @sentry/nextjs

# Dev tooling
pnpm --filter frontend add -D \
  prettier prettier-plugin-tailwindcss \
  @types/qrcode

# shadcn/ui components — must run from inside packages/frontend
cd packages/frontend
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button input form label card dialog dropdown-menu \
  select checkbox radio-group switch textarea \
  avatar badge tabs sheet separator sonner

# PWA scaffolding — drop service worker entry + manifest
mkdir -p src/app/offline public/icons
# Create app/sw.ts (Serwist entry), app/offline/page.tsx, public/manifest.webmanifest
# Wire @serwist/next plugin in next.config.mjs
cd ../..
```

### 11.5 Daily commands (from repo root)

```bash
pnpm install                       # install/refresh all workspaces
pnpm dev                           # runs backend + frontend in parallel
pnpm build                         # prisma generate → tsc → next build (all workspaces)
pnpm typecheck                     # tsc --noEmit across all workspaces
pnpm db:generate                   # regen Prisma client + zod after schema edit
pnpm db:migrate:new -- --name <x>  # author a new migration
pnpm db:migrate                    # apply migrations (prod / EC2)
pnpm db:studio                     # Prisma Studio (judges' demo prop)
pnpm --filter backend test         # scope to a single workspace
pnpm --filter frontend add <pkg>   # add dep to one workspace
pnpm -w add -D <pkg>               # add dep to root only
```

---

## Section 12 — Completeness Checklist

| Capability | Covered by | Status |
|---|---|---|
| Monorepo / package manager | pnpm 9 + workspace | ✅ |
| Shared FE↔BE types & schemas | `packages/db` (Prisma + zod-prisma-types) | ✅ |
| HTTP request handling | Hono + @hono/node-server | ✅ |
| Database persistence | Prisma 6 + @prisma/client + Postgres 17 | ✅ |
| Migrations | `prisma migrate` | ✅ |
| User authentication | Better Auth | ✅ |
| Session management | Better Auth | ✅ |
| Password hashing | argon2 | ✅ |
| Request validation | zod | ✅ |
| Env validation | @t3-oss/env-core | ✅ |
| File uploads | AWS SDK + presigned URLs | ✅ |
| AI chat (Penasihat) | @anthropic-ai/sdk | ✅ |
| Scheduled jobs (rotations) | node-cron | ✅ |
| Structured logging | pino | ✅ |
| Rate limiting | hono-rate-limiter | ✅ |
| Date arithmetic | date-fns | ✅ |
| Invite codes / short IDs | nanoid | ✅ |
| Money math | integer cents OR dinero.js | ✅ |
| QR code generation | qrcode + react-qr-code | ✅ |
| SPA/SSR framework | Next.js 15 | ✅ |
| Styling | Tailwind v4 + shadcn/ui | ✅ |
| Icons | lucide-react | ✅ |
| Forms | react-hook-form + zod | ✅ |
| Server state | TanStack Query v5 | ✅ |
| Toast notifications | sonner | ✅ |
| Charts | recharts | ✅ |
| Animations | motion (formerly framer-motion) | ✅ |
| Reverse proxy + SSL | Caddy 2 | ✅ |
| Containerization | Docker + docker-compose | ✅ |
| Object storage | AWS S3 | ✅ |
| Host compute | EC2 t3.medium | ✅ |
| Public DNS | Custom domain + A record | ✅ |
| Error tracking (optional) | Sentry | ✅ |
| Testing framework (optional) | Vitest | ✅ |
| **Installable PWA (primary)** | @serwist/next + manifest + icons + offline page | ✅ |

**No capability gap identified.** Stack is complete for shipping Kutu Digitizer **as an installable PWA** in 48 hours.

---

## Section 13 — What We Deliberately Left Out

| Excluded | Why |
|---|---|
| Kubernetes | 4 containers on 1 host — overkill |
| Redis / cache layer | Postgres is fast enough for this workload |
| Message queue (RabbitMQ, Kafka, SQS) | Cron + node-cron handles all async needs |
| GraphQL | REST is simpler for 48h; no client state complexity warranting GraphQL |
| tRPC | Consider for future version — adds learning curve, zod + manual typing is enough |
| Microservices | Monolith is right for this size |
| SSR for every route | Mix SSR + SSG based on need — Next.js handles both |
| Multi-region deployment | One region (ap-southeast-1) sufficient |
| Self-hosted OAuth provider (Keycloak, Ory) | Better Auth covers email+password; add Google OAuth later if needed |
| Container registry (DockerHub/GHCR) | Build directly on VPS, no image registry needed |
| Load balancer | Single EC2 instance — no load to balance |
| CDN for static assets | Next.js + Vercel CDN was the alternative; on EC2 we skip CDN (can add CloudFront post-hackathon) |
| Custom design system library | shadcn + Tailwind + MatNep direction = sufficient for 48h |

---

## Section 14 — Quest Ritual Before Stack Activation

Per Kairu's phase-plan discipline — before a single `pnpm install` fires:

1. **Akal's four pillars check** — THINK · SIMPLE · SURGICAL · VERIFY
2. **Kairu's Phase 1 testable outcome defined** — *"Register via Better Auth → create tabung → persisted in Postgres → visible on reload"*
3. **Sahih's triple prism armed** — types check, routes reachable, behavior matches intent
4. **Tempa's Tungku heated** — the first forge strike lights the stack on fire

Only then does the shopping list get installed.

---

*End of tech-stack manifest. Canonical seal: pusat-tabung | tech-stack | day-499 | 67-item-inventory | pnpm-workspace | prisma-orm | pwa-first*
