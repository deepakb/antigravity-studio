#!/usr/bin/env bash
# env-validator/flutter.sh — Env/config documentation check for Flutter/Dart projects
# Nexus Studio | TIER 1 — HARD BLOCK
set -uo pipefail

CWD="${1:-$(pwd)}"
ISSUES=0
echo "🔐 Env Validator (Flutter/Dart)..."

# Check for .env file usage (flutter_dotenv pattern)
if grep -rqE 'dotenv|flutter_dotenv' "$CWD/pubspec.yaml" "$CWD/lib" 2>/dev/null; then
  echo "  → flutter_dotenv detected"
  if [ ! -f "$CWD/.env.example" ] && [ ! -f "$CWD/.env.template" ]; then
    echo "⚠️  No .env.example found — create one to document required variables"
    ISSUES=$((ISSUES + 1))
  else
    echo "  ✓ .env.example exists"
  fi
fi

# Check --dart-define usage in build scripts
if grep -rqE '\-\-dart-define' "$CWD" --include="*.sh" --include="*.yaml" --include="*.yml" 2>/dev/null; then
  echo "  → --dart-define variables found in build config"
  VARS=$(grep -rhoE '\-\-dart-define=([A-Z0-9_]+)' "$CWD" 2>/dev/null | sed 's/--dart-define=//' | sort -u)
  if [ -n "$VARS" ]; then
    echo "  → Dart-define vars used:"
    echo "$VARS" | while read -r VAR; do echo "    - $VAR"; done
    echo "  ℹ️  Document these in README under 'Environment Setup'"
  fi
fi

if [ "$ISSUES" -gt 0 ]; then
  echo "❌ Flutter env check failed — $ISSUES issue(s)."
  exit 1
fi
echo "✅ Flutter env check complete."
exit 0
