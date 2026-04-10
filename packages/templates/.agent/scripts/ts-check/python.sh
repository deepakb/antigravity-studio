#!/usr/bin/env bash
# ts-check/python.sh — Type & lint check for Python projects
# Nexus Studio | TIER 1 — HARD BLOCK
set -uo pipefail

CWD="${1:-$(pwd)}"
ISSUES=0
echo "🐍 Type & Lint Check (Python)..."

cd "$CWD"

# mypy — type checking
if command -v mypy &>/dev/null; then
  echo "  → Running mypy..."
  mypy . --ignore-missing-imports --no-error-summary 2>&1 | grep -E "error:|Error" && ISSUES=$((ISSUES + 1)) || true
else
  echo "  ⚠️  mypy not installed. Install: pip install mypy"
fi

# ruff — fast linter (replaces flake8 + isort + pyupgrade)
if command -v ruff &>/dev/null; then
  echo "  → Running ruff check..."
  ruff check . --select E,F,W --quiet || ISSUES=$((ISSUES + 1))
elif command -v flake8 &>/dev/null; then
  echo "  → Running flake8..."
  flake8 . --max-line-length=120 --exclude=.venv,venv,__pycache__ || ISSUES=$((ISSUES + 1))
else
  echo "  ⚠️  No linter found. Install: pip install ruff"
fi

if [ "$ISSUES" -gt 0 ]; then
  echo "❌ Python type/lint check failed — fix errors before delivering code."
  exit 1
fi
echo "✅ Python type/lint check passed."
exit 0
