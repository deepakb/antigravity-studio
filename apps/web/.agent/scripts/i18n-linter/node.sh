#!/usr/bin/env bash
# i18n-linter/node.sh — Translation key validation for web projects
# Nexus Studio | TIER 3 — ADVISORY
set -uo pipefail
CWD="${1:-$(pwd)}"
echo "🌐 i18n Linter (Node/Web)..."
# Check locale files exist and have same keys
LOCALE_DIR=""
for D in "$CWD/messages" "$CWD/locales" "$CWD/public/locales" "$CWD/src/locales"; do
  [ -d "$D" ] && { LOCALE_DIR="$D"; break; }
done
if [ -z "$LOCALE_DIR" ]; then echo "  ℹ️  No locale directory found — skipping i18n check"; exit 0; fi
EN_FILE=$(find "$LOCALE_DIR" -name "en.json" -o -name "en-US.json" | head -1)
if [ -z "$EN_FILE" ]; then echo "  ℹ️  No en.json found — skipping i18n check"; exit 0; fi
EN_KEYS=$(python3 -c "import json,sys; d=json.load(open('$EN_FILE')); print('\n'.join(d.keys()))" 2>/dev/null | wc -l)
echo "  → Primary locale (en): $EN_KEYS keys"
find "$LOCALE_DIR" -name "*.json" ! -name "en.json" ! -name "en-US.json" | while read -r LOCALE_FILE; do
  LOCALE_KEYS=$(python3 -c "import json; d=json.load(open('$LOCALE_FILE')); print(len(d))" 2>/dev/null || echo 0)
  LOCALE=$(basename "$LOCALE_FILE")
  [ "$LOCALE_KEYS" -lt "$EN_KEYS" ] && echo "  ⚠️  $LOCALE: $LOCALE_KEYS/$EN_KEYS keys (missing $((EN_KEYS - LOCALE_KEYS)))"
done
echo "✅ i18n check complete (advisory only)."
exit 0
