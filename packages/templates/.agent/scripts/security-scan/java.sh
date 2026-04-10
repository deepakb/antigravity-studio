#!/usr/bin/env bash
# security-scan/java.sh — Secrets & security scan for Java/Spring projects
# Nexus Studio | TIER 1 — HARD BLOCK
set -uo pipefail

CWD="${1:-$(pwd)}"
ISSUES=0
echo "🔍 Security Scan (Java/Spring)..."

# Grep-based secret detection in Java source files
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
done < <(find "$CWD/src" -name "*.java" -not -path "*/.agent/*" -print0 2>/dev/null)

# Check properties files for hardcoded credentials
for PROPS in "$CWD/src/main/resources/application.properties" "$CWD/src/main/resources/application.yml"; do
  if [ -f "$PROPS" ]; then
    if grep -qiE '(password|secret|api.key)\s*[:=]\s*[^\$\{][^\s]{3,}' "$PROPS"; then
      echo "❌ Hardcoded credential in ${PROPS#$CWD/} — use \${ENV_VAR} references"
      ISSUES=$((ISSUES + 1))
    fi
  fi
done

# Run OWASP Dependency Check if Maven available
if command -v mvn &>/dev/null && [ -f "$CWD/pom.xml" ]; then
  echo "  → Running OWASP Dependency Check (this may take a moment)..."
  mvn --quiet org.owasp:dependency-check-maven:check -DfailBuildOnCVSS=7 -f "$CWD/pom.xml" 2>/dev/null || {
    echo "⚠️  OWASP dependency check found HIGH/CRITICAL CVEs"
    ISSUES=$((ISSUES + 1))
  }
fi

if [ "$ISSUES" -gt 0 ]; then
  echo "❌ Security scan failed — $ISSUES issue(s). Fix before delivering code."
  exit 1
fi
echo "✅ Security scan passed."
exit 0
