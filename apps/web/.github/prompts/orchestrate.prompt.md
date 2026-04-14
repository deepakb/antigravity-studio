---
description: orchestrate — coordinate multiple specialist agents for a complex multi-domain Epic feature
agent: agent
tools: [search/codebase, terminal]
---

# /orchestrate Workflow

> **Purpose**: Decompose a complex, multi-domain request into ordered workstreams. Assign specialist agents with explicit input/output contracts. Synthesize results into a coherent, production-ready implementation.

## 🎯 When to Use

Use `/orchestrate` when the request has **3+ of these**:
- [ ] Requires 3+ specialist agents
- [ ] Cross-domain dependencies (e.g. DB schema must be designed before API, API before UI)
- [ ] Risk of type/contract inconsistency between layers
- [ ] 10+ files will be created or modified
- [ ] Multi-team or multi-sprint scope

> For smaller compound requests, use `/create` (2-3 agents) or `/blueprint` (architecture planning only).

---

## Phase 0: Complexity Assessment (Before Starting)

```
🗂️ ASSESSING: [Feature Name]
   Complexity Score: [ ] Simple  [ ] Compound  [x] Epic

   Domains: [list all affected domains]
   Agents needed: [count]
   Estimated files: [N]
   Approval gate needed? [Yes — will invoke /blueprint] | [No — proceeding]
```

If score is **Epic** and any domain involves architecture decisions → **run /blueprint first**. Wait for approval before proceeding.

---

## Phase 1: Decomposition (No code — analysis only)

Produce the full orchestration plan before a single line of code:

```
🗂️ ORCHESTRATING: [Feature Name]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DOMAIN ANALYSIS:
  ✓ [Domain 1] — [what changes]
  ✓ [Domain 2] — [what changes]
  ✓ [Domain 3] — [what changes]

DEPENDENCY MAP:
  [Step 1: Domain A] → blocks → [Step 2: Domain B]
  [Step 1: Domain A] → blocks → [Step 3: Domain C]
  [Step 2: Domain B] can parallel → [Step 3: Domain C after types defined]

AGENT ASSIGNMENTS:
  Step 1: @[agent] — [task] → Output: [artifact]
  Step 2: @[agent] — [task] → Consumes: [artifact] → Output: [artifact]
  ...

OUTPUT CONTRACTS:
  @[agent-A] → produces → [TypeScript types in types/[feature].ts]
  @[agent-B] → produces → [API routes + service functions]
  ...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Phase 2: Shared Types (Always First — Zero Exceptions)

Before any agent touches domain code:

```typescript
// types/[feature-name].ts — shared across all agents

export interface [Entity] {
  id: string;
  // ... all fields
}

export interface Create[Entity]Input {
  // input shape for mutations
}

export interface [Entity]Response {
  // API response shape — what the frontend receives
}

export type [Action]Result =
  | { success: true; data: [Entity] }
  | { success: false; error: string; code: ErrorCode };
```

> All agents reference these types. No agent invents its own types mid-implementation.

---

## Phase 3: Execute in Dependency Order

For each step, announce the agent, its consumed inputs, and its produced outputs:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 Step 1: @database-engineer
   Input:   [Business requirements from Phase 1]
   Task:    Design and implement schema
            ├── Add [Model] to schema.prisma
            └── Run migration
   Output:  ✅ Prisma types available, migration ready
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 Step 2: @backend-specialist + @api-architect
   Input:   @database-engineer output + shared types
   Task:    Build data layer + API
            ├── lib/repositories/[feature].ts
            ├── lib/services/[feature].ts
            └── app/api/[feature]/route.ts
   Output:  ✅ API routes tested locally, types match
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 Step 3: @security-engineer (Review Step 2)
   Input:   All code from Step 2
   Task:    Security audit
            ├── Auth guards on every route
            ├── Input validation (Zod schemas)
            ├── No data exposure in responses
            └── SQL injection / OWASP checks
   Output:  ✅ Security sign-off or [specific issue to fix]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 Step 4: @frontend-specialist / @nextjs-expert
   Input:   API contract + shared types + Step 2 output
   Task:    Build UI layer
            ├── Server Component (data fetch + layout)
            ├── Client Components (interactivity)
            └── Forms + mutations
   Output:  ✅ UI connected and rendering
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 Step 5: @qa-engineer
   Input:   Everything from Steps 1–4
   Task:    Test coverage
            ├── Unit tests: service functions
            ├── Integration: API routes
            └── E2E: primary user flow
   Output:  ✅ All tests passing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Phase 4: Mid-Task Checkpoints

After each step, before proceeding:

```
✅ Step [N] complete
   Produced: [file list]
   Types consistent: [Yes / No — if No, fix before continuing]
   Imports resolve: [Yes / No]
   Ready for Step [N+1]: [Yes / Blocked — reason]
```

If **blocked**: surface the blocker clearly, do not silently skip.

---

## Phase 5: Reconciliation & Coherence Check

After all agents complete, run the full coherence check:

- [ ] All `import` statements resolve correctly across all new files
- [ ] TypeScript types consistent across DB → Service → API → UI boundaries
- [ ] No `any` types used at layer boundaries
- [ ] API response shape matches what the frontend component expects
- [ ] No duplicated business logic (service vs. route handler)
- [ ] Environment variables documented (`.env.example` updated)
- [ ] New feature follows established patterns in `{{name}}`
- [ ] All quality gates passing (see `.agent/scripts/`)

---

## Phase 6: Gate & Delivery

```bash
# Run validation suite
studio validate
# OR manually:
studio run ts-check
studio run security-scan
npm run test
npm run build
```

All green → deliver with standard format:

```markdown
## ✅ Orchestration Complete: [Feature Name]

### 📁 Files Created/Modified
| File | Agent | Action |
|------|-------|--------|

### 🔐 Security Sign-Off
[What was reviewed and by whom]

### ⚙️ Setup Required
[Migrations to run, env vars to set]

### 🧪 How to Test
[Manual verification steps]

### ➡️ Next Steps
[Logical follow-up actions]
```
