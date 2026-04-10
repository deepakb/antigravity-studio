#!/usr/bin/env bash
# dependency-audit/dotnet.sh — CVE scan for .NET projects
# Nexus Studio | TIER 2 — AUTO-FIX
set -uo pipefail
CWD="${1:-$(pwd)}"
echo "📦 Dependency Audit (.NET)..."
cd "$CWD"
if ! command -v dotnet &>/dev/null; then echo "⚠️  dotnet CLI not found"; exit 0; fi
OUTPUT=$(dotnet list package --vulnerable --include-transitive 2>&1)
if echo "$OUTPUT" | grep -qiE "critical|high"; then
  echo "❌ HIGH/CRITICAL vulnerable packages found:"
  echo "$OUTPUT" | grep -iE "critical|high"
  echo "  → Run: dotnet add package <PackageName> --version <patchedVersion>"
  exit 1
fi
echo "✅ No HIGH/CRITICAL vulnerable packages found."
dotnet list package --outdated 2>/dev/null | head -15 || true
exit 0
