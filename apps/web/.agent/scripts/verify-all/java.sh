#!/usr/bin/env bash
# verify-all/java.sh — Master quality gate runner for Java projects
# Nexus Studio | META ORCHESTRATOR
set -uo pipefail
CWD="${1:-$(pwd)}"
SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PASS=0; WARN=0; FAIL=0

run_gate() {
  local TIER="$1"; local NAME="$2"; local SCRIPT="$3"
  printf "  %-30s " "$NAME..."
  if bash "$SCRIPT" "$CWD" &>/tmp/ag_gate_out 2>&1; then
    echo "✅ PASS"; PASS=$((PASS + 1))
  else
    if [ "$TIER" = "1" ]; then echo "❌ FAIL"; FAIL=$((FAIL + 1)); cat /tmp/ag_gate_out
    else echo "⚠️  WARN"; WARN=$((WARN + 1)); fi
  fi
}

echo -e "\n════════════════════════════════════════"
echo "  Antigravity Quality Gates — Java"
echo "════════════════════════════════════════"

echo -e "\n  PHASE 1 — HARD GATES"
run_gate 1 "Security Scan"     "$SCRIPTS_DIR/security-scan/java.sh"
run_gate 1 "Compile & Style"   "$SCRIPTS_DIR/ts-check/java.sh"
run_gate 1 "Env Validator"     "$SCRIPTS_DIR/env-validator/java.sh"
[ "$FAIL" -gt 0 ] && { echo -e "\n  ❌ $FAIL HARD GATE(S) FAILED\n"; exit 1; }

echo -e "\n  PHASE 2 — AUTO-FIX GATES"
run_gate 2 "Dependency Audit"  "$SCRIPTS_DIR/dependency-audit/java.sh"
run_gate 2 "License Audit"     "$SCRIPTS_DIR/license-audit/java.sh"

echo -e "\n════════════════════════════════════════"
echo "  Results: ✅ $PASS passed  ⚠️ $WARN advisory  ❌ $FAIL failed"
echo "════════════════════════════════════════"
[ "$FAIL" -gt 0 ] && exit 1 || exit 0
