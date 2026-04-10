#!/usr/bin/env bash
# seo-linter/node.sh — SEO & metadata validation for web projects
# Nexus Studio | TIER 3 — ADVISORY
set -uo pipefail
CWD="${1:-$(pwd)}"
echo "🔍 SEO Linter (Node/Web)..."
# Static checks for Next.js App Router pages
ISSUES=0
while IFS= read -r -d '' FILE; do
  if ! grep -q 'metadata\|generateMetadata' "$FILE" 2>/dev/null; then
    echo "  ⚠️  Missing metadata export in: ${FILE#$CWD/}"
    ISSUES=$((ISSUES + 1))
  fi
  if grep -qiE '"robots".*"noindex"' "$FILE" 2>/dev/null; then
    echo "  ❌ noindex detected in: ${FILE#$CWD/} — ESCALATE if production page"
  fi
done < <(find "$CWD/src/app" -name "page.tsx" -print0 2>/dev/null)
[ "$ISSUES" -gt 0 ] && echo "  ⚠️  $ISSUES page(s) missing metadata" || echo "  ✓ All pages have metadata"
echo "✅ SEO check complete (advisory only)."
exit 0
