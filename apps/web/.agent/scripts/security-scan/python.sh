#!/usr/bin/env bash
# security-scan/python.sh — Secrets & security scan for Python projects
# Nexus Studio | TIER 1 — HARD BLOCK
set -uo pipefail

CWD="${1:-$(pwd)}"
ISSUES=0
echo "🔍 Security Scan (Python)..."

# Try bandit first (best Python security scanner)
if command -v bandit &>/dev/null; then
  echo "  → Running bandit..."
  bandit -r "$CWD" -ll --quiet -x "$CWD/.venv,$CWD/venv,$CWD/.agent" || ISSUES=$((ISSUES + 1))
else
  echo "  ⚠️  bandit not installed. Install: pip install bandit"
  echo "  → Falling back to grep-based scan..."
fi

# Grep-based secret detection (always runs)
while IFS= read -r -d '' FILE; do
  for PATTERN in \
    'password\s*=\s*["'"'"'][^"'"'"']{3,}["'"'"']' \
    'api_key\s*=\s*["'"'"'][^"'"'"']{3,}["'"'"']' \
    'secret\s*=\s*["'"'"'][^"'"'"']{3,}["'"'"']' \
    'eyJ[A-Za-z0-9_-]{10,}' \
    'BEGIN PRIVATE KEY'; do
    if grep -qiE "$PATTERN" "$FILE" 2>/dev/null; then
      echo "❌ Potential secret in: ${FILE#$CWD/}"
      ISSUES=$((ISSUES + 1))
    fi
  done
done < <(find "$CWD" -name "*.py" -not -path "*/.venv/*" -not -path "*/venv/*" -not -path "*/__pycache__/*" -not -path "*/.agent/*" -print0 2>/dev/null)

# Check for hardcoded credentials in settings files
for SETTINGS in "$CWD/settings.py" "$CWD/config.py" "$CWD/*/settings.py"; do
  if [ -f "$SETTINGS" ] && grep -qiE 'SECRET_KEY\s*=\s*["'"'"'][^"'"'"']{10,}["'"'"']' "$SETTINGS"; then
    echo "❌ Hardcoded SECRET_KEY found in ${SETTINGS#$CWD/} — use environment variable"
    ISSUES=$((ISSUES + 1))
  fi
done

if [ "$ISSUES" -gt 0 ]; then
  echo "❌ Security scan failed — $ISSUES issue(s). Fix before delivering code."
  exit 1
fi
echo "✅ Security scan passed."
exit 0
