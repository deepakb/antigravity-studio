# SKILL: GitHub Actions CI/CD

## Overview
Production-grade GitHub Actions workflows for TypeScript/Next.js monorepos and single projects. Load when setting up or modifying CI/CD pipelines.

## Complete CI Pipeline
```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true  # Cancel running jobs when new commit is pushed

env:
  NODE_VERSION: '22'
  PNPM_VERSION: '9'

jobs:
  # ─── Job 1: Setup cache (reused by all subsequent jobs) ───────────────
  install:
    name: Install dependencies
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: '${{ env.PNPM_VERSION }}' }
      - uses: actions/setup-node@v4
        with:
          node-version: '${{ env.NODE_VERSION }}'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile

  # ─── Job 2: TypeScript + Lint (fast feedback) ─────────────────────────
  quality:
    name: 'Type Check & Lint'
    runs-on: ubuntu-latest
    needs: install
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: '${{ env.PNPM_VERSION }}' }
      - uses: actions/setup-node@v4
        with:
          node-version: '${{ env.NODE_VERSION }}'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint

  # ─── Job 3: Unit Tests with Coverage ──────────────────────────────────
  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: install
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: '${{ env.PNPM_VERSION }}' }
      - uses: actions/setup-node@v4
        with: { node-version: '${{ env.NODE_VERSION }}', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:coverage
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with: { token: '${{ secrets.CODECOV_TOKEN }}' }

  # ─── Job 4: Build ─────────────────────────────────────────────────────
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [quality, test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: '${{ env.PNPM_VERSION }}' }
      - uses: actions/setup-node@v4
        with: { node-version: '${{ env.NODE_VERSION }}', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - name: Build
        run: pnpm build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL_CI }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
          NEXTAUTH_URL: http://localhost:3000

  # ─── Job 5: E2E Tests (only on PRs to main) ───────────────────────────
  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: build
    if: github.base_ref == 'main'
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: '${{ env.PNPM_VERSION }}' }
      - uses: actions/setup-node@v4
        with: { node-version: '${{ env.NODE_VERSION }}', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm playwright install --with-deps
      - run: pnpm test:e2e
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL_CI }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
          NEXTAUTH_URL: http://localhost:3000
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

## Deploy to Production Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    name: Deploy to Vercel Production
    runs-on: ubuntu-latest
    environment: production  # Requires manual approval (GitHub Environments)
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Reusable Composite Action
```yaml
# .github/actions/setup/action.yml — avoid repeating setup steps
name: Setup Node + pnpm
runs:
  using: composite
  steps:
    - uses: pnpm/action-setup@v4
      with: { version: '9' }
    - uses: actions/setup-node@v4
      with: { node-version: '22', cache: 'pnpm' }
    - run: pnpm install --frozen-lockfile
      shell: bash
```

## Key Rules
- `pnpm install --frozen-lockfile` (never `npm install`) in CI
- `concurrency` + `cancel-in-progress` reduces bill and speeds up PRs
- Secrets in `settings → environments → production`, not repository secrets for prod
- Use `needs:` to create dependency graph — parallel where possible
