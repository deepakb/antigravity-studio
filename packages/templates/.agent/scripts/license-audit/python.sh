#!/usr/bin/env bash
# license-audit/python.sh — License compliance for Python projects
# Nexus Studio | TIER 2
set -uo pipefail
CWD="${1:-$(pwd)}"
echo "⚖️  License Audit (Python)..."
cd "$CWD"
if command -v pip-licenses &>/dev/null; then
  OUTPUT=$(pip-licenses --format=table 2>/dev/null)
  echo "$OUTPUT"
  if echo "$OUTPUT" | grep -qiE "\bGPL\b|\bAGPL\b"; then
    echo "⚠️  GPL/AGPL packages detected — flag for legal review"
  else
    echo "✅ No incompatible licenses detected."
  fi
else
  echo "⚠️  pip-licenses not installed. Install: pip install pip-licenses"
fi
exit 0
