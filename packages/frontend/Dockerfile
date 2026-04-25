FROM node:24-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc* ./
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/db/package.json ./packages/db/
RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY packages/db ./packages/db
COPY packages/frontend ./packages/frontend
RUN pnpm --filter db generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter frontend build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/packages/frontend/public ./packages/frontend/public
COPY --from=builder /app/packages/frontend/.next/standalone ./
COPY --from=builder /app/packages/frontend/.next/static ./packages/frontend/.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "packages/frontend/server.js"]
