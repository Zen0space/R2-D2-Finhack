#!/bin/bash
# DuitLater — Full dev environment setup
# Run once when cloning the repo, or when switching machines.
# Safe to re-run — all steps are idempotent.

set -e
cd "$(dirname "$0")/.."

REQUIRED_NODE="22"
REQUIRED_PNPM="9.15.0"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  DuitLater — Dev Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── 1. Node 22 ────────────────────────────────────────────────────────────────
echo "[ 1/5 ] Checking Node.js..."

# Try loading nvm from common locations
if [ -z "$NVM_DIR" ]; then
  export NVM_DIR="$HOME/.nvm"
fi

load_nvm() {
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    # shellcheck disable=SC1091
    source "$NVM_DIR/nvm.sh"
    return 0
  fi
  # Homebrew nvm location (macOS)
  if [ -s "/opt/homebrew/opt/nvm/nvm.sh" ]; then
    source "/opt/homebrew/opt/nvm/nvm.sh"
    return 0
  fi
  # Intel Homebrew
  if [ -s "/usr/local/opt/nvm/nvm.sh" ]; then
    source "/usr/local/opt/nvm/nvm.sh"
    return 0
  fi
  return 1
}

if load_nvm; then
  CURRENT_NVM_NODE=$(nvm current 2>/dev/null || echo "none")
  echo "  nvm found (current: $CURRENT_NVM_NODE)"

  if nvm ls "$REQUIRED_NODE" 2>/dev/null | grep -q "v${REQUIRED_NODE}"; then
    nvm use "$REQUIRED_NODE" --silent
    echo "  ✓ Switched to Node $(node -v) via nvm"
  else
    echo "  Node $REQUIRED_NODE not installed — installing via nvm..."
    nvm install "$REQUIRED_NODE"
    nvm use "$REQUIRED_NODE" --silent
    nvm alias default "$REQUIRED_NODE"
    echo "  ✓ Installed and activated Node $(node -v)"
  fi
else
  # No nvm — check system Node
  if command -v node >/dev/null 2>&1; then
    NODE_VER=$(node -e "process.stdout.write(process.versions.node)")
    MAJOR=$(echo "$NODE_VER" | cut -d. -f1)
    if [ "$MAJOR" -ge "$REQUIRED_NODE" ]; then
      echo "  ✓ System Node v$NODE_VER (>= $REQUIRED_NODE)"
    else
      echo ""
      echo "  ⚠️  System Node v$NODE_VER is below required v$REQUIRED_NODE."
      echo ""
      echo "  Fix options:"
      echo "    a) Install nvm and run this script again:"
      echo "       curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash"
      echo "       source ~/.bashrc  # or ~/.zshrc"
      echo "       bash scripts/setup.sh"
      echo ""
      echo "    b) Install Node 22 directly:"
      echo "       https://nodejs.org/en/download"
      echo ""
      exit 1
    fi
  else
    echo "  ✗ Node.js not found."
    echo ""
    echo "  Install nvm first:"
    echo "    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash"
    echo "    source ~/.bashrc"
    echo "    bash scripts/setup.sh"
    echo ""
    exit 1
  fi
fi

# ── 2. pnpm ───────────────────────────────────────────────────────────────────
echo ""
echo "[ 2/5 ] Checking pnpm..."

if ! command -v pnpm >/dev/null 2>&1; then
  echo "  pnpm not found — installing via corepack..."
  corepack enable
  corepack prepare "pnpm@${REQUIRED_PNPM}" --activate
  echo "  ✓ pnpm $(pnpm -v) installed"
else
  echo "  ✓ pnpm $(pnpm -v) found"
fi

# ── 3. Install dependencies ───────────────────────────────────────────────────
echo ""
echo "[ 3/5 ] Installing dependencies..."
pnpm install --frozen-lockfile
echo "  ✓ Dependencies installed"

# ── 4. Generate Prisma client ─────────────────────────────────────────────────
echo ""
echo "[ 4/5 ] Generating Prisma client..."
pnpm --filter db generate
echo "  ✓ Prisma client generated"

# ── 5. .env files ─────────────────────────────────────────────────────────────
echo ""
echo "[ 5/5 ] Checking .env files..."

copy_env() {
  DEST=$1
  SRC="${DEST%.env}.env.example"
  if [ ! -f "$DEST" ]; then
    if [ -f "$SRC" ]; then
      cp "$SRC" "$DEST"
      echo "  ✓ Created $DEST (from .env.example)"
    fi
  else
    echo "  · $DEST already exists — skipped"
  fi
}

copy_env "packages/backend/.env"
copy_env "packages/db/.env"

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Setup complete!"
echo ""
echo "  Next steps:"
echo "    pnpm db:up       # start Postgres via Docker"
echo "    pnpm db:migrate  # apply migrations"
echo "    pnpm dev         # start backend + frontend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
