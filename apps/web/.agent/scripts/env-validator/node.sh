#!/usr/bin/env bash
# env-validator/node.sh — Env var documentation check for Node/TypeScript projects
# Nexus Studio | TIER 1 — HARD BLOCK
set -uo pipefail
CWD="${1:-$(pwd)}"
echo "🔐 Env Validator (Node)..."

# grep-based check
MISSING=0
EXAMPLE="$CWD/.env.example"

if [ ! -f "$EXAMPLE" ]; then
  echo "⚠️  No .env.example found — create one to document required variables"
  exit 0
fi

DECLARED=$(grep -oE '^[A-Z0-9_]+=' "$EXAMPLE" | tr -d '=' | sort)

while IFS= read -r -d '' FILE; do
  USED=$(grep -oE 'process\.env\.([A-Z0-9_]+)' "$FILE" | sed 's/process\.env\.//' | sort -u)
  for VAR in $USED; do
    if ! echo "$DECLARED" | grep -q "^${VAR}$"; then
      echo "❌ Undocumented env var: $VAR (used in ${FILE#$CWD/})"
      MISSING=$((MISSING + 1))
    fi
  done
done < <(find "$CWD" -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | grep -v .next | grep -v .agent | tr '\n' '\0')

if [ "$MISSING" -gt 0 ]; then
  echo "❌ $MISSING undocumented env var(s) — add to .env.example with placeholder values."
  exit 1
fi
echo "✅ All env vars documented."
exit 0
