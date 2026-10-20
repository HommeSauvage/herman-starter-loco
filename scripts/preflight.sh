#!/usr/bin/env bash
# One line per environment fact. No side effects.
set -uo pipefail
cd "$(dirname "$0")/.."

fail=0

fact() {
  printf '%-18s %s\n' "$1" "$2"
}

require() {
  if command -v "$1" >/dev/null 2>&1; then
    fact "$2" "$("$1" --version 2>&1 | head -1)"
  else
    fact "$2" "MISSING — $3"
    fail=1
  fi
}

require cargo "cargo" "install Rust: https://rustup.rs"
require rustc "rustc" "install Rust: https://rustup.rs"
require bun "bun" "install Bun: https://bun.sh"

if command -v sea-orm-cli >/dev/null 2>&1; then
  fact "sea-orm-cli" "$(sea-orm-cli --version 2>&1 | head -1)"
else
  fact "sea-orm-cli" "MISSING — cargo install sea-orm-cli (needed for 'cargo loco db entities')"
  fail=1
fi

if [ -d frontend/node_modules ]; then
  fact "frontend deps" "installed"
else
  fact "frontend deps" "MISSING — (cd frontend && bun install)"
fi

if command -v cargo >/dev/null 2>&1; then
  if cargo loco doctor 2>&1 | grep -q "❌"; then
    fact "loco doctor" "reports a problem — run: cargo loco doctor"
  else
    fact "loco doctor" "ok"
  fi
fi

exit "$fail"
