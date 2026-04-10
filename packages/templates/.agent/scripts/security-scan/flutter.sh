#!/usr/bin/env bash
# security-scan/flutter.sh — Secrets & security scan for Flutter/Dart projects
# Nexus Studio | TIER 1 — HARD BLOCK
set -uo pipefail

CWD="${1:-$(pwd)}"
ISSUES=0
echo "🔍 Security Scan (Flutter/Dart)..."

# Grep-based secret detection in Dart files
while IFS= read -r -d '' FILE; do
  for PATTERN in \
    'password\s*=\s*["'"'"'][^"'"'"']{3,}["'"'"']' \
    'apiKey\s*=\s*["'"'"'][^"'"'"']{3,}["'"'"']' \
    'secret\s*=\s*["'"'"'][^"'"'"']{3,}["'"'"']' \
    'BEGIN PRIVATE KEY' \
    'eyJ[A-Za-z0-9_-]{10,}'; do
    if grep -qiE "$PATTERN" "$FILE" 2>/dev/null; then
      echo "❌ Potential secret in: ${FILE#$CWD/}"
      ISSUES=$((ISSUES + 1))
    fi
  done
done < <(find "$CWD/lib" -name "*.dart" -not -path "*/.agent/*" -print0 2>/dev/null)

# Check for hardcoded API keys in common Flutter config files
for CONFIG in "$CWD/android/local.properties" "$CWD/.env"; do
  if [ -f "$CONFIG" ] && grep -qiE '(API_KEY|SECRET|PASSWORD)\s*=\s*[^\$][^\s]{5,}' "$CONFIG"; then
    echo "⚠️  Potential credential in ${CONFIG#$CWD/}"
    ISSUES=$((ISSUES + 1))
  fi
done

# Check pubspec.yaml for known vulnerable packages
if command -v flutter &>/dev/null; then
  echo "  → Checking for outdated/vulnerable packages..."
  flutter pub outdated --json 2>/dev/null | grep -q '"isDiscontinued":true' && {
    echo "⚠️  Discontinued packages found — check flutter pub outdated"
  } || true
fi

if [ "$ISSUES" -gt 0 ]; then
  echo "❌ Security scan failed — $ISSUES issue(s). Fix before delivering code."
  exit 1
fi
echo "✅ Security scan passed."
exit 0
