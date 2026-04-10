#!/usr/bin/env bash
# lighthouse-ci/node.sh — Lighthouse CI Core Web Vitals Gate
# Nexus Studio | TIER 2 — REQUIRED
set -uo pipefail
CWD="${1:-$(pwd)}"
echo "🔦 Lighthouse CI — Core Web Vitals..."

# Check if LHCI is installed
if ! command -v lhci &>/dev/null && ! [ -f "$CWD/node_modules/.bin/lhci" ]; then
  echo "  ⚠️  @lhci/cli not installed."
  echo "  → Install: npm install -D @lhci/cli"
  echo "  → Add lighthouserc.json to project root (see fix guidance in manifest.md)"
  exit 0
fi

# Check for LHCI config
if ! [ -f "$CWD/lighthouserc.json" ] && ! [ -f "$CWD/.lighthouserc.js" ]; then
  echo "  ⚠️  No lighthouserc.json found. Creating advisory config check..."
  echo "  → Create lighthouserc.json with assertions for LCP < 2500ms, CLS < 0.1"
  exit 0
fi

# Check if a build exists for testing
if ! [ -d "$CWD/dist" ] && ! [ -d "$CWD/.next" ]; then
  echo "  ⚠️  No production build found (dist/ or .next/)."
  echo "  → Run 'npm run build' before running Lighthouse CI."
  exit 0
fi

echo "  → Running Lighthouse CI assertions..."
cd "$CWD" && npx lhci assert --config=lighthouserc.json 2>&1
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ Lighthouse CI passed — Core Web Vitals within budget."
else
  echo "❌ Lighthouse CI FAILED — Performance regression detected."
  echo "   Review lhci-report/ for details."
  exit 1
fi
