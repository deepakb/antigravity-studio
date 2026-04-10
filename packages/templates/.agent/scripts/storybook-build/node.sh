#!/usr/bin/env bash
# storybook-build/node.sh — Storybook Build Integrity Check
# Nexus Studio | TIER 2 — REQUIRED
set -uo pipefail
CWD="${1:-$(pwd)}"
echo "📚 Storybook Build Check..."

# Check for Storybook
if ! [ -d "$CWD/.storybook" ]; then
  echo "  ⚠️  No .storybook/ directory found — skipping Storybook gate."
  echo "  → Install Storybook: npx storybook@latest init"
  exit 0
fi

# Count story files
STORY_COUNT=$(find "$CWD/src" -name "*.stories.tsx" -o -name "*.stories.ts" 2>/dev/null | \
  grep -v node_modules | wc -l | tr -d ' ')

if [ "$STORY_COUNT" -eq 0 ]; then
  echo "  ⚠️  No *.stories.tsx files found."
  echo "  → Every design system component should have a corresponding story file."
  exit 0
fi

echo "  → Found $STORY_COUNT story file(s). Building Storybook..."

# Check for build-storybook script
if ! grep -q "build-storybook" "$CWD/package.json" 2>/dev/null; then
  echo "  ⚠️  No build-storybook script in package.json."
  echo "  → Add: \"build-storybook\": \"storybook build\" to your scripts"
  exit 0
fi

# Run the build
cd "$CWD" && npm run build-storybook 2>&1
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ Storybook build passed — $STORY_COUNT stories compile successfully."
else
  echo "❌ Storybook build FAILED — fix story compilation errors before merging."
  exit 1
fi
