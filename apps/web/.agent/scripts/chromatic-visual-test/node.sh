#!/usr/bin/env bash
# chromatic-visual-test/node.sh — Chromatic Visual Regression Check
# Nexus Studio | TIER 2 — REQUIRED
set -uo pipefail
CWD="${1:-$(pwd)}"
echo "🎨 Chromatic Visual Regression..."

# Check for Storybook
if ! [ -d "$CWD/.storybook" ]; then
  echo "  ⚠️  No .storybook/ directory found — skipping Chromatic gate."
  echo "  → Install Storybook: npx storybook@latest init"
  exit 0
fi

# Check for Chromatic CLI
if ! command -v chromatic &>/dev/null && ! [ -f "$CWD/node_modules/.bin/chromatic" ]; then
  echo "  ⚠️  chromatic CLI not installed."
  echo "  → Install: npm install -D chromatic"
  echo "  → Set CHROMATIC_PROJECT_TOKEN in your CI environment secrets."
  exit 0
fi

# Check for project token
if [ -z "${CHROMATIC_PROJECT_TOKEN:-}" ]; then
  echo "  ⚠️  CHROMATIC_PROJECT_TOKEN not set — running Storybook build check only."
  cd "$CWD" && npx storybook build --quiet 2>&1
  if [ $? -eq 0 ]; then
    echo "✅ Storybook builds successfully. Set CHROMATIC_PROJECT_TOKEN in CI for visual regression."
  else
    echo "❌ Storybook build FAILED — fix compilation errors before merging."
    exit 1
  fi
  exit 0
fi

# Run Chromatic
echo "  → Uploading to Chromatic for visual comparison..."
cd "$CWD" && npx chromatic \
  --project-token="$CHROMATIC_PROJECT_TOKEN" \
  --only-changed \
  --exit-zero-on-changes=false \
  2>&1
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ Chromatic passed — no unreviewed visual changes."
else
  echo "❌ Chromatic BLOCKED — unreviewed visual changes detected."
  echo "   Review and approve changes at chromatic.com before merging."
  exit 1
fi
