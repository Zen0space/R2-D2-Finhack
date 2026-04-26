# Tech Stack — Kutu Digitizer

**Complete 60-item inventory · all layers · all optionals**

Last updated: 25 April 2026

---

## TL;DR

| Layer | Items |
|---|---|
| TNG mandated | 5 |
| Backend critical + recommended | 22 |
| Frontend critical + recommended | 18 |
| Infrastructure | 8 |
| Optional / monitoring | 6 |
| Demo assets | 3 |
| **TOTAL** | **62** |

---

## Section 0 — TNG Core Mandates

| # | Tech | Version | Role |
|---|---|---|---|
| 1 | Node.js | 20.x LTS | Runtime |
| 2 | TypeScript | 5.4+ | Language |
| 3 | PostgreSQL | 16.x | Primary database |
| 4 | AWS S3 | — | Object storage |
| 5 | Better Auth | latest | Authentication |

---

## Section 1 — Backend

### 1.1 Runtime & Framework

| Package | Version | Role |
|---|---|---|
| `hono` | ^4.x | HTTP framework |
| `@hono/node-server` | ^1.x | Node adapter |
| `tsx` | ^4.x | Dev TS runner |
| `typescript` | ^5.4 | Type system |

### 1.2 Database & ORM

| Package | Version | Role |
|---|---|---|
| `pg` | ^8.x | Postgres driver |
| `prisma` | latest | Migration engine + schema tooling |
| `@prisma/client` | latest | Generated DB client |
| `@prisma/adapter-pg` | latest | Prisma Postgres adapter |

### 1.3 Validation & Environment

| Package | Version | Role |
|---|---|---|
| `zod` | ^3.23+ | Validation |
| `@t3-oss/env-core` | latest | Env-var validation |
| `dotenv` | ^16.x | Load `.env` files |

### 1.4 Auth

| Package | Version | Role |
|---|---|---|
| `better-auth` | ^1.x | Auth library |
| `argon2` | latest | Password hashing |

### 1.5 AWS S3

| Package | Version | Role |
|---|---|---|
| `@aws-sdk/client-s3` | ^3.x | S3 SDK v3 |
| `@aws-sdk/s3-request-presigner` | ^3.x | Presigned URLs |

### 1.6 AI

| Package | Version | Role |
|---|---|---|
| Alibaba Function Compute URL | env-provided | Optional Qwen-backed Penasihat/NADI inference |
| Local heuristic fallback | built-in | Deterministic suggestions and summaries when AI service is unavailable |

### 1.7 Utilities

| Package | Version | Role |
|---|---|---|
| `node-cron` | ^3.x | Scheduled jobs |
| `date-fns` | ^3.x | Date arithmetic |
| `nanoid` | ^5.x | Short IDs + invite codes |
| `dinero.js` | ^2.x | Money math (or use integer cents) |

### 1.8 Logging

| Package | Version | Role |
|---|---|---|
| `pino` | ^9.x | Structured logging |
| `pino-pretty` | ^11.x | Dev console formatting |

### 1.9 Security

| Package | Version | Role |
|---|---|---|
| `hono/cors` | (built-in) | CORS (only if subdomain split) |
| `hono-rate-limiter` | latest | Rate limiting |
| `jose` | ^5.x | JWT signing (if TNG uses signed callbacks) |

### 1.10 HTTP Client

| Package | Version | Role |
|---|---|---|
| `undici` | ^6.x | HTTP client (TNG sandbox calls) |

### 1.11 Testing (Optional)

| Package | Version |
|---|---|
| `vitest` | ^2.x |
| `supertest` | ^7.x |
| `msw` | ^2.x |

### 1.12 Dev Tooling

| Package |
|---|
| `eslint` ^9 + `@typescript-eslint/eslint-plugin` |
| `prettier` ^3 |
| `@types/node` `@types/pg` `@types/node-cron` |

---

## Section 2 — Frontend

### 2.1 Framework

| Package | Version |
|---|---|
| `next` | ^15.x |
| `react` | ^19.x |
| `react-dom` | ^19.x |

### 2.2 Styling

| Package | Version |
|---|---|
| `tailwindcss` | ^4.x |
| `@tailwindcss/postcss` | ^4.x |
| `tailwindcss-animate` | latest |
| `class-variance-authority` | latest |
| `clsx` | latest |
| `tailwind-merge` | latest |

### 2.3 Components — shadcn/ui

Install via CLI:

```bash
npx shadcn@latest init
npx shadcn@latest add button input form label card dialog dropdown-menu \
                      select checkbox radio-group switch textarea \
                      avatar badge tabs sheet separator toast sonner
```

### 2.4 Icons

| Package | Version |
|---|---|
| `lucide-react` | ^0.4x |

### 2.5 State & Data

| Package | Version |
|---|---|
| `@tanstack/react-query` | ^5.x |
| `better-auth` (client hooks via `better-auth/react`) | ^1.x |
| `zustand` (optional) | ^4.x |

### 2.6 Forms

| Package | Version |
|---|---|
| `react-hook-form` | ^7.x |
| `@hookform/resolvers` | ^3.x |
| `zod` | ^3.23+ |

### 2.7 Visualization & Animation

| Package | Version |
|---|---|
| `recharts` | ^2.x |
| `framer-motion` | ^11.x |
| `sonner` | ^1.x |

### 2.8 QR Codes

| Package | Version |
|---|---|
| `qrcode` | ^1.x |
| `react-qr-code` | ^2.x |

### 2.9 Utilities

| Package | Version |
|---|---|
| `date-fns` | ^3.x |
| `nanoid` | ^5.x |

### 2.10 PWA (Optional)

| Package | Version |
|---|---|
| `next-pwa` | ^5.x |

### 2.11 Dev Tooling

| Package |
|---|
| `prettier-plugin-tailwindcss` |
| `eslint-config-next` ^15 |
| `@types/qrcode` |

---

## Section 3 — Infrastructure

| Tool | Version | Role |
|---|---|---|
| Docker Engine | 24+ | Container runtime |
| Docker Compose | v2 plugin | Multi-container orchestration |
| Caddy | 2.x-alpine | Reverse proxy + auto SSL |
| Postgres (image) | 16-alpine | Containerized DB |
| EC2 instance | t3.medium | Host compute (sponsor credit) |
| AMI | Ubuntu 24.04 LTS | Host OS |
| Elastic IP | — | Stable public IP |
| Domain | (TBD) | Public URL |

---

## Section 4 — Monitoring (Optional)

| Tool | Role |
|---|---|
| `@sentry/node` + `@sentry/nextjs` | Error tracking |
| Better Stack Uptime | Endpoint monitoring |
| AWS CloudWatch | Infra metrics (sponsor credit) |

---

## Section 5 — CI/CD (Optional, Skip for 48h)

| Tool | Role |
|---|---|
| GitHub Actions | Auto-deploy on push |
| Dependabot | Dependency updates |

**Verdict:** skip — manual SSH deploy faster to set up than configuring CI in 48h.

---

## Section 6 — Demo Assets

| Tool | Role |
|---|---|
| Canva or Figma | Pitch deck (8 slides) |
| OBS Studio / Loom / QuickTime | Demo video recording |
| ngrok | Backup public tunnel if VPS fails |

---

## Section 7 — Environment Variables Reference

### Backend (`.env`)

```bash
NODE_ENV=production
PORT=4000

# Database
DATABASE_URL=postgresql://kutu:<password>@postgres:5432/kutu_digitizer

# Better Auth
BETTER_AUTH_URL=https://kutu.yourdomain.com
BETTER_AUTH_SECRET=<openssl rand -base64 32>

# AWS S3
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=<secret>
S3_BUCKET=kutu-uploads

# Alibaba Function Compute (optional AI)
ALIBABA_FUNCTION_COMPUTE_URL=https://...
ALIBABA_FUNCTION_COMPUTE_URL_NADI=https://...
ALIBABA_FUNCTION_COMPUTE_KEY=<optional-shared-secret>

# TNG eWallet
TNG_API_BASE=https://sandbox.tngwallet.com.my
TNG_CLIENT_ID=<tbd>
TNG_CLIENT_SECRET=<tbd>

# Logging
LOG_LEVEL=info

# Rate limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=60

# Sentry (optional)
SENTRY_DSN=
```

### Frontend (`.env`)

```bash
# Same-origin via Caddy
NEXT_PUBLIC_API_BASE=/api

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN=
```

---

## Section 8 — Install Commands (Reference Only)

### Backend

```bash
npm i hono @hono/node-server \
      better-auth argon2 \
      @prisma/client pg \
      zod @t3-oss/env-core dotenv \
      @aws-sdk/client-s3 @aws-sdk/s3-request-presigner \
      node-cron date-fns nanoid \
      pino pino-pretty \
      hono-rate-limiter jose undici

npm i -D typescript tsx drizzle-kit \
         eslint prettier \
         @typescript-eslint/eslint-plugin \
         @types/node @types/pg @types/node-cron

# Optional
npm i @sentry/node
npm i -D vitest @vitest/ui supertest msw
```

### Frontend

```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"

npm i better-auth \
      @tanstack/react-query \
      react-hook-form @hookform/resolvers zod \
      lucide-react framer-motion sonner recharts \
      date-fns nanoid \
      qrcode react-qr-code \
      clsx tailwind-merge class-variance-authority tailwindcss-animate

npm i -D prettier prettier-plugin-tailwindcss @types/qrcode

# Optional
npm i zustand next-pwa @sentry/nextjs

# shadcn/ui (CLI, not npm)
npx shadcn@latest init
npx shadcn@latest add button input form label card dialog dropdown-menu \
                      select checkbox radio-group switch textarea \
                      avatar badge tabs sheet separator toast sonner
```

---

## Section 9 — Version Compatibility Notes

| Tech | Lock | Reason |
|---|---|---|
| Node | 20 LTS (not 22) | Better Auth + AWS SDK edge cases on 22 as of Apr 2026 |
| Postgres | 16 (not 17) | Driver ecosystem stability |
| Next.js | 15 App Router (not Pages) | Pages Router is legacy |
| Tailwind | v4 (not v3) | v4 config moves to CSS `@theme` |
| React | 19 | Stable; Actions + `use()` hook available |
| TypeScript | strict mode mandatory | Both repos |
| ORM | Prisma only | Schema in `packages/db/prisma/schema.prisma` |

---

## Section 10 — Completeness Checklist

| Capability | Covered |
|---|---|
| HTTP framework | ✅ Hono |
| Database persistence | ✅ Prisma + pg + Postgres |
| Migrations | ✅ Prisma migrations |
| Authentication | ✅ Better Auth |
| Session management | ✅ Better Auth |
| Password hashing | ✅ argon2 |
| Request validation | ✅ zod |
| Env validation | ✅ @t3-oss/env-core |
| File uploads | ✅ AWS SDK + presigned URLs |
| AI suggestions | ✅ Alibaba FC env URL + heuristic fallback |
| Scheduled jobs | ✅ node-cron |
| Logging | ✅ pino |
| Rate limiting | ✅ hono-rate-limiter |
| Date arithmetic | ✅ date-fns |
| Invite codes | ✅ nanoid |
| Money math | ✅ integer cents (or dinero.js) |
| QR codes | ✅ qrcode + react-qr-code |
| SPA / SSR framework | ✅ Next.js 15 |
| Styling | ✅ Tailwind v4 + shadcn/ui |
| Icons | ✅ lucide-react |
| Forms | ✅ react-hook-form + zod |
| Server state | ✅ TanStack Query v5 |
| Toast notifications | ✅ sonner |
| Charts | ✅ recharts |
| Animations | ✅ framer-motion |
| Reverse proxy + SSL | ✅ Caddy 2 |
| Containerization | ✅ Docker + docker-compose |
| Object storage | ✅ AWS S3 |
| Compute | ✅ EC2 t3.medium |
| Public DNS | ✅ Custom domain + A record |
| Error tracking (opt) | ✅ Sentry |
| Testing (opt) | ✅ Vitest |
| PWA (opt) | ✅ next-pwa |

**No capability gap.** Stack complete for Kutu Digitizer MVP in 48 hours.

---

## Section 11 — Deliberate Exclusions

| Excluded | Why |
|---|---|
| Kubernetes | 4 containers · 1 host · overkill |
| Redis cache | Postgres fast enough |
| Message queue | node-cron handles all async |
| GraphQL / tRPC | REST simpler for 48h |
| Microservices | Monolith correct for size |
| Multi-region deploy | One region sufficient |
| Self-hosted OAuth provider | Better Auth covers email + password |
| Container registry | Build directly on EC2 |
| Load balancer | Single instance |
| CDN | Skip; can add CloudFront post-hackathon |

---

## Section 12 — Stack Activation Ritual

Before any `npm install` fires:

1. **THINK · SIMPLE · SURGICAL · VERIFY** — four-pillar discipline check
2. **Phase 1 testable outcome locked:** *"Register → create tabung → persisted → visible on reload"*
3. **Triple verification primed** — types · routes · behavior
4. **First scaffold strike authorized**

Only then: install.
