---
description: status — project health check showing installed agents, quality gates, and recommendations
---

# /status Workflow

> **Purpose**: Run a comprehensive health check on the project — installed agents, code quality metrics, security posture, and actionable recommendations.

## Execution Steps

### Step 1: Installed Agents & Skills
```bash
cat .agstudio.json  # Shows installed components and version
```
Output the installed agents, skills, and workflows in a formatted table.

### Step 2: Code Quality Snapshot
```bash
npm run typecheck 2>&1 | tail -5  # TypeScript errors
npm run lint 2>&1 | tail -10      # ESLint issues
npm run test -- --reporter=verbose 2>&1 | tail -20  # Test results
```

### Step 3: Security Quick Scan
```bash
npm audit --audit-level=moderate
```

### Step 4: Build Health
```bash
npm run build 2>&1 | grep -E "(error|warning|success)" | tail -10
```

### Status Report Format
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔮 Antigravity Studio — Project Health: [ProjectName]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 INSTALLED
  Agents:    15/25 installed
  Skills:    12/36 installed
  Workflows: 10/13 installed
  Version:   v1.0.0 (latest)

🧪 TEST HEALTH
  Unit Tests:  231 passing, 0 failing ✅
  Coverage:    82% lines, 78% branches ✅
  E2E Tests:   12 passing, 1 skipped ✅

🔒 SECURITY
  npm audit:   2 moderate (run `npm audit fix`) ⚠️
  TypeScript:  0 errors ✅
  ESLint:      0 errors, 3 warnings ⚠️

🏗️ BUILD
  Last build:  ✅ Success (98kb first load JS)
  Bundle:      ✅ Under 200kb threshold

⭐ RECOMMENDATIONS
  1. Run `/audit-security` — auth changes made last sprint
  2. Run `/generate-tests` for PostService (coverage: 43%)
  3. Update: 3 agents have newer versions available (run `studio update`)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
