---
description: deploy — zero-downtime production deployment with pre-flight checks, migration strategy, and rollback plan
---

# /deploy Workflow

> **Purpose**: Deploy changes to production safely — zero downtime, backwards-compatible migrations, verified post-deploy health, and an always-ready rollback path.

## 🤖 Activation
```
🤖 Applying @devops-engineer + @security-engineer + loading deployment-procedures, ci-cd skills...
```

---

## Pre-Deploy Gate (All Must Pass Before Continuing)

```bash
# Run the full quality suite
studio run verify-all

# Or individually:
npm run typecheck         # Zero TypeScript errors
npm run lint              # Zero lint errors (warnings allowed)
npm run test              # All tests passing
npm run build             # Production build succeeds
npm audit --audit-level=high  # No high/critical vulnerabilities
```

```
✅ Pre-deploy checklist:
  [ ] All tests passing (N/N)
  [ ] TypeScript: 0 errors
  [ ] Lint: 0 errors
  [ ] Build: success, bundle < threshold
  [ ] Security audit: 0 critical/high
  [ ] Environment variables: all set in target environment
  [ ] Database migration: reviewed and staged (if applicable)
  [ ] Feature flags: configured for gradual rollout (if applicable)
  [ ] Dependent services: healthy (DB, Redis, external APIs)
  [ ] Rollback tested in staging
```

> **Rule**: If any pre-deploy check fails → **STOP**. Fix the issue. Do not deploy broken code.

---

## Phase 1: Database Migration Strategy

> Migrations are the highest-risk part of deployment. Always separate migration from code deployment.

```
SAFE MIGRATION SEQUENCE:
  Step 1: Deploy migration (backwards-compatible with old code)
  Step 2: Deploy new code
  Step 3: Remove backward-compat shims in next deploy
```

### Safe vs Dangerous Operations

| Operation | Safe? | Approach |
|-----------|-------|----------|
| Add nullable column | ✅ Yes | Deploy directly |
| Add NOT NULL column | ⚠️ Risky | Add as nullable → backfill → add NOT NULL constraint |
| Add index | ✅ Yes | Use `CREATE INDEX CONCURRENTLY` |
| Remove column | ❌ Dangerous | Deploy code ignoring column → wait → remove column |
| Rename column | ❌ Dangerous | Add new column → dual-write → migrate reads → remove old |
| Add table | ✅ Yes | Deploy directly |
| Remove table | ❌ Dangerous | Deploy code not using table → wait one deploy → drop |

```bash
# Run migration (safe — only applies pending, never destructive)
npx prisma migrate deploy

# Verify migration succeeded
npx prisma db pull  # Should show no diff
```

---

## Phase 2: Deployment by Platform

### Vercel (Next.js — Recommended)
```bash
# Production deploy
vercel --prod

# Preview deploy (staging)
vercel

# Check logs immediately post-deploy
vercel logs --prod --follow
```

### Docker + Self-Hosted (Blue/Green)
```bash
# Build new image
docker build -t app:$(git rev-parse --short HEAD) .

# Blue/Green swap (zero downtime)
docker-compose up -d --scale app=2  # Start new alongside old
# Wait for new containers healthy
docker-compose up -d --scale app=1  # Remove old

# Or with Docker Swarm
docker service update --image app:$(git rev-parse --short HEAD) app_web
```

### GitHub Actions (CI/CD Trigger)
```bash
# Tag-based production deploy
git tag -a v1.2.3 -m "Release v1.2.3"
git push origin v1.2.3

# Or branch-based
git push origin main  # Triggers GitHub Actions → Vercel/Railway/Render
```

---

## Phase 3: Post-Deploy Verification (First 15 Minutes Critical)

Run in order immediately after deployment:

```
WITHIN 5 MINUTES:
  [ ] Visit production URL — page loads without error
  [ ] Check deploy logs for warnings or errors
  [ ] Test primary user flow manually (login → core feature → logout)
  [ ] Health check endpoint responds: GET /api/health → 200 OK
  [ ] Database connected: migration applied, basic query works

WITHIN 15 MINUTES:
  [ ] Error monitoring: no spike in 5xx errors (Sentry/Datadog)
  [ ] Performance: response times normal (not degraded)
  [ ] Key metrics: verify with real traffic (if monitoring available)
```

Health check endpoint (if not implemented):
```typescript
// app/api/health/route.ts
import { db } from '@/lib/db';

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`; // Verify DB connection
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.VERCEL_GIT_COMMIT_SHA ?? 'local',
    });
  } catch (error) {
    return Response.json({ status: 'unhealthy', error: String(error) }, { status: 503 });
  }
}
```

---

## Phase 4: Rollback Execution

If critical issue detected within 30 minutes:

```bash
# Vercel — instant rollback (preserves DB state)
vercel rollback

# GitHub Actions — revert commit and push
git revert HEAD
git push origin main

# Docker — rollback to previous image
docker service update --rollback app_web

# Database rollback (CAUTION — may lose data)
# Only if migration has NOT been run with live data yet:
npx prisma migrate reset  # ⚠️ DESTROYS ALL DATA — staging only
```

Decision tree:
```
Is it a code bug? → Rollback code immediately
Is it a migration bug? → Assess data impact → consult team → decide
Is it an external service? → Enable degraded mode / feature flag → mitigate
```

---

## Delivery Format

```markdown
## 🚀 Deployed: [Feature/Version]

**Version**: v[N].[N].[N]  
**SHA**: [git short SHA]  
**Environment**: Production  
**Deployer**: [name]  
**Time**: {{timestamp}}

### What Was Deployed
[Brief description of changes in this release]

### Pre-Deploy Checks
- TypeScript: ✅ 0 errors
- Tests: ✅ N/N passing
- Build: ✅ Success ([N]kb)
- Security: ✅ 0 critical/high

### Migrations Applied
[None | List of migrations]

### Post-Deploy Status
- Health: ✅ /api/health → 200 OK
- Primary flow: ✅ Tested manually
- Error rate: ✅ Normal

### Rollback Command (if needed within 24h)
\`\`\`bash
vercel rollback  # or git revert [sha]
\`\`\`
```
