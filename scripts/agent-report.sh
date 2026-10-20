#!/usr/bin/env bash
# One JSON line of facts an agent can read without parsing prose.
set -euo pipefail
cd "$(dirname "$0")/.."

rust_version="$(rustc --version | awk '{print $2}')"
loco_version="$(awk '/^name = "loco-rs"/{found=1} found && /^version =/{gsub(/"/, "", $3); print $3; exit}' Cargo.lock)"
routes="$(cargo loco routes 2>/dev/null | grep -cE ' (GET|POST|PUT|PATCH|DELETE) ' || true)"
migrations="$(find migration/src -name 'm*.rs' | wc -l | tr -d ' ')"
tests="$(find tests -name '*.rs' | wc -l | tr -d ' ')"
db="$(ls -1 ./*_development.sqlite 2>/dev/null | head -1 || true)"

printf '{"rust":"%s","loco":"%s","routes":%s,"migrations":%s,"test_files":%s,"database":"%s"}\n' \
  "$rust_version" "${loco_version:-unknown}" "${routes:-0}" "$migrations" "$tests" "${db:-none}"
