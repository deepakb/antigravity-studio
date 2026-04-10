#!/usr/bin/env bash
# e2e-runner/node.sh — Playwright E2E Test Runner
# Nexus Studio | TIER 2 — REQUIRED
set -uo pipefail
CWD="${1:-$(pwd)}"
echo "🎭 E2E Runner (Playwright)..."

# Check if Playwright is installed
if ! [ -f "$CWD/node_modules/.bin/playwright" ] && ! npx playwright --version &>/dev/null 2>&1; then
  echo "  ⚠️  Playwright not installed. Run: npm install -D @playwright/test && npx playwright install"
  exit 0
fi

# Check for playwright config
if ! [ -f "$CWD/playwright.config.ts" ] && ! [ -f "$CWD/playwright.config.js" ]; then
  echo "  ⚠️  No playwright.config.ts found — skipping E2E gate."
  exit 0
fi

# Count test files
SPEC_COUNT=$(find "$CWD" -name "*.spec.ts" -not -path "*/node_modules/*" 2>/dev/null | wc -l | tr -d ' ')
if [ "$SPEC_COUNT" -eq 0 ]; then
  echo "  ⚠️  No .spec.ts files found. Add Playwright tests to cover critical user flows."
  exit 0
fi

echo "  → Found $SPEC_COUNT E2E spec file(s). Running tests..."

# Run Playwright in CI mode
cd "$CWD" && npx playwright test --reporter=list 2>&1
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ E2E tests passed — all critical user flows verified."
else
  echo "❌ E2E tests FAILED — review playwright-report/index.html for details."
  exit 1
fi
