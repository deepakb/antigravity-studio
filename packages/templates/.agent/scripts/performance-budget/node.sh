#!/usr/bin/env bash
# performance-budget/node.sh — Core Web Vitals budget check for web projects
# Nexus Studio | TIER 3 — ADVISORY
set -uo pipefail
CWD="${1:-$(pwd)}"
echo "⚡ Performance Budget (Node/Web)..."
# Static code checks for common performance issues
ISSUES=0
echo "  → Checking for common performance anti-patterns..."
while IFS= read -r -d '' FILE; do
  # Images without width/height (CLS risk)
  grep -n '<img ' "$FILE" 2>/dev/null | grep -v 'width=' | grep -v 'next/image' | grep -v 'Image from' | head -3 | while read -r line; do
    echo "  ⚠️  CLS risk — img without dimensions: ${FILE#$CWD/}"
  done
  # Missing lazy loading on images
  grep -n '<img ' "$FILE" 2>/dev/null | grep -v 'loading=' | grep -v 'priority' | head -3 | while read -r line; do
    echo "  ⚠️  Missing loading='lazy' on img: ${FILE#$CWD/}"
  done
done < <(find "$CWD/src" -name "*.tsx" -o -name "*.jsx" 2>/dev/null | tr '\n' '\0')
echo "✅ Performance budget check complete (advisory only)."
exit 0
