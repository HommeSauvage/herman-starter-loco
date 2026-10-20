#!/usr/bin/env bash
# Point git at the committed hooks. Local config only; nothing global changes.
set -euo pipefail
cd "$(dirname "$0")/.."

git config core.hooksPath .githooks
chmod +x .githooks/*
echo "pre-commit hook installed (core.hooksPath=.githooks)"
echo "it runs ./scripts/ci-check.sh; bypass with git commit --no-verify"
