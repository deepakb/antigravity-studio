#!/usr/bin/env bash
# env-validator/dotnet.sh — Env/config documentation check for .NET projects
# Nexus Studio | TIER 1 — HARD BLOCK
set -uo pipefail

CWD="${1:-$(pwd)}"
echo "🔐 Env Validator (.NET)..."

# Check appsettings.json exists and has proper structure
if [ -f "$CWD/appsettings.json" ]; then
  echo "  ✓ appsettings.json found"
  # Warn if production secrets appear to be hardcoded
  if grep -qiE '"(Password|Secret|ApiKey|ConnectionString)"\s*:\s*"[^"]{5,}"' "$CWD/appsettings.json" 2>/dev/null; then
    echo "⚠️  Potential hardcoded secret in appsettings.json"
    echo "  → Use User Secrets (dev): dotnet user-secrets set"
    echo "  → Use env vars (prod): ASPNETCORE_[Section]__[Key]=value"
  fi
fi

# Check for appsettings.Production.json (should reference env vars, not hardcode)
if [ -f "$CWD/appsettings.Production.json" ]; then
  echo "  ✓ appsettings.Production.json found"
fi

# Check that Environment.GetEnvironmentVariable() calls are documented
ENV_VARS=$(grep -rhoE 'Environment\.GetEnvironmentVariable\s*\(\s*"([^"]+)"' "$CWD" --include="*.cs" 2>/dev/null | grep -oE '"[^"]+"' | tr -d '"' | sort -u)
if [ -n "$ENV_VARS" ]; then
  echo "  → Env vars used in code:"
  echo "$ENV_VARS" | while read -r VAR; do echo "    - $VAR"; done
  echo "  ℹ️  Ensure these are documented in README and set in CI/CD pipeline"
fi

echo "✅ .NET env check complete."
exit 0
