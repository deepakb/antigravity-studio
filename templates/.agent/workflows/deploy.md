---
description: deploy — guided production deployment with pre-flight checks and rollback plan
---

# /deploy Workflow

> **Purpose**: Deploy changes to production with zero downtime, systematic pre-flight checks, and a defined rollback plan.

## Activate: @devops-engineer Agent

## Execution Steps

### Step 1: Pre-Flight Checklist (Do Not Skip)
- [ ] All tests passing: `npm run test`
- [ ] TypeScript clean: `npm run typecheck`  
- [ ] Lint clean: `npm run lint`
- [ ] Build succeeds locally: `npm run build`
- [ ] Environment variables set in production
- [ ] Database migrations ready (if schema changed)
- [ ] Feature flag enabled/disabled as needed
- [ ] Dependent services healthy (DB, Redis, third-party APIs)

### Step 2: Database Migrations (If Applicable)
```bash
# ⚠️ ALWAYS run migration in staging first
# Then in production:
npx prisma migrate deploy  # Safe — only runs pending migrations, never destructive

# ✅ Migration checklist:
# - Is the migration backwards-compatible? (old code + new DB works)
# - If removing a column: deploy code ignoring column FIRST, then remove column
# - If adding a NOT NULL column: add with DEFAULT value or as nullable first
```

### Step 3: Deploy
```bash
# Vercel (recommended for Next.js)
vercel --prod

# Or trigger via GitHub Actions (push to main → auto deploy)
git push origin main

# Self-hosted Docker
docker build -t app:latest .
docker-compose up -d --no-downtime  # Blue/green via nginx
```

### Step 4: Post-Deploy Verification
Within 5 minutes of deployment:
- [ ] Visit the deployed URL — does it load?
- [ ] Check Vercel/server logs for errors
- [ ] Test the primary user flow (login, core feature)
- [ ] Check error monitoring (Sentry, Datadog) for spike in errors
- [ ] Verify database connection (ping health endpoint)

### Step 5: Rollback Plan
If something is wrong within 30 minutes:
```bash
# Vercel — instant rollback to previous deployment
vercel rollback

# GitHub — revert the commit
git revert HEAD
git push origin main

# Database — only if migration hasn't been applied with live data yet
npx prisma migrate reset  # ⚠️ DESTROYS DATA — use only on fresh migrations
```

### Step 6: Deployment Record
```
🚀 Deployment Log
   Version: v1.2.3
   SHA: abc1234
   Deployed: 2025-03-17 15:00 IST
   Deployer: [name]
   Changes: [brief description]
   Status: ✅ Success
   Rollback: vercel rollback (if needed within 24h)
```
