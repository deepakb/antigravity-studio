#!/usr/bin/env bash
# accessibility-audit/flutter.sh — Semantics check for Flutter projects
# Nexus Studio | TIER 3 — ADVISORY
set -uo pipefail
CWD="${1:-$(pwd)}"
echo "♿ Accessibility Audit (Flutter)..."
cd "$CWD"
if command -v flutter &>/dev/null; then
  # flutter analyze catches some accessibility issues
  flutter analyze --no-pub 2>/dev/null | grep -iE "semantic|accessible|label" || true
  echo "  ℹ️  Manual checks required:"
  echo "     - All images have semanticLabel"
  echo "     - Interactive widgets wrapped in Semantics()"
  echo "     - Text contrast meets WCAG AA (4.5:1)"
  echo "     - ExcludeSemantics() not overused"
fi
echo "✅ Flutter accessibility check complete (advisory only)."
exit 0
