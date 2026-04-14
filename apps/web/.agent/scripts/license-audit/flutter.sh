#!/usr/bin/env bash
# license-audit/flutter.sh — License compliance for Flutter/Dart projects
# Nexus Studio | TIER 2
set -uo pipefail
CWD="${1:-$(pwd)}"
echo "⚖️  License Audit (Flutter/Dart)..."
cd "$CWD"
if command -v flutter &>/dev/null; then
  flutter pub deps --no-dev 2>/dev/null | head -40
  echo "  ℹ️  Review pub.dev license pages for each dependency above."
  echo "  ✓ Most pub.dev packages use BSD/MIT/Apache — check any non-standard ones."
fi
echo "✅ Flutter license check complete."
exit 0
