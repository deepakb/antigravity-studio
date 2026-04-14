---
description: create — implement a new feature from scratch using the appropriate specialist agent(s)
agent: agent
tools: [search/codebase, terminal]
---

# /create Workflow

> **Purpose**: Implement a new, well-scoped feature with the right specialist(s), using the project's established patterns and passing all quality gates before delivery.

## 🎯 When to Use

Use `/create` when:
- Adding a new feature to an **existing** codebase
- Complexity is **Simple or Compound** (not Epic — use `/orchestrate` for Epic)
- Requirements are reasonably clear
- Scope is bounded: 1-5 files, 1-2 domains

> If requirements are unclear or scope is large → run `/blueprint` first.

---

## Pre-Flight Checklist (Before Writing Code)

```
1. [ ] Identify correct agent(s) from .agent/AGENTS.md routing table
2. [ ] Announce agent + skills
3. [ ] Confirm complexity (Simple = 1 agent | Compound = 2-3 agents)
4. [ ] Check if existing patterns apply (search codebase first)
5. [ ] Confirm TypeScript types for the feature exist or will be created first
```

---

## Phase 1: Understand the Codebase First

Before writing anything, search for relevant existing patterns:

```
🔍 Searching {{name}} codebase for:
├── Existing similar features (to follow established patterns)
├── Related components / services / routes already present
├── Auth patterns (if this feature is protected)
├── Data access patterns (repository vs. direct)
└── Test patterns (how are similar features tested?)
```

Report findings:
```
Found: [what exists that's relevant]
Pattern to follow: [specific file/pattern to replicate]
New files needed: [list]
```

---

## Phase 2: Clarify (Only If Needed)

Ask **at most 2 targeted questions** if requirements are ambiguous. Do not over-ask.

Good questions:
- "Should this feature be accessible to all users or only [role]?"
- "Should the data persist to the database or is client-state sufficient?"
- "Should I follow the same pattern as [existing-feature] or create a new one?"

Bad questions (do not ask):
- "What color should the button be?" (decide — follow design system)
- "Which library should I use?" (use what's already in package.json)
- "Do you want TypeScript?" (always TypeScript)

---

## Phase 3: Implementation (Strict Order)

### Step 1: Types
```typescript
// types/[feature-name].ts (or extend existing lib/types.ts)
export interface [Feature] { ... }
export interface Create[Feature]Input { ... }
```

### Step 2: Data Layer (if needed)
```typescript
// lib/repositories/[feature].ts  OR  lib/db/[feature].ts
export async function get[Feature](id: string): Promise<[Feature]> { ... }
export async function create[Feature](input: Create[Feature]Input): Promise<[Feature]> { ... }
```

### Step 3: Business Logic / API (if needed)
```typescript
// app/api/[feature]/route.ts  OR  lib/services/[feature].ts
// Always: validate input (Zod) → auth guard → call repository → return response
```

### Step 4: UI Components
```tsx
// components/[FeatureName]/index.tsx   (or app/[route]/page.tsx)
// Server Component first (data fetch) → minimize 'use client'
```

### Step 5: Tests
```typescript
// __tests__/[feature].test.ts  OR  [feature].spec.ts
// At minimum: happy path + one error case
```

---

## Phase 4: Quality Gate Check

Before delivery, mentally validate:

| Gate | Check |
|------|-------|
| TypeScript | No errors, no `any` |
| Security | Auth checks present, inputs validated |
| Accessibility | Interactive elements have labels, keyboard accessible |
| Tests | At least 1 test covering the core logic |

---

## Delivery Format

```markdown
## ✅ Created: [Feature Name]

**Agent**: @[agent-name]

### Files
| File | Action | Notes |
|------|--------|-------|
| ... | CREATE/MODIFY | ... |

### Usage
\`\`\`tsx
// How to use the new feature
\`\`\`

### Setup
[Any migrations / env vars / config needed]

### Test It
[How to verify it works — manual steps or test command]
```
