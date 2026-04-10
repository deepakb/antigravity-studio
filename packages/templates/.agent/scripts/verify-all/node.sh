#!/usr/bin/env bash
# verify-all/node.sh — Master quality gate runner for Node/TypeScript projects
# Nexus Studio | META ORCHESTRATOR
set -uo pipefail
CWD="${1:-$(pwd)}"
SKIP_E2E="${2:-false}"
SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PASS=0; WARN=0; FAIL=0

run_gate() {
  local TIER="$1"; local NAME="$2"; local SCRIPT="$3"
  printf "  %-30s " "$NAME..."
  if bash "$SCRIPT" "$CWD" &>/tmp/ag_gate_out 2>&1; then
    echo "✅ PASS"; PASS=$((PASS + 1))
  else
    if [ "$TIER" = "1" ]; then echo "❌ FAIL"; FAIL=$((FAIL + 1)); cat /tmp/ag_gate_out
    elif [ "$TIER" = "2" ]; then echo "⚙️  FIX APPLIED"; WARN=$((WARN + 1)); cat /tmp/ag_gate_out
    else echo "⚠️  WARN"; WARN=$((WARN + 1)); fi
  fi
}

echo ""
echo "════════════════════════════════════════"
echo "  Antigravity Quality Gates — Node/TS"
echo "════════════════════════════════════════"

echo -e "\n  PHASE 1 — HARD GATES (must pass)"
run_gate 1 "Security Scan"     "$SCRIPTS_DIR/security-scan/node.sh"
run_gate 1 "TypeScript Check"  "$SCRIPTS_DIR/ts-check/node.sh"
run_gate 1 "Env Validator"     "$SCRIPTS_DIR/env-validator/node.sh"
[ "$FAIL" -gt 0 ] && { echo -e "\n  ❌ $FAIL HARD GATE(S) FAILED — fix before proceeding\n"; exit 1; }

echo -e "\n  PHASE 2 — AUTO-FIX GATES"
run_gate 2 "Dependency Audit"  "$SCRIPTS_DIR/dependency-audit/node.sh"
run_gate 2 "License Audit"     "$SCRIPTS_DIR/license-audit/node.sh"

echo -e "\n  PHASE 3 — ADVISORY GATES"
run_gate 3 "Accessibility"     "$SCRIPTS_DIR/accessibility-audit/node.sh"
run_gate 3 "Bundle Analyzer"   "$SCRIPTS_DIR/bundle-analyzer/node.sh"
run_gate 3 "Performance"       "$SCRIPTS_DIR/performance-budget/node.sh"
run_gate 3 "SEO Linter"        "$SCRIPTS_DIR/seo-linter/node.sh"
run_gate 3 "i18n Linter"       "$SCRIPTS_DIR/i18n-linter/node.sh"
run_gate 3 "Type Coverage"     "$SCRIPTS_DIR/type-coverage/node.sh"

echo -e "\n════════════════════════════════════════"
echo "  Results: ✅ $PASS passed  ⚠️ $WARN advisory  ❌ $FAIL failed"
echo "════════════════════════════════════════"
[ "$FAIL" -gt 0 ] && exit 1 || exit 0
