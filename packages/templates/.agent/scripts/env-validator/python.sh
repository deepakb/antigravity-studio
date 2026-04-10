#!/usr/bin/env bash
# env-validator/python.sh — Env var documentation check for Python projects
# Nexus Studio | TIER 1 — HARD BLOCK
set -uo pipefail

CWD="${1:-$(pwd)}"
MISSING=0
echo "🔐 Env Validator (Python)..."

EXAMPLE="$CWD/.env.example"
[ ! -f "$EXAMPLE" ] && EXAMPLE="$CWD/.env.template"

if [ ! -f "$EXAMPLE" ]; then
  echo "⚠️  No .env.example found — create one to document required variables"
  exit 0
fi

DECLARED=$(grep -oE '^[A-Z0-9_]+=' "$EXAMPLE" | tr -d '=' | sort)

while IFS= read -r -d '' FILE; do
  # Match os.environ["VAR"], os.environ.get("VAR"), os.getenv("VAR")
  USED=$(grep -oE 'os\.environ(?:\[|\.get\s*\()\s*['"'"'"]([A-Z0-9_]+)' "$FILE" | grep -oE '[A-Z0-9_]{3,}' | sort -u 2>/dev/null || true)
  for VAR in $USED; do
    if ! echo "$DECLARED" | grep -q "^${VAR}$"; then
      echo "❌ Undocumented env var: $VAR (used in ${FILE#$CWD/})"
      MISSING=$((MISSING + 1))
    fi
  done
done < <(find "$CWD" -name "*.py" -not -path "*/.venv/*" -not -path "*/venv/*" -not -path "*/__pycache__/*" -not -path "*/.agent/*" -print0 2>/dev/null)

if [ "$MISSING" -gt 0 ]; then
  echo "❌ $MISSING undocumented env var(s) — add to .env.example."
  exit 1
fi
echo "✅ All env vars documented."
exit 0
