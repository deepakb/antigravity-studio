---
description: orchestrate — coordinate multiple specialist agents for a complex multi-domain feature
---

# /orchestrate Workflow

> **Purpose**: Decompose a complex request into parallel and sequential workstreams, assign to specialist agents, and reconcile outputs into a unified, coherent result.

## Activate: @orchestrator Agent

## When to Use This Workflow
Use `/orchestrate` when a request clearly requires 3+ specialist agents and has:
- Multiple domains (UI + API + DB + security)
- Sequential dependencies (B can't start until A is done)
- Potential for inconsistency if different agents work in isolation

## Execution Template

### Phase 1: Decompose (30 seconds — no code)
```
🗂️ ORCHESTRATING: [Feature Name]

DOMAINS AFFECTED:
✓ Database — schema changes needed
✓ Backend API — new endpoints
✓ Frontend — new components
✓ Security — auth/validation checks
✓ Tests — coverage for all layers

DEPENDENCY MAP:
Database Schema (Step 1) → all others depend on this
Backend API (Step 2) → depends on Step 1
Frontend (Step 3) → depends on Step 2
Tests (Step 4) → depends on Steps 1–3

PARALLEL OPPORTUNITIES:
Frontend UI skeleton can run parallel with backend (once types defined)
```

### Phase 2: Types First (Always First, Always)
```typescript
// Define shared types BEFORE any agent starts
// packages/types/[feature].ts
export interface [Entity] { ... }
export interface Create[Entity]Input { ... }
export interface [Entity]Response { ... }
```

### Phase 3: Execute in Dependency Order
For each step, announce the agent and its task:
```
🤖 Step 1: @database-engineer
   Task: Add [table] schema with [fields], run migration
   
🤖 Step 2: @backend-specialist  
   Task: Create repository + service + Route Handler

🤖 Step 3: @frontend-specialist (parallel with Step 2 once types exist)
   Task: Build [ComponentA] and [ComponentB], connect via React Query

🤖 Step 4: @security-engineer (review Steps 1-3)
   Task: Verify auth checks, input validation, no data exposure

🤖 Step 5: @qa-engineer
   Task: Unit tests for service, E2E for primary user flow
```

### Phase 4: Reconcile
After all agents complete:
- [ ] All imports resolve correctly across files?
- [ ] TypeScript types consistent across all layers?
- [ ] No duplicate logic (service vs. route handler)?
- [ ] Does the feature work end-to-end?

### Phase 5: Final Gate
```bash
npm run typecheck
npm run test
npm run build
```
All green before marking complete.
