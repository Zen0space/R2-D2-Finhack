#!/bin/sh
# Kills processes on dev ports before starting the dev server.
# Supports Linux/WSL2 (fuser) and macOS (lsof).

PORTS="3000 4000"

kill_port() {
  PORT=$1
  if command -v fuser >/dev/null 2>&1; then
    fuser -k "${PORT}/tcp" 2>/dev/null && echo "Killed process on port ${PORT}" || true
  elif command -v lsof >/dev/null 2>&1; then
    PIDS=$(lsof -ti:"${PORT}" 2>/dev/null)
    if [ -n "$PIDS" ]; then
      echo "$PIDS" | xargs kill -9 2>/dev/null && echo "Killed process on port ${PORT}" || true
    fi
  fi
}

for PORT in $PORTS; do
  kill_port "$PORT"
done
