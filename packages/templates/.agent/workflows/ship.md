---
description: Ship — production readiness checklist and deployment pipeline for the current feature or release
---

# /ship Workflow

> **Purpose**: Systematic production-readiness check before any merge to main. Runs all quality gates, validates environment config, confirms test coverage, and executes the deployment pipeline.

## When to Use
- Before merging a feature branch to `main`
- Before a production release
- After a hotfix to validate no regressions
- As a pre-deployment gate in CI/CD

## Phase 1: Pre-Flight Checklist

```
Agent: @devops-engineer + @qa-engineer + @security-engineer
```

### 1.1 Code Quality
- [ ] TypeScript compiles with zero errors: `tsc --noEmit`
- [ ] Linter passes: `eslint src/` (zero errors, zero warnings in CI)
- [ ] No `console.log`, `debugger`, or `TODO` left in production code
- [ ] No hardcoded secrets, localhost URLs, or test credentials

### 1.2 Tests
- [ ] Unit tests pass: `npm test`
- [ ] Integration tests pass
- [ ] E2E critical paths pass (login, primary CRUD, checkout if applicable)
- [ ] Coverage threshold met (check `.vitest.config.ts` / `jest.config.ts`)

### 1.3 Security
- [ ] `npm audit --audit-level=high` — zero high/critical vulnerabilities
- [ ] Environment variables documented in `.env.example`
- [ ] No new `any` types at API boundaries
- [ ] Auth guards on all protected endpoints

### 1.4 Performance (web profiles)
- [ ] Bundle size within budget (check `bundle-analyzer` gate)
- [ ] No new synchronous lazy-loaded imports
- [ ] Lighthouse CI score ≥ 90 Performance, ≥ 90 Accessibility

## Phase 2: Gate Runs

```bash
# Run all gates for detected stack
bash .agent/scripts/verify-all/{{scriptRunner}}.sh
```

If any TIER 1 gate fails → **STOP**. Do not deploy.

## Phase 3: Environment Validation

```bash
# Confirm environment variables are set in deployment target
studio validate --env production

# Check for drift between .env.example and actual env
diff <(cat .env.example | grep -v '^#' | sort) \
     <(printenv | grep -E '^[A-Z_]+=' | sort)
```

Required env vars checklist — add to `.env.example` if missing.

## Phase 4: Build

```bash
# Run production build
npm run build

# Verify build output
# - No chunk > 500kb (unless WASM/heavy library)
# - sourcemaps generated for staging
# - assets hash-named for cache busting
```

## Phase 5: Deploy

```bash
# Deploy to staging first
vercel --env staging      # or your deployment command

# Smoke test on staging
curl https://staging.yourapp.com/health  # expect 200

# Deploy to production
vercel --prod             # or: railway up, fly deploy, etc.
```

## Phase 6: Post-Deploy Verification

| Check | Command |
|-------|---------|
| Health endpoint | `curl https://yourapp.com/health` |
| Core page loads | Manual or Playwright smoke test |
| Error rate normal | Check Sentry / Datadog |
| Response times OK | Check p95 latency |

## Delivery Format

```
🚀 Ship: COMPLETE

Build: ✅ Success (bundle: 124kb gzipped)
Tests: ✅ 48 passing, 0 failing
Security: ✅ 0 high vulnerabilities
Gates: ✅ All passing

Deployed to: https://yourapp.com
Commit: [hash]
Time: [timestamp]

📊 Lighthouse: Performance 94 | A11y 98 | SEO 100
```
