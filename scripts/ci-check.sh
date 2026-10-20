#!/usr/bin/env bash
# The gate. Green here means done.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> cargo fmt"
cargo fmt --all -- --check

echo "==> cargo clippy"
cargo clippy --all-targets -- -D warnings

echo "==> cargo test"
# Also exports the ts-rs bindings the frontend imports.
cargo test

echo "==> bindings drift"
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  if ! git diff --quiet -- frontend/src/bindings; then
    echo "frontend/src/bindings is stale. Commit the exports produced by cargo test." >&2
    git diff --stat -- frontend/src/bindings >&2
    exit 1
  fi
fi

echo "==> frontend"
if [ ! -d frontend/node_modules ]; then
  (cd frontend && bun install)
fi
(cd frontend && bun run lint)
(cd frontend && bun run format:check)
(cd frontend && bun run typecheck)
(cd frontend && bun run build)
