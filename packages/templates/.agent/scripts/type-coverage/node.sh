#!/usr/bin/env bash
# type-coverage/node.sh — TypeScript type coverage report
# Nexus Studio | TIER 3 — ADVISORY
set -uo pipefail
CWD="${1:-$(pwd)}"
echo "📐 Type Coverage (TypeScript)..."
if command -v npx &>/dev/null && [ -f "$CWD/tsconfig.json" ]; then
  RESULT=$(npx --yes type-coverage --strict --at-least 90 "$CWD" 2>&1 || true)
  echo "$RESULT"
  echo "$RESULT" | grep -qE "[0-9]+\.[0-9]+%" && echo "✅ Type coverage check complete." || echo "  ℹ️  Install type-coverage: npm i -D type-coverage"
fi
exit 0
