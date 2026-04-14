---
description: status — comprehensive project health dashboard with quality metrics, agent coverage, and actionable recommendations
---

# /status Workflow

> **Purpose**: Provide a complete, actionable health snapshot of the project — code quality, test coverage, security posture, agent coverage, and prioritized next actions.

## 🤖 Activation
```
🤖 Applying @project-planner + loading project-health skills...
```

---

## Phase 1: System Health Check

```bash
# Run all quality gate scripts
studio run verify-all

# Or individually:
npm run typecheck 2>&1 | tail -3
npm run lint 2>&1 | tail -5
npm run test -- --coverage --reporter=verbose 2>&1 | tail -20
npm run build 2>&1 | grep -E "(error|warning|First Load)" | tail -10
npm audit --audit-level=moderate 2>&1 | grep -E "(found|vulnerabilities)"
```

---

## Phase 2: Agent Coverage Analysis

```bash
# Read installed components
cat .agstudio.json
ls .agent/agents/ | wc -l
ls .agent/workflows/ | wc -l
ls .agent/scripts/ | wc -l
```

---

## Phase 3: Generate Status Report

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔮 Nexus Studio — Project Health Report
   Project: {{name}} | Profile: {{profile}} | {{framework.name}}
   Generated: [timestamp]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 AGENT SYSTEM
  Agents Installed:    N / 29   [████████░░] 75%
  Workflows Active:    N / 14   [██████████] 100%
  Quality Scripts:     N / 8    [█████████░] 88%
  Last Init:           [date from .agstudio.json]
  Version:             [version from .agstudio.json]

🧪 TEST HEALTH
  Unit Tests:    N passing, N failing   [✅/❌]
  Coverage:      N% lines, N% branches   [✅ ≥80% / ⚠️ <80%]
  E2E Tests:     N passing, N skipped   [✅/⚠️]
  Last Run:      [date]

🔒 SECURITY
  npm audit:     N vulnerabilities (N critical, N high)   [✅/❌]
  TypeScript:    N errors, N warnings                     [✅/⚠️]
  ESLint:        N errors, N warnings                     [✅/⚠️]

🏗️ BUILD
  Status:        ✅ Success / ❌ Failing
  First Load JS: Nkb   [✅ <200kb / ⚠️ >200kb]
  Build Time:    Ns
  Last Build:    [date]

⚡ PERFORMANCE (last Lighthouse run — if available)
  LCP:  Nms   [✅/⚠️/❌]
  INP:  Nms   [✅/⚠️/❌]
  CLS:  N     [✅/⚠️/❌]
  TTFB: Nms   [✅/⚠️/❌]

🎯 AGENT RECOMMENDATIONS
  Based on current project state:
  ┌─────────────────────────────────────────────────────┐
  │ PRIORITY 1 (do now):                                │
  │  → [Specific recommendation with command]           │
  ├─────────────────────────────────────────────────────┤
  │ PRIORITY 2 (this sprint):                           │
  │  → [Specific recommendation with command]           │
  ├─────────────────────────────────────────────────────┤
  │ PRIORITY 3 (next sprint):                           │
  │  → [Specific recommendation]                         │
  └─────────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Recommendation Logic

The AI generates recommendations based on what it finds:

| Condition | Recommendation |
|-----------|---------------|
| `npm audit` finds Critical/High | → Run `/audit-security` immediately |
| Coverage < 70% on modified files | → Run `/generate-tests` on [file] |
| TypeScript errors > 0 | → Fix TS errors before any new features |
| Build bundle > 300kb | → Run `/perf-audit` (bundle section) |
| LCP > 4s | → Run `/perf-audit` (LCP section) |
| New auth code without audit | → Run `/audit-security` on [file] |
| No E2E tests for core flows | → Run `/generate-e2e` for [flow] |
| Agent version behind | → Run `studio update` |

---

## Phase 4: Next Actions

After showing the report, offer:
```
What would you like to do?

  [A] Fix critical issues now → begin with highest priority
  [B] Deep dive: security → run /audit-security
  [C] Deep dive: performance → run /perf-audit
  [D] Improve test coverage → run /generate-tests on [file]
  [E] Update agents → studio update
  [F] Just viewing — no action needed
```
