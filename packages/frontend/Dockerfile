FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# ── deps — layer cache: only rebuilds when manifests change ──────────────────
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc* ./
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/db/package.json       ./packages/db/
RUN pnpm install --frozen-lockfile

# ── builder ───────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules                    ./node_modules
COPY --from=deps /app/packages/frontend/node_modules  ./packages/frontend/node_modules
COPY --from=deps /app/packages/db/node_modules        ./packages/db/node_modules
COPY . .

# Baked at build time — override via --build-arg for each environment
ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN pnpm --filter db generate
RUN pnpm --filter frontend build

# ── runner — minimal image, non-root user ─────────────────────────────────────
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# standalone output includes server.js + pruned node_modules
# In a monorepo the standalone tree nests under the package path,
# so server.js lives at /app/packages/frontend/server.js — static and
# public assets must sit next to it, not at /app.
COPY --from=builder --chown=nextjs:nodejs /app/packages/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/packages/frontend/.next/static     ./packages/frontend/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/packages/frontend/public           ./packages/frontend/public

USER nextjs
EXPOSE 3000
CMD ["node", "packages/frontend/server.js"]
