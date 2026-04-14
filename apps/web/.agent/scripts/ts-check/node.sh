#!/usr/bin/env bash
# ts-check/node.sh — TypeScript compiler & architecture lint for Node/TypeScript projects
# Nexus Studio | TIER 1 — HARD BLOCK
set -uo pipefail

CWD="${1:-$(pwd)}"
ISSUES=0
echo "🔷 TypeScript & Architecture Check (Node)..."

if command -v npx &>/dev/null && [ -f "$CWD/tsconfig.json" ]; then
  echo "  → Running tsc --noEmit..."
  npx tsc --noEmit -p "$CWD/tsconfig.json" 2>&1 || { echo "❌ TypeScript errors found"; ISSUES=$((ISSUES + 1)); }
fi

if [ "$ISSUES" -gt 0 ]; then
  echo "❌ TypeScript check failed — fix type errors before delivering code."
  exit 1
fi
echo "✅ TypeScript check passed."
exit 0
