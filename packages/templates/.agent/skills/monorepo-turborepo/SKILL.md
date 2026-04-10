---
name: monorepo-turborepo
description: "Managing complex, multi-package monorepos with Turborepo for high-velocity teams."
---

# SKILL: Enterprise Turborepo Workspaces

## Overview
Managing complex, multi-package monorepos with Turborepo for high-velocity teams.

## 1. Remote Caching
- **Vercel Remote Cache**: Share build artifacts across the whole team and CI/CD.
- **Zero-Build CI**: If code hasn't changed, CI should take 0 seconds (Full Cache Hit).

## 2. Internal Package Patterns
- **Shared Client (Prisma)**: Don't export the client; export the schema and types. Each app instantiates its own client to avoid connection pool exhaustion.
- **Config Inheritance**: Packages should inherit from a base `@repo/tsconfig` or `@repo/eslint-config` to ensure zero drift.

## 3. Parallel Execution & Pipelines
- **Task Dependencies**: Define strict `dependsOn` in `turbo.json` (e.g., `build` depends on `^build`).
- **Persistent Workers**: Use `persistent: true` for dev servers to keep them running during incremental builds.

## 4. Package Boundaries & Exports
- **Barrel-only Exports**: Use `exports` in `package.json` to strictly control what internals are accessible to other packages.
- **Type-only Imports**: Enforce `import type` crossing package boundaries to reduce bundle size and circular deps.

## 5. Incremental Adoption
- Moving from a monolith to a monorepo? Start by extracting `utils` and `types`.
- Use `turbo prune` to create minimal Docker builds for specific workspace apps.
