#!/usr/bin/env bash
set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR" || exit 1

failures=0
warnings=0

section() {
  printf '\n== %s ==\n' "$1"
}

pass() {
  printf 'PASS %s\n' "$1"
}

fail() {
  printf 'FAIL %s\n' "$1"
  failures=$((failures + 1))
}

warn() {
  printf 'WARN %s\n' "$1"
  warnings=$((warnings + 1))
}

info() {
  printf 'INFO %s\n' "$1"
}

run() {
  local label="$1"
  shift

  section "$label"
  printf '+ %s\n' "$*"

  if "$@"; then
    pass "$label"
  else
    fail "$label"
  fi
}

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

section "Environment"
if command_exists node; then
  node --version
else
  fail "node is missing"
fi

if command_exists pnpm; then
  pnpm --version
else
  fail "pnpm is missing"
fi

if command_exists git; then
  git --version
else
  warn "git is missing; skipping repository checks"
fi

if command_exists git; then
  section "Worktree"
  if [ -n "$(git status --short)" ]; then
    git status --short
    info "worktree has uncommitted changes"
  else
    pass "worktree is clean"
  fi
fi

section "Dependency Metadata"
if [ -f pnpm-lock.yaml ] && [ -f pnpm-workspace.yaml ]; then
  pass "pnpm workspace and lockfile exist"
else
  fail "missing pnpm workspace or lockfile"
fi

run "Prisma Client Generation" pnpm db:generate
run "TypeScript Typecheck" pnpm -r typecheck
run "Frontend Lint" pnpm --filter frontend lint
run "Production Build" pnpm -r build

section "Repo-Specific Claim Checks"
if rg -q "Anthropic|Claude API|Claude fallback|fallback to Claude|Claude as fallback|callClaude|@anthropic-ai" docs README.md alibaba-function-compute && \
  ! rg -q "callClaude|@anthropic-ai|ANTHROPIC_API_KEY" packages/backend/src packages/backend/package.json; then
  warn "docs mention Claude/Anthropic fallback, but backend runtime has no Claude integration"
else
  pass "AI provider claims match code shape"
fi

if rg -q "services/claude.ts|prompts/penasihat-suggest.md" docs/tech/ARCHITECTURE.md && \
  { [ ! -f packages/backend/src/services/claude.ts ] || [ ! -f packages/backend/src/prompts/penasihat-suggest.md ]; }; then
  warn "architecture references Claude service/prompt files that are not present"
else
  pass "architecture file references existing AI service files"
fi

if rg -q "Hono \\+ Drizzle|Drizzle only|Drizzle \\+ pg|drizzle-zod|Drizzle schema" docs README.md package.json packages; then
  warn "repo still contains stale Drizzle implementation references while implementation uses Prisma"
else
  pass "no stale Drizzle references found"
fi

if rg -q "paylater_obligations.*append-only|kampung_trust_scores.*append-only|trust score.*append-only|trust scores.*append-only" docs packages/db/prisma/schema.prisma; then
  warn "append-only docs should clarify mutable rollup fields like cyclesPaid/trustScore"
else
  pass "append-only claims are scoped to event ledger rows"
fi

section "Summary"
printf 'Failures: %s\n' "$failures"
printf 'Warnings: %s\n' "$warnings"

if [ "$failures" -gt 0 ]; then
  exit 1
fi
