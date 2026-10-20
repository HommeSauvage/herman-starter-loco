#!/usr/bin/env bash
# Loco ships one official skill, written into .claude/skills/loco by loco new.
# Other agent harnesses read the same files from their own directory, so keep
# them as byte-identical copies. Edit .claude/skills/loco, then run this.
set -euo pipefail
cd "$(dirname "$0")/.."

src=".claude/skills/loco"
[ -d "$src" ] || { echo "missing $src" >&2; exit 1; }

for dir in .agents .pi .cursor; do
  mkdir -p "$dir/skills"
  rm -rf "$dir/skills/loco"
  cp -R "$src" "$dir/skills/loco"
  echo "synced $dir/skills/loco"
done
