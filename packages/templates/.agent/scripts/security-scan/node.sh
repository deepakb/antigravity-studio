#!/usr/bin/env bash
# security-scan/node.sh — Secrets & OWASP pattern detection for Node/TypeScript projects
# Nexus Studio | TIER 1 — HARD BLOCK
set -uo pipefail

CWD="${1:-$(pwd)}"
ISSUES=0

echo "🔍 Security Scan (Node/TypeScript)..."
EXTS="ts tsx js jsx mjs cjs"
for EXT in $EXTS; do
  while IFS= read -r -d '' FILE; do
    for PATTERN in \
      'password\s*[:=]\s*["'"'"'][^"'"'"']{3,}["'"'"']' \
      'api_?key\s*[:=]\s*["'"'"'][^"'"'"']{3,}["'"'"']' \
      'secret\s*[:=]\s*["'"'"'][^"'"'"']{3,}["'"'"']' \
      'eyJ[A-Za-z0-9_-]{10,}' \
      'BEGIN PRIVATE KEY' \
      '\beval\s*('; do
      if grep -qiE "$PATTERN" "$FILE" 2>/dev/null; then
        echo "❌ Secret/pattern found in: ${FILE#$CWD/}"
        ISSUES=$((ISSUES + 1))
      fi
    done
  done < <(find "$CWD" -name "*.$EXT" -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/.agent/*" -print0 2>/dev/null)
done

if [ "$ISSUES" -gt 0 ]; then
  echo "❌ Security scan failed — $ISSUES issue(s) found. Fix before delivering code."
  exit 1
fi
echo "✅ Security scan passed — no secrets or dangerous patterns found."
exit 0
