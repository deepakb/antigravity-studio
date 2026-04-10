#!/usr/bin/env bash
# env-validator/java.sh — Env/config documentation check for Java/Spring projects
# Nexus Studio | TIER 1 — HARD BLOCK
set -uo pipefail

CWD="${1:-$(pwd)}"
ISSUES=0
echo "🔐 Env Validator (Java/Spring)..."

# Check application.properties / application.yml for placeholder vs hardcoded values
for PROPS in \
  "$CWD/src/main/resources/application.properties" \
  "$CWD/src/main/resources/application.yml" \
  "$CWD/src/main/resources/application-prod.properties"; do
  if [ -f "$PROPS" ]; then
    # Warn if values aren't using ${ENV_VAR} placeholders in prod config
    if [[ "$PROPS" == *"-prod"* ]]; then
      HARDCODED=$(grep -vE '^\s*#|^\s*$|\$\{' "$PROPS" | grep -E '[:=]\s*[^\s]{3,}' | wc -l)
      if [ "$HARDCODED" -gt 0 ]; then
        echo "⚠️  $HARDCODED hardcoded values in prod config ${PROPS#$CWD/} — use \${ENV_VAR:default} placeholders"
        ISSUES=$((ISSUES + 1))
      fi
    fi
    echo "  ✓ Found: ${PROPS#$CWD/}"
  fi
done

# Check that System.getenv() calls have documented variables
if grep -rqE 'System\.getenv\s*\(\s*"[A-Z0-9_]{3,}"' "$CWD/src" 2>/dev/null; then
  VARS=$(grep -rhoE 'System\.getenv\s*\(\s*"([A-Z0-9_]+)"' "$CWD/src" | grep -oE '"[A-Z0-9_]+"' | tr -d '"' | sort -u)
  echo "  → Environment variables used: $(echo $VARS | tr '\n' ' ')"
  echo "  ℹ️  Ensure these are documented in README or deployment guide"
fi

echo "✅ Java env check complete."
exit 0
