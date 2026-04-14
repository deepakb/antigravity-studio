---
description: Blueprint — write a formal Architecture Document before any code is written (gated workflow)
agent: agent
tools: [search/codebase, terminal]
---

# /blueprint Workflow

> **Purpose**: Force the AI to produce a complete, reviewable Architecture Document *before* writing a single line of implementation code. The user must explicitly approve the blueprint before execution begins.

## When to Use
Invoke `/blueprint` for any feature or change that:
- Touches 2+ files or domains
- Involves a database change
- Affects authentication or authorization
- Requires a new API endpoint
- Could impact performance or security

## Phase 1: Discovery (AI only — no code)

### 1.1 Understand the Request
Ask clarifying questions until you have answers to ALL of these:
- [ ] What is the user-facing outcome? (what will the user see/do differently?)
- [ ] Who are the users? (role, auth level)
- [ ] What are the success criteria? (how do we know it's done?)
- [ ] Are there performance or security constraints?
- [ ] What is out of scope?

### 1.2 Explore the Codebase
Before designing, understand:
- [ ] What existing code is relevant? (run file searches)
- [ ] What patterns are already established? (auth, data access, component structure)
- [ ] What are the current database models involved?
- [ ] Are there existing tests for related code?

## Phase 2: Architecture Document (AI writes, User reviews)

Produce the following document:

```markdown
# Blueprint: [Feature Name]

## Problem Statement
[One paragraph: what problem does this solve?]

## Proposed Solution
[One paragraph: approach overview]

## Tech Decisions
| Decision | Choice | Rationale |
|---|---|---|
| State management | React Query | Server data cached + revalidated |
| ... | ... | ... |

## File Changes
| File | Action | What changes |
|---|---|---|
| `app/api/posts/route.ts` | CREATE | POST and GET route handlers |
| `lib/repositories/post.ts` | CREATE | Post repository |
| `prisma/schema.prisma` | MODIFY | Add Post model |
| ... | ... | ... |

## Database Schema Changes
[Show new Prisma models or changes to existing ones]

## API Contract
[Endpoint, method, request shape, response shape, auth requirements]

## Component Tree
[Show which new components are created and where they fit in the tree]

## Security Considerations
[Auth checks, input validation approach, data exposure risks]

## Test Plan
[Unit tests for X, integration tests for Y, E2E for Z]

## Risks & Mitigations
[What could go wrong and how we prevent it]
```

## 🔴 GATE — EXPLICIT APPROVAL REQUIRED

After producing the Blueprint, **STOP and ask the user**:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Blueprint complete. Ready to proceed?

Please review the document above and reply:
  ✅ "Approved" or "Go ahead" — to begin implementation
  ✏️  "Change X to Y" — to revise the blueprint first
  ❌ "Cancel" — to stop
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Do NOT write any implementation code until the user explicitly approves.

## Phase 3: Implementation (only after approval)

Once approved, execute in this strict order:
1. **Types first** — define all TypeScript interfaces/types in `@/types/`
2. **Database** — run schema changes, create migrations
3. **Backend** — data access layer, repository, service layer, API routes
4. **Frontend** — components, hooks, pages
5. **Tests** — unit → integration → E2E
6. **Verification** — run `studio validate` and confirm all gates pass
