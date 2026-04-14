#!/usr/bin/env bash
# bundle-analyzer/node.sh — Bundle size check for web projects
# Nexus Studio | TIER 3 — ADVISORY
# Supports: Next.js (.next/), Vite (dist/assets/), Create React App (build/)
set -uo pipefail
CWD="${1:-$(pwd)}"
WARNINGS=0

echo "📊 Bundle Analyzer (Node/Web)..."

# ── Next.js — .next/static/chunks/ ────────────────────────────────────────────
if [ -d "$CWD/.next" ]; then
  echo "  → Next.js build found (.next/)..."
  find "$CWD/.next/static/chunks" -name "*.js" -size +250k 2>/dev/null | while read -r f; do
    SIZE=$(du -sh "$f" | cut -f1)
    echo "  ⚠️  Large chunk: ${f#$CWD/} ($SIZE)"
  done

# ── Vite — dist/assets/ ─────────────────────────────────────────────────
elif [ -d "$CWD/dist/assets" ]; then
  echo "  → Vite build found (dist/assets/)..."
  # Warning threshold: > 250kb raw (~83kb gzipped)
  find "$CWD/dist/assets" -name "*.js" -size +250k 2>/dev/null | while read -r f; do
    SIZE=$(du -sh "$f" | cut -f1)
    echo "  ⚠️  Large chunk: ${f#$CWD/} ($SIZE) — consider splitting with manualChunks in vite.config.ts"
  done
  # Critical threshold: > 500kb raw (~167kb gzipped) — must split
  find "$CWD/dist/assets" -name "*.js" -size +500k 2>/dev/null | while read -r f; do
    SIZE=$(du -sh "$f" | cut -f1)
    echo "  ❌ Critical chunk: ${f#$CWD/} ($SIZE) — exceeds 500kb, must split before shipping"
    WARNINGS=$((WARNINGS + 1))
  done

# ── Create React App — build/static/js/ ───────────────────────────────────
elif [ -d "$CWD/build/static" ]; then
  echo "  → CRA build found (build/)..."
  find "$CWD/build/static/js" -name "*.js" -size +250k 2>/dev/null | while read -r f; do
    SIZE=$(du -sh "$f" | cut -f1)
    echo "  ⚠️  Large chunk: ${f#$CWD/} ($SIZE)"
  done

else
  echo "  ℹ️  No build output found. Run your build command first (npm run build)."
  echo "  ℹ️  Supported: Next.js (.next/), Vite (dist/), CRA (build/)"
fi

echo "✅ Bundle analysis complete (advisory only)."
exit 0
