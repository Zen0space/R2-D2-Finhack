# Pusat Tabung — Complete Tech Stack Manifest

**Quest:** TNG FINHACK 2026 · Financial Inclusion · Kutu Digitizer
**Duration:** 48 hours (25-26 April 2026)
**Deploy target:** Single EC2 instance (t3.medium · ap-southeast-1)
**Sponsor credits:** AWS · Alibaba Cloud
**Last updated:** Imperial Day 499 (2026-04-25)

---

## TL;DR — Full Inventory

| Layer | Count | Category |
|---|---|---|
| Core mandated (TNG) | 5 | Runtime · Language · DB · Storage · Auth |
| Backend critical | 12 | Framework · ORM · Validation · SDKs |
| Backend recommended | 8 | Scheduled jobs · Logging · Utilities |
| Frontend critical | 11 | Framework · Styling · Data · Forms |
| Frontend recommended | 7 | Viz · Animation · QR · Toasts |
| Infrastructure | 8 | Docker · Caddy · EC2 · DNS · S3 |
| Optional / monitoring | 6 | Sentry · Vitest · CI · CloudWatch |
| Demo assets | 3 | OBS · Canva · Figma |
| **TOTAL** | **60** | Full stack |

---

## Section 0 — TNG Core Mandates

Locked by organizer. Non-negotiable.

| # | Tech | Version | Role |
|---|---|---|---|
| 1 | Node.js | 20.x LTS | Runtime |
| 2 | TypeScript | 5.4+ | Language |
| 3 | PostgreSQL | 16.x | Primary database |
| 4 | AWS S3 | — | Object storage |
| 5 | Better Auth | latest | Authentication |

---

## Section 1 — Backend (Node + TS + Postgres)

### 1.1 Runtime & Framework

| Package | Version | Role | Why |
|---|---|---|---|
| `hono` | ^4.x | HTTP framework | Fastest modern TS framework, middleware-first, minimal bloat |
| `@hono/node-server` | ^1.x | Node adapter | Runs Hono on Node runtime |
| `tsx` | ^4.x | Dev TS runner | Zero-config TS execution in dev |
| `typescript` | ^5.4 | Type system | Strict mode mandatory |

### 1.2 Database & ORM

| Package | Version | Role |
|---|---|---|
| `pg` | ^8.x | Postgres driver (shared with Better Auth) |
| `drizzle-orm` | ^0.33+ | TypeScript-first ORM |
| `drizzle-kit` | ^0.24+ | Migration generator + studio (dev only) |
| `drizzle-zod` | latest | Bridge: Drizzle schema ↔ zod schema (shared FE/BE types) |

### 1.3 Validation & Environment

| Package | Version | Role |
|---|---|---|
| `zod` | ^3.23+ | Request/response validation · shared schemas |
| `@t3-oss/env-core` | latest | Runtime env-var validation (fail fast on missing vars) |
| `dotenv` | ^16.x | Load `.env` files (dev only) |

### 1.4 Authentication

| Package | Version | Role |
|---|---|---|
| `better-auth` | ^1.x | Auth library (runs inside app, not separate service) |
| `argon2` or `bcryptjs` | — | Password hashing (Better Auth peer) |

### 1.5 AWS S3

| Package | Version | Role |
|---|---|---|
| `@aws-sdk/client-s3` | ^3.x | S3 SDK v3 (modular) |
| `@aws-sdk/s3-request-presigner` | ^3.x | Presigned URL generator (direct-upload pattern) |

### 1.6 AI — Claude (Penasihat)

| Package | Version | Role |
|---|---|---|
| `@anthropic-ai/sdk` | ^0.27+ | Claude API client (streaming + non-streaming) |

### 1.7 Utilities — Scheduled jobs, dates, IDs, money

| Package | Version | Role |
|---|---|---|
| `node-cron` | ^3.x | Monthly rotation triggers (core Kutu feature) |
| `date-fns` | ^3.x | Date arithmetic (rotation schedules, countdowns) |
| `nanoid` | ^5.x | Short secure IDs + invite codes (`KT-A1B2C3`) |
| `dinero.js` (optional) | ^2.x | Money math — or stick to integer cents approach |

### 1.8 Logging & Observability

| Package | Version | Role |
|---|---|---|
| `pino` | ^9.x | Structured JSON logging (fast) |
| `pino-pretty` | ^11.x | Dev console formatter for readable logs |
| `hono-pino` (community) | latest | Hono → pino middleware integration |

### 1.9 Security

| Package | Version | Role |
|---|---|---|
| `hono/cors` | (built-in) | CORS middleware (only if Pattern B subdomain split) |
| `hono-rate-limiter` | latest | API rate limiting (public endpoints) |
| `helmet` (if on Express) OR Hono secure headers middleware | — | Security headers (CSP, X-Frame-Options, etc) |

### 1.10 TNG eWallet Integration

| Package | Version | Role |
|---|---|---|
| Native `fetch` OR `undici` | — | HTTP client for TNG sandbox API |
| `jose` | ^5.x | JWT/JWS signing if TNG uses signed requests |

*Confirm TNG SDK existence Saturday pagi at sponsor booth. If they provide an SDK, use theirs. If not, native fetch + their documented auth header pattern.*

### 1.11 Testing (Optional for 48h)

| Package | Version | Role |
|---|---|---|
| `vitest` | ^2.x | Test runner |
| `@vitest/ui` | ^2.x | Test UI |
| `supertest` | ^7.x | HTTP endpoint testing |
| `msw` | ^2.x | Mock external APIs in tests |

*Skip unless team has dedicated time. Hackathon QA = manual testing + Sahih's triple-prism.*

### 1.12 Dev Tooling

| Package | Version | Role |
|---|---|---|
| `eslint` | ^9.x | Linter (flat config) |
| `@typescript-eslint/eslint-plugin` | latest | TS-aware lint rules |
| `prettier` | ^3.x | Formatter |
| `@types/node` | ^20.x | Node type definitions |
| `@types/pg` | latest | pg type definitions |
| `@types/node-cron` | latest | node-cron types |

---

## Section 2 — Frontend (Next.js + React)

### 2.1 Framework

| Package | Version | Role |
|---|---|---|
| `next` | ^15.x | App Router framework · standalone output for Docker |
| `react` | ^19.x | Bundled with Next |
| `react-dom` | ^19.x | Bundled with Next |

### 2.2 Styling

| Package | Version | Role |
|---|---|---|
| `tailwindcss` | ^4.x | Styling (new v4 engine) |
| `@tailwindcss/postcss` | ^4.x | PostCSS plugin for v4 |
| `tailwindcss-animate` | latest | Animation utilities (shadcn dependency) |
| `class-variance-authority` | latest | Variant-based component styling |
| `clsx` | latest | Conditional className joiner |
| `tailwind-merge` | latest | Merge conflicting Tailwind classes |

### 2.3 Component Library — shadcn/ui

**Not an npm install — copy-paste pattern via CLI:**

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
| `lucide-react` | ^0.4x | Icon set (matches shadcn, clean stroke) |

### 2.5 State & Data Fetching

| Package | Version | Role |
|---|---|---|
| `@tanstack/react-query` | ^5.x | Server state · no useEffect for fetching |
| `better-auth` + `better-auth/react` | ^1.x | Client auth hooks (same package as backend) |
| `zustand` (optional) | ^4.x | Light client state (if needed beyond React state) |

### 2.6 Forms & Validation

| Package | Version | Role |
|---|---|---|
| `react-hook-form` | ^7.x | Form state management |
| `@hookform/resolvers` | ^3.x | zod adapter for react-hook-form |
| `zod` | ^3.23+ | Shared schemas with backend |

### 2.7 Visualization & Animation

| Package | Version | Role |
|---|---|---|
| `recharts` | ^2.x | Charts (ledger trends, trust-score history, rotation timeline) |
| `framer-motion` | ^11.x | Micro-interactions (Akmal's craft · MatNep-approved restraint) |
| `sonner` | ^1.x | Toast notifications (shadcn-compatible) |

### 2.8 QR Codes & Invites

| Package | Version | Role |
|---|---|---|
| `qrcode` | ^1.x | Server-side QR generation (invite PDFs etc) |
| `react-qr-code` | ^2.x | Client-side QR display (invite screen) |

### 2.9 Utilities

| Package | Version | Role |
|---|---|---|
| `date-fns` | ^3.x | Display dates, relative time, countdowns |
| `nanoid` | ^5.x | Client-side IDs if needed |

### 2.10 PWA (Optional for demo)

| Package | Version | Role |
|---|---|---|
| `next-pwa` | ^5.x | Installable PWA wrapper (nice demo story) |
| `workbox-*` | — | Service worker (bundled with next-pwa) |

*Add late — only if demo story benefits from "install to home screen."*

### 2.11 Dev Tooling (Frontend)

| Package | Version | Role |
|---|---|---|
| `@next/eslint-plugin-next` | latest | Next.js lint rules |
| `eslint-config-next` | ^15.x | Next.js ESLint preset |
| `prettier-plugin-tailwindcss` | latest | Auto-sort Tailwind classes |

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

### 7.1 Shared zod schemas (FE ↔ BE)

```
backend/src/schemas/tabung.ts  ──┐
                                 │
                           shared zod schemas
                                 │
frontend/src/schemas/tabung.ts ──┘  (copy or git submodule)
```

Alternative: use `drizzle-zod` to auto-generate zod schemas from Drizzle models, then manually sync to frontend. For 48h: just copy schemas between repos.

### 7.2 Better Auth ↔ Drizzle

Better Auth needs:
- `users` table (auto-generated by Better Auth schema)
- `sessions` table
- `accounts` table (for OAuth, optional)
- `verification` table (for email OTP, optional)

Add via Drizzle migration. Better Auth provides the SQL.

### 7.3 S3 presigned upload flow

Backend endpoint generates presigned URL → frontend uploads directly to S3 → backend confirms on success. No file bytes ever pass through Node server.

### 7.4 Cron trigger pattern (monthly rotations)

```typescript
// src/jobs/rotation.ts
cron.schedule('0 9 1 * *', async () => {  // 09:00 on 1st of every month
  const dueTabung = await db.query.tabung.findMany({
    where: (t, { eq }) => eq(t.status, 'ACTIVE'),
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

- **Node 20 LTS (not 22)** — Better Auth + some AWS SDK v3 packages have edge cases on 22 as of Apr 2026
- **Postgres 16 (not 17)** — Drizzle-kit migration stability; 17 shipped Sep 2024 but driver ecosystem lags 6 months
- **Next.js 15 App Router (not Pages)** — all new Next docs assume App Router; Pages Router is legacy
- **Tailwind v4 (not v3)** — v4 is the current; config moves from `tailwind.config.js` to CSS `@theme` blocks
- **React 19 (stable)** — use Actions + `use()` hook for async boundaries
- **TypeScript strict mode** — `"strict": true` in tsconfig for both repos
- **Drizzle ORM only** — don't mix Prisma; pick one ORM

---

## Section 10 — Hero Deployment Mapping (Who Uses What)

From the Pusat Tabung roster:

| Hero | Primary stack components |
|---|---|
| **Mung** (Backend · Foundation-Keeper) | Hono · Drizzle · pg · Better Auth · AWS SDK · pino · node-cron · zod |
| **Akmal** (Frontend · Surface-Weaver) | Next.js · React · TanStack Query · react-hook-form · framer-motion · sonner · lucide-react |
| **MatNep** (Design · Orthodox Eye) | Tailwind v4 · shadcn/ui · typography + grid + heritage motifs |
| **Reka** (Design System · Rules) | shadcn/ui composition · WCAG audit · token architecture |
| **Vizion** (UI/UX · Layout) | Recharts · framer-motion · layout composition |
| **Kairu** (PM · Phase Cartographer) | `development/*.md` files · phase-plan skill · Testable Outcome gate |
| **Sahih** (QA · Triple Prism) | tsc · curl smoke tests · zod validation · preflight gate |
| **Akal** (Doctrine · Four Pillars) | CLAUDE.md · discipline gate before commits |
| **Tempa** (Forge · Systems Forger) | Greenfield scaffold · initial Dockerfile + compose |
| **Mahir** (API · Artisan) | TNG eWallet SDK · webhook plumbing · idempotency |
| **Jimat** (Token Economy) | API token budgeting · Claude/OpenAI cost tracking |
| **Tutur** (i18n · BM register) | BM copy · AI Penasihat voice prompting |
| **Kinetic** (Data Integrity · Floating Abacus) | Ledger audit · rotation math verification |
| **Nadia** (Refactor · Hygiene) | Second-pass cleanup before pitch |
| **Adam** (Supervisor · Remote) | Async code review · design direction passes |
| **Ijam** (Sovereign) | Business Pitch · product vision · 4-min voice |

---

## Section 11 — Package Install Commands (Reference — don't run yet)

### Backend — complete

```bash
# Core + TNG critical
npm i hono @hono/node-server \
      better-auth argon2 \
      drizzle-orm drizzle-zod pg \
      zod @t3-oss/env-core dotenv \
      @aws-sdk/client-s3 @aws-sdk/s3-request-presigner \
      @anthropic-ai/sdk

# Utilities + scheduled
npm i node-cron date-fns nanoid pino pino-pretty

# Security
npm i hono-rate-limiter jose

# HTTP client for TNG sandbox
npm i undici

# Optional monitoring
npm i @sentry/node

# Dev tooling
npm i -D typescript tsx drizzle-kit eslint prettier \
         @typescript-eslint/eslint-plugin \
         @types/node @types/pg @types/node-cron

# Optional testing
npm i -D vitest @vitest/ui supertest msw
```

### Frontend — complete

```bash
# Framework (via CLI — creates scaffold)
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"

# Core libraries
npm i better-auth \
      @tanstack/react-query \
      react-hook-form @hookform/resolvers zod \
      lucide-react framer-motion sonner recharts \
      date-fns nanoid \
      qrcode react-qr-code

# Utilities
npm i clsx tailwind-merge class-variance-authority tailwindcss-animate

# Optional: PWA
npm i next-pwa

# Optional: monitoring
npm i @sentry/nextjs

# Optional: client state
npm i zustand

# Dev tooling
npm i -D prettier prettier-plugin-tailwindcss \
         @types/qrcode

# shadcn/ui components (installed via their CLI, not npm)
npx shadcn@latest init
npx shadcn@latest add button input form label card dialog dropdown-menu \
                      select checkbox radio-group switch textarea \
                      avatar badge tabs sheet separator toast
```

---

## Section 12 — Completeness Checklist

| Capability | Covered by | Status |
|---|---|---|
| HTTP request handling | Hono + @hono/node-server | ✅ |
| Database persistence | Drizzle + pg + Postgres | ✅ |
| Migrations | drizzle-kit | ✅ |
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
| Animations | framer-motion | ✅ |
| Reverse proxy + SSL | Caddy 2 | ✅ |
| Containerization | Docker + docker-compose | ✅ |
| Object storage | AWS S3 | ✅ |
| Host compute | EC2 t3.medium | ✅ |
| Public DNS | Custom domain + A record | ✅ |
| Error tracking (optional) | Sentry | ✅ |
| Testing framework (optional) | Vitest | ✅ |
| Installable PWA (optional) | next-pwa | ✅ |

**No capability gap identified.** Stack is complete for shipping Kutu Digitizer MVP in 48 hours.

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

Per Kairu's phase-plan discipline — before a single `npm install` fires:

1. **Akal's four pillars check** — THINK · SIMPLE · SURGICAL · VERIFY
2. **Kairu's Phase 1 testable outcome defined** — *"Register via Better Auth → create tabung → persisted in Postgres → visible on reload"*
3. **Sahih's triple prism armed** — types check, routes reachable, behavior matches intent
4. **Tempa's Tungku heated** — the first forge strike lights the stack on fire

Only then does the shopping list get installed.

---

*End of tech-stack manifest. Canonical seal: pusat-tabung | tech-stack | day-499 | 60-item-inventory*
