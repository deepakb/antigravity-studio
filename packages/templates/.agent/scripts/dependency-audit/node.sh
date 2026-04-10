#!/usr/bin/env bash
# dependency-audit/node.sh — CVE vulnerability scan for Node/TypeScript projects
# Nexus Studio | TIER 2 — AUTO-FIX
set -uo pipefail
CWD="${1:-$(pwd)}"
echo "📦 Dependency Audit (Node)..."
cd "$CWD"
if ! command -v npm &>/dev/null; then echo "⚠️  npm not found"; exit 0; fi
OUTPUT=$(npm audit --audit-level=high --json 2>/dev/null || true)
CRITICAL=$(echo "$OUTPUT" | grep -oE '"critical":[0-9]+' | grep -oE '[0-9]+' | head -1)
HIGH=$(echo "$OUTPUT" | grep -oE '"high":[0-9]+' | grep -oE '[0-9]+' | head -1)
CRITICAL=${CRITICAL:-0}; HIGH=${HIGH:-0}
if [ "$CRITICAL" -gt 0 ] || [ "$HIGH" -gt 0 ]; then
  echo "❌ Found ${CRITICAL} CRITICAL and ${HIGH} HIGH vulnerabilities"
  echo "  → Auto-fix: npm audit fix"
  npm audit fix --audit-level=high 2>/dev/null || true
  echo "  → Re-run audit after fix to confirm..."
  npm audit --audit-level=high 2>/dev/null && echo "✅ Fixed successfully" || echo "⚠️  Manual intervention required"
  exit 1
fi
echo "✅ No HIGH/CRITICAL vulnerabilities found."
exit 0
