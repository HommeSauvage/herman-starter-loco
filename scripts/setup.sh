#!/usr/bin/env bash
# Install everything, create the database, build the SPA.
set -euo pipefail
cd "$(dirname "$0")/.."

./scripts/preflight.sh || true

if [ ! -d frontend/node_modules ]; then
  (cd frontend && bun install)
fi

cargo fetch
cargo loco db migrate

# Seed the demo users only when the table is empty. Re-seeding a populated
# database fails on the unique email constraint, and that is fine.
if command -v sqlite3 >/dev/null 2>&1; then
  db="$(ls -1 ./*_development.sqlite 2>/dev/null | head -1 || true)"
  if [ -n "${db:-}" ] && [ "$(sqlite3 "$db" 'select count(*) from users;' 2>/dev/null || echo 0)" = "0" ]; then
    cargo loco db seed
  fi
fi

(cd frontend && bun run build)

./scripts/install-hooks.sh
