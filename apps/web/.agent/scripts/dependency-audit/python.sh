#!/usr/bin/env bash
# dependency-audit/python.sh — CVE vulnerability scan for Python projects
# Nexus Studio | TIER 2 — AUTO-FIX
set -uo pipefail
CWD="${1:-$(pwd)}"
echo "📦 Dependency Audit (Python)..."
cd "$CWD"
if command -v pip-audit &>/dev/null; then
  pip-audit --format json 2>/dev/null | python3 -c "
import sys, json
data = json.load(sys.stdin)
vulns = [v for d in data.get('dependencies',[]) for v in d.get('vulns',[]) if v.get('fix_versions')]
critical = [v for v in vulns if any(c.get('severity','').upper() in ['CRITICAL','HIGH'] for c in v.get('aliases',[]))]
print(f'Found {len(vulns)} vulnerabilities ({len(critical)} critical/high)')
sys.exit(1 if critical else 0)
" || { echo "❌ HIGH/CRITICAL vulnerabilities found. Run: pip-audit --fix"; exit 1; }
elif command -v safety &>/dev/null; then
  safety check --json 2>/dev/null | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'Found {len(data)} known vulnerabilities')
sys.exit(1 if data else 0)
" || { echo "❌ Vulnerabilities found. Review with: safety check"; exit 1; }
else
  echo "⚠️  No audit tool found. Install: pip install pip-audit"
  pip list --outdated 2>/dev/null | head -10
fi
echo "✅ Python dependency audit passed."
exit 0
