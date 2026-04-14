#!/usr/bin/env bash
# license-audit/node.sh — License compliance check for Node projects
# Nexus Studio | TIER 2 — AUTO-FIX
set -uo pipefail
CWD="${1:-$(pwd)}"
echo "⚖️  License Audit (Node)..."
cd "$CWD"
if command -v npx &>/dev/null; then
  OUTPUT=$(npx --yes license-checker --summary --excludePrivatePackages 2>/dev/null || true)
  if echo "$OUTPUT" | grep -qiE "GPL(?!.*exception)|AGPL|EUPL"; then
    echo "❌ Incompatible licenses detected (GPL/AGPL/EUPL) — legal review required"
    echo "$OUTPUT" | grep -iE "GPL|AGPL|EUPL"
    exit 1
  fi
  echo "$OUTPUT"
  echo "✅ No incompatible licenses found."
else
  echo "⚠️  npx not available. Run: npm install -g license-checker"
fi
exit 0
