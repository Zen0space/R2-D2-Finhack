FROM node:22-alpine
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Copy manifests first — layer cache: deps only rebuild when lockfile changes
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc* ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/db/package.json      ./packages/db/

RUN pnpm install --frozen-lockfile

# Copy source after deps
COPY packages/db      ./packages/db/
COPY packages/backend ./packages/backend/

# Generate Prisma client into node_modules
RUN pnpm --filter db generate

ENV NODE_ENV=production
EXPOSE 4000

# tsx loader resolves TypeScript workspace imports at runtime.
# db package main points to .ts — no separate compile step needed.
CMD ["node", "--import", "tsx/esm", "packages/backend/src/index.ts"]
