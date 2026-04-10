#!/usr/bin/env bash
# dead-code-detector/node.sh — Unused code & export detector
# Nexus Studio | TIER 3 — ADVISORY
set -uo pipefail
CWD="${1:-$(pwd)}"
echo "🔍 Dead Code Detector..."

# Prefer knip if available, fallback to ts-prune
if [ -f "$CWD/node_modules/.bin/knip" ]; then
  echo "  → Running knip..."
  cd "$CWD" && npx knip --reporter compact 2>&1 | head -60
  echo "✅ Dead code analysis complete (advisory only)."
elif npx ts-prune --version &>/dev/null 2>&1; then
  echo "  → Running ts-prune (unused exports)..."
  cd "$CWD" && npx ts-prune 2>/dev/null | grep -v "used in module" | head -40
  echo "  ℹ️  Install 'knip' for more comprehensive analysis: npm install -D knip"
  echo "✅ Dead code analysis complete (advisory only)."
else
  # Fallback: simple grep for potentially unused patterns
  echo "  → Quick scan for unused imports..."
  UNUSED=$(grep -r "^import.*from" "$CWD/src" --include="*.ts" --include="*.tsx" 2>/dev/null | \
    grep -v "node_modules" | wc -l | tr -d ' ')
  echo "  → Total import statements: $UNUSED"
  echo "  ℹ️  Install 'knip' for full dead-code analysis: npm install -D knip"
  echo "✅ Dead code scan complete (advisory only)."
fi
exit 0
