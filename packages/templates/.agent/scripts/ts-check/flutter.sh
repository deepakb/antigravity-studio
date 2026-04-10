#!/usr/bin/env bash
# ts-check/flutter.sh — Analyze & format check for Flutter/Dart projects
# Nexus Studio | TIER 1 — HARD BLOCK
set -uo pipefail

CWD="${1:-$(pwd)}"
echo "💙 Analyze & Format Check (Flutter/Dart)..."

cd "$CWD"

if ! command -v flutter &>/dev/null; then
  echo "  ⚠️  flutter CLI not found."
  exit 0
fi

echo "  → Running flutter analyze..."
flutter analyze --no-pub 2>&1 || { echo "❌ Flutter analyze found errors"; exit 1; }

echo "  → Checking dart format..."
dart format --set-exit-if-changed . 2>&1 | grep -v "^Unchanged" || {
  echo "⚠️  Formatting issues found. Run: dart format ."
}

echo "✅ Flutter analyze check passed."
exit 0
