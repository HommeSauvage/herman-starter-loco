#!/usr/bin/env bash
# Vite on 5173 (proxying /api to the API) and Loco on 5150.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -d frontend/node_modules ]; then
  (cd frontend && bun install)
fi

(cd frontend && bun run dev) &
vite_pid=$!
cargo loco start &
api_pid=$!

cleanup() {
  kill "$vite_pid" "$api_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Hold the terminal until the API exits (Ctrl-C hits both through the trap).
wait "$api_pid"
