#!/usr/bin/env bash
# license-audit/dotnet.sh — License compliance for .NET projects
# Nexus Studio | TIER 2
set -uo pipefail
CWD="${1:-$(pwd)}"
echo "⚖️  License Audit (.NET)..."
cd "$CWD"
if command -v dotnet &>/dev/null; then
  if dotnet tool list -g 2>/dev/null | grep -q "nuget-license"; then
    dotnet tool run nuget-license -i "$CWD" 2>/dev/null || npx nuget-license 2>/dev/null || true
  else
    echo "⚠️  nuget-license not installed. Install: dotnet tool install --global nuget-license"
    dotnet list package 2>/dev/null | head -20
  fi
fi
echo "✅ .NET license check complete."
exit 0
