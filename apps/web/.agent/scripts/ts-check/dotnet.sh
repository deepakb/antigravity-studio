#!/usr/bin/env bash
# ts-check/dotnet.sh — Build & format check for .NET projects
# Nexus Studio | TIER 1 — HARD BLOCK
set -uo pipefail

CWD="${1:-$(pwd)}"
echo "🔵 Build & Format Check (.NET)..."

cd "$CWD"

if ! command -v dotnet &>/dev/null; then
  echo "  ⚠️  dotnet CLI not found. Install .NET SDK."
  exit 0
fi

echo "  → Running dotnet build..."
dotnet build --nologo -q 2>&1 || { echo "❌ Build failed"; exit 1; }

echo "  → Checking dotnet format..."
dotnet format --verify-no-changes --no-restore 2>&1 || {
  echo "⚠️  Formatting issues found. Run: dotnet format"
  # Warn only — format issues are not a hard block
}

echo "✅ .NET build check passed."
exit 0
