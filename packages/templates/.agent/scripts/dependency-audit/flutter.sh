#!/usr/bin/env bash
# dependency-audit/flutter.sh — Package audit for Flutter/Dart projects
# Nexus Studio | TIER 2 — AUTO-FIX
set -uo pipefail
CWD="${1:-$(pwd)}"
echo "📦 Dependency Audit (Flutter)..."
cd "$CWD"
if ! command -v flutter &>/dev/null; then echo "⚠️  flutter CLI not found"; exit 0; fi
echo "  → Running flutter pub outdated..."
flutter pub outdated 2>/dev/null
echo "  → Running dart pub audit..."
dart pub audit 2>/dev/null || echo "⚠️  dart pub audit requires Dart 3.3+"
echo "✅ Flutter dependency audit complete. Review any flagged packages above."
exit 0
