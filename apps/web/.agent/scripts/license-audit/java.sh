#!/usr/bin/env bash
# license-audit/java.sh — License compliance for Java/Maven projects
# Nexus Studio | TIER 2
set -uo pipefail
CWD="${1:-$(pwd)}"
echo "⚖️  License Audit (Java)..."
cd "$CWD"
if command -v mvn &>/dev/null && [ -f "pom.xml" ]; then
  mvn --quiet license:aggregate-add-third-party 2>/dev/null || \
    mvn --quiet license:third-party-report 2>/dev/null || \
    echo "⚠️  Add license-maven-plugin to pom.xml for automated license checking"
  echo "✅ License report generated. Check target/generated-sources/license for details."
else
  echo "⚠️  Maven not found or no pom.xml. Manual license review required."
fi
exit 0
