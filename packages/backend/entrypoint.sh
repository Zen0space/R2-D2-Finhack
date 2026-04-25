#!/bin/sh
set -e

echo "⏳ Running Prisma migrations..."
pnpm --filter db migrate
echo "✅ Migrations done."

echo "🌱 Running one-shot seeds (skipped if already applied)..."
pnpm --filter db seed:run
echo "✅ Seeds done. Starting server..."

exec node --import tsx/esm src/index.ts
