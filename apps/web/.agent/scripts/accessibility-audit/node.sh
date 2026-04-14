#!/usr/bin/env bash
# accessibility-audit/node.sh — WCAG accessibility check for web projects
# Nexus Studio | TIER 3 — ADVISORY
set -uo pipefail
CWD="${1:-$(pwd)}"
echo "♿ Accessibility Audit (Web)..."
# eslint jsx-a11y check
if command -v npx &>/dev/null; then
  npx eslint . --ext .tsx,.jsx --rule 'jsx-a11y/alt-text: warn' --rule 'jsx-a11y/aria-props: warn' 2>/dev/null || \
    echo "⚠️  Install eslint-plugin-jsx-a11y for full accessibility checking"
fi
echo "✅ Accessibility check complete (advisory only)."
exit 0
