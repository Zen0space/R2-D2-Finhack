#!/bin/sh
set -e

echo "⏳ Running Prisma migrations..."
pnpm --filter db migrate
echo "✅ Migrations done. Starting server..."

exec node --import tsx/esm src/index.ts
