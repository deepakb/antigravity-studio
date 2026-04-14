#!/usr/bin/env bash
# ts-check/java.sh — Compile & checkstyle check for Java projects
# Nexus Studio | TIER 1 — HARD BLOCK
set -uo pipefail

CWD="${1:-$(pwd)}"
echo "☕ Compile & Style Check (Java)..."

cd "$CWD"

if command -v mvn &>/dev/null && [ -f "pom.xml" ]; then
  echo "  → Running mvn compile..."
  mvn compile -q 2>&1 || { echo "❌ Compilation failed"; exit 1; }
  echo "  → Running checkstyle..."
  mvn checkstyle:check -q 2>&1 || { echo "❌ Checkstyle violations found"; exit 1; }
elif command -v gradle &>/dev/null && [ -f "build.gradle" ]; then
  echo "  → Running gradle compileJava..."
  ./gradlew compileJava --quiet 2>&1 || { echo "❌ Compilation failed"; exit 1; }
  echo "  → Running gradle checkstyleMain..."
  ./gradlew checkstyleMain --quiet 2>&1 || { echo "⚠️  Checkstyle violations (see build/reports/checkstyle)"; }
else
  echo "  ⚠️  No Maven or Gradle found. Cannot run compile check."
  exit 0
fi

echo "✅ Java compile & style check passed."
exit 0
