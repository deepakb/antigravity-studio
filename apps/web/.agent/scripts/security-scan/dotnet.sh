#!/usr/bin/env bash
# security-scan/dotnet.sh — Secrets & security scan for .NET projects
# Nexus Studio | TIER 1 — HARD BLOCK
set -uo pipefail

CWD="${1:-$(pwd)}"
ISSUES=0
echo "🔍 Security Scan (.NET/C#)..."

# Grep-based secret detection in C# files
while IFS= read -r -d '' FILE; do
  for PATTERN in \
    'password\s*=\s*["'"'"'][^"'"'"']{3,}["'"'"']' \
    'apiKey\s*=\s*["'"'"'][^"'"'"']{3,}["'"'"']' \
    'secret\s*=\s*["'"'"'][^"'"'"']{3,}["'"'"']' \
    'BEGIN PRIVATE KEY' \
    'eyJ[A-Za-z0-9_-]{10,}'; do
    if grep -qiE "$PATTERN" "$FILE" 2>/dev/null; then
      echo "❌ Potential secret in: ${FILE#$CWD/}"
      ISSUES=$((ISSUES + 1))
    fi
  done
done < <(find "$CWD" -name "*.cs" -not -path "*/obj/*" -not -path "*/bin/*" -not -path "*/.agent/*" -print0 2>/dev/null)

# Check appsettings.json for hardcoded secrets
for SETTINGS in "$CWD/appsettings.json" "$CWD/appsettings.Development.json"; do
  if [ -f "$SETTINGS" ]; then
    if grep -qiE '"(Password|Secret|ApiKey|ConnectionString)"\s*:\s*"[^"]{5,}"' "$SETTINGS"; then
      echo "⚠️  Potential hardcoded credential in ${SETTINGS#$CWD/} — use User Secrets or environment variables"
      ISSUES=$((ISSUES + 1))
    fi
  fi
done

# Run dotnet security scan if available
if command -v dotnet &>/dev/null; then
  echo "  → Checking for known vulnerable packages..."
  dotnet list "$CWD" package --vulnerable --include-transitive 2>/dev/null | grep -i "critical\|high" && {
    echo "❌ HIGH/CRITICAL vulnerable packages found"
    ISSUES=$((ISSUES + 1))
  } || true
fi

if [ "$ISSUES" -gt 0 ]; then
  echo "❌ Security scan failed — $ISSUES issue(s). Fix before delivering code."
  exit 1
fi
echo "✅ Security scan passed."
exit 0
