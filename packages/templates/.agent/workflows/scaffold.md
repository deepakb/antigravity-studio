---
description: Scaffold — generate a complete feature scaffold (files, routes, types, tests) from a feature description
---

# /scaffold Workflow

> **Purpose**: Generate a complete, production-ready feature scaffold in one pass — types, routes, components, services, tests, and documentation. No half-done stubs. Every file is immediately runnable.

## When to Use
- Starting a new feature from scratch
- Adding a new resource to an existing API
- Creating a new page + data flow end-to-end
- Setting up a new module/domain in NestJS or similar

## Phase 1: Feature Intake

Before generating any files, the AI must answer:

```
Feature name: [what are we building?]
Data shape: [what does the primary entity look like?]
Routes needed: [which pages/endpoints?]
Auth required: [public / protected / role-based?]
Profile: {{profile}} → [stack-specific conventions apply]
```

If any answer is unclear, ask ONE concise clarifying question.

## Phase 2: Scaffold Plan

Output the plan before writing code:

```
📋 SCAFFOLD PLAN: [Feature Name]

Files to create:
  ├── types/[feature].ts         ← Shared TypeScript interfaces
  ├── [data layer file]           ← DB schema / repository
  ├── [API layer file(s)]         ← Route handlers / controller
  ├── [UI component file(s)]      ← Pages / components
  ├── [test file(s)]              ← Unit + integration tests
  └── [docs update]               ← README / JSDoc

Profile conventions applied: {{profile}}
Agent coalition: [list of agents]
```

Pause for confirmation if Epic scope.

## Phase 3: Execution Order

Always generate in this order (respects dependency chain):

### Step 1: Types First
```ts
// types/[feature].ts
export interface [FeatureName] { ... }
export interface Create[FeatureName]Dto { ... }
export interface Update[FeatureName]Dto { ... }
```

### Step 2: Data Layer
- Schema update (Prisma/Drizzle) if new entity
- Repository or data access functions
- Migration file if applicable

### Step 3: API Layer
- Route handler / controller
- Input validation (Zod/class-validator)
- Auth guard if protected

### Step 4: UI Layer (web profiles)
- Page component with data fetching
- Reusable sub-components
- Form with validation

### Step 5: Tests
- Unit test for service/business logic
- Integration test for API endpoint
- E2E stub for critical path (marked TODO if time-constrained)

### Step 6: Exports + Index
- Update `index.ts` barrel exports
- Update navigation/route registry if new page

## Phase 4: Delivery

```
✅ Scaffold: [Feature Name]

Files created: N
Stack: {{profile}}
Tests: [N unit, N integration]
Auth: [public / protected]

⚙️ Setup required:
  - [ ] Run: npx prisma migrate dev (if schema changed)
  - [ ] Add env var: [if any]

➡️ Next: Run /preview to verify, then /generate-e2e for E2E tests
```
