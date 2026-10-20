#!/usr/bin/env bash
# Reclaim disk space without losing the work.
#
#   ./scripts/clean.sh          remove artifacts untouched for 30 days, cap target/ at 8 GB
#   ./scripts/clean.sh --full   cargo clean (the next build is from scratch)
set -euo pipefail
cd "$(dirname "$0")/.."

if [ "${1:-}" = "--full" ]; then
  echo "==> cargo clean"
  cargo clean
  exit 0
fi

if ! command -v cargo-sweep >/dev/null 2>&1; then
  echo "cargo-sweep is not installed." >&2
  echo "  cargo install cargo-sweep" >&2
  echo "or run: $0 --full" >&2
  exit 1
fi

echo "==> removing artifacts untouched for 30 days"
cargo sweep --time 30

echo "==> capping target/ at 8 GB"
cargo sweep --maxsize 8GB

echo "==> target size"
du -sh target 2>/dev/null || true

if command -v sccache >/dev/null 2>&1; then
  echo "==> sccache"
  sccache --show-stats | sed -n '1,14p'
fi
