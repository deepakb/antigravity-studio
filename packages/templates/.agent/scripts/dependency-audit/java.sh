#!/usr/bin/env bash
# dependency-audit/java.sh — CVE scan for Java/Maven/Gradle projects
# Nexus Studio | TIER 2 — AUTO-FIX
set -uo pipefail
CWD="${1:-$(pwd)}"
echo "📦 Dependency Audit (Java)..."
cd "$CWD"
if command -v mvn &>/dev/null && [ -f "pom.xml" ]; then
  echo "  → Running OWASP Dependency Check (Maven)..."
  mvn --quiet org.owasp:dependency-check-maven:check -DfailBuildOnCVSS=7 2>&1 && \
    echo "✅ No HIGH/CRITICAL CVEs found." || { echo "❌ HIGH/CRITICAL CVEs found. Check target/dependency-check-report.html"; exit 1; }
elif command -v gradle &>/dev/null && [ -f "build.gradle" ]; then
  echo "  → Running OWASP Dependency Check (Gradle)..."
  ./gradlew dependencyCheckAnalyze --quiet 2>&1 && \
    echo "✅ No HIGH/CRITICAL CVEs found." || { echo "❌ CVEs found. Check build/reports/dependency-check-report.html"; exit 1; }
else
  echo "⚠️  Maven/Gradle not found. Manual dependency review required."
  exit 0
fi
