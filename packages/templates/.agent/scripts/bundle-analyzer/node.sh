#!/usr/bin/env bash
# bundle-analyzer/node.sh — Bundle size check for web projects
# Nexus Studio | TIER 3 — ADVISORY
set -uo pipefail
CWD="${1:-$(pwd)}"
echo "📊 Bundle Analyzer (Node/Web)..."
# Check .next build output if it exists
if [ -d "$CWD/.next" ]; then
  echo "  → Next.js build found. Checking chunk sizes..."
  find "$CWD/.next/static/chunks" -name "*.js" -size +250k 2>/dev/null | while read -r f; do
    SIZE=$(du -sh "$f" | cut -f1)
    echo "  ⚠️  Large chunk: ${f#$CWD/} ($SIZE)"
  done
fi
echo "✅ Bundle analysis complete (advisory only)."
exit 0
