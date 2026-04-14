# 🔄 Agent Flow Architecture

> **Nexus Studio** — Enterprise AI Orchestration Engine for **{{name}}**
> Profile: `{{profile}}` | Framework: `{{framework.name}}` | IDE: `{{ide}}`

---

## 📊 The 5-Stage Execution Pipeline

Every request — natural language, slash command, or domain question — flows through this pipeline. The AI **never skips stages**.

```mermaid
graph TD
    A([🧑 User Request]) --> B

    subgraph STAGE1["Stage 1: CONTEXT LOADING"]
        B[Read .agstudio.json] --> C[Detect framework signals]
        C --> D[Load installed agents & skills]
        D --> E[Establish session memory]
    end

    E --> F

    subgraph STAGE2["Stage 2: INTELLIGENT ROUTING"]
        F[Intent Classification] --> G{Complexity Score}
        G -- Simple ≤ 2 files --> H[DIRECT]
        G -- Compound 3-10 files --> I[SPECIALIST]
        G -- Epic 10+ files / multi-domain --> J[ORCHESTRATE]
    end

    H --> K
    I --> K

    subgraph STAGE3["Stage 3: AGENT COALITION"]
        K[Select Primary Agent] --> L[Select Supporting Agents]
        L --> M[Pre-load Skills]
        M --> N{Blueprint Gate?}
        N -- Need approval --> O[/blueprint workflow]
        N -- No / Already approved --> P
    end

    J --> STAGE3

    subgraph STAGE4["Stage 4: EXECUTION"]
        P[Types First] --> Q[Core Implementation]
        Q --> R[Supporting Layers]
        R --> S[Tests & Documentation]
    end

    subgraph STAGE5["Stage 5: SYNTHESIS & DELIVERY"]
        S --> T[Quality Gate Checks]
        T --> U{All Gates Pass?}
        U -- Fail --> V[Re-engage Responsible Agent]
        V --> T
        U -- Pass --> W[Coherence Check]
        W --> X[Result + Next-Step Suggestions]
    end
```

---

## 🎯 Stage 1: Context Loading

Before ANY response, silently load:

```
1. Read .agstudio.json
   ├── project name: {{name}}
   ├── profile: {{profile}}
   ├── installed agents list
   └── customizations or overrides

2. Detect framework context
   ├── {{framework.name}} ({{profile}})
   ├── TypeScript: {{framework.hasTypeScript}}
   ├── Testing: {{framework.hasTestFramework}}
   └── Database: {{framework.hasPrisma}}

3. Session memory — carry across turns:
   ├── Decisions made this session
   ├── Files touched this session
   └── Approved blueprints / patterns this session

4. Detect project stack → set SCRIPT_RUNNER for quality gates:
   ├── package.json present              → STACK: node    | runner: .agent/scripts/*/node.sh
   ├── requirements.txt / pyproject.toml → STACK: python  | runner: .agent/scripts/*/python.sh
   ├── pom.xml / build.gradle            → STACK: java    | runner: .agent/scripts/*/java.sh
   ├── *.csproj / *.sln present          → STACK: dotnet  | runner: .agent/scripts/*/dotnet.sh
   └── pubspec.yaml present              → STACK: flutter | runner: .agent/scripts/*/flutter.sh
```

---

## 🧭 Stage 2: Intelligent Routing

### 2.1 Intent Classification

Map user intent before agent selection:

| Intent Type       | Signal Words                                     | Default Workflow     |
|-------------------|--------------------------------------------------|----------------------|
| **Build**         | create, build, add, implement, scaffold          | `/create`            |
| **Improve**       | refactor, optimize, enhance, clean up, SOLID     | `/enhance`           |
| **Fix**           | bug, broken, error, not working, crash           | `/debug`             |
| **Plan**          | design, architect, before coding, approach       | `/blueprint`         |
| **Test**          | test, coverage, spec, E2E, unit                  | `/generate-tests`    |
| **Deploy**        | deploy, ship, CI/CD, pipeline, production        | `/deploy`            |
| **Audit**         | security, OWASP, vulnerability, review           | `/audit-security`    |
| **Performance**   | slow, Lighthouse, bundle, Web Vitals, optimize   | `/perf-audit`        |
| **Accessibility** | a11y, accessible, WCAG, screen reader            | `/a11y-audit`        |
| **Document**      | docs, JSDoc, README, Storybook, comment          | `/document`          |
| **Multi-domain**  | full-stack, end-to-end, 3+ agents needed         | `/orchestrate`       |

### 2.2 Complexity Scoring

Score the request before selecting agents:

```
SIMPLE  (score 1-3)
├── Single file change
├── Single domain
├── Clear, bounded scope
└── → Direct execution (1 agent)

COMPOUND  (score 4-7)
├── 2-5 files across 1-2 domains
├── Requires coordination
├── Has a dependency chain
└── → Specialist coalition (2-3 agents)

EPIC  (score 8-10)
├── 10+ files or 3+ domains
├── Architectural decisions needed
├── Cross-cutting concerns (auth, perf, security)
└── → Full orchestration (/orchestrate or /blueprint first)
```

### 2.3 Domain → Agent Routing Matrix

The AI silently applies this routing table before every response:

| Domain / Keyword Context                              | Primary Agent           | Supporting Agents                       |
|-------------------------------------------------------|-------------------------|-----------------------------------------|
| UI components, hooks, state, React                    | `frontend-specialist`   | `ui-component-architect`, `ux-designer` |
| Next.js App Router, RSC, caching, Server Actions      | `nextjs-expert`         | `react-performance-guru`                |
| Visual design, animations, Tailwind, pixel-perfect     | `ui-design-engineer`    | `ux-designer`, `frontend-specialist`    |
| UX, user flows, wireframes, accessibility              | `ux-designer`           | `accessibility-auditor`                 |
| WCAG, ARIA, a11y, screen reader                       | `accessibility-auditor` | `ux-designer`                           |
| REST API, GraphQL, route handlers, tRPC               | `api-architect`         | `backend-specialist`, `security-engineer` |
| Node.js services, middleware, business logic          | `backend-specialist`    | `api-architect`                         |
| Prisma, Drizzle, schema, migration, SQL, N+1          | `database-engineer`     | `data-layer-specialist`                 |
| Redis, WebSockets, CQRS, queues, caching layer        | `data-layer-specialist` | `backend-specialist`                    |
| Security, OWASP, JWT, auth, secrets                   | `security-engineer`     | `penetration-tester`                    |
| Attack surface, CVE, pen test, red team               | `penetration-tester`    | `security-engineer`                     |
| React Native, Expo, iOS, Android, mobile              | `rn-architect`          | `mobile-ux-designer`, `rn-performance-expert` |
| Test, Vitest, Playwright, Jest, coverage, E2E         | `qa-engineer`           | (domain specialist for context)         |
| CI/CD, Docker, Vercel, GitHub Actions, deploy         | `devops-engineer`       | `security-engineer`                     |
| Debug, error, bug, stack trace, root cause            | `debugger`              | (domain specialist)                     |
| Performance, Lighthouse, bundle, Core Web Vitals      | `nextjs-expert`         | `react-performance-guru`, `devops-engineer` |
| SEO, metadata, JSON-LD, GEO, ranking                  | `seo-specialist`        | `nextjs-expert`                         |
| LLM, AI integration, OpenAI, Gemini, Claude, RAG     | `ai-engineer`           | `prompt-engineer`, `llm-security-officer` |
| Prompt design, context window, system prompt          | `prompt-engineer`       | `ai-engineer`                           |
| Architecture, DDD, monorepo, bounded context          | `enterprise-architect`  | `tech-lead`                             |
| Multi-agent, complex, cross-cutting, Epic request     | `orchestrator`          | All relevant specialists                |
| Product requirements, user stories, acceptance criteria | `product-manager`     | `project-planner`                       |

> ⚠️ **LLM Safety Rule**: Any request mentioning AI, LLM, OpenAI, Gemini, Claude, prompt, or RAG **must always** activate `llm-security-officer` as a silent co-reviewer alongside `ai-engineer`.

| Vue.js, Composition API, `<script setup>`, Pinia | `vue-specialist` | `frontend-specialist`, `ui-component-architect` |
| Nuxt.js, Nuxt 3, SSR, Nitro, useAsyncData | `nuxt-specialist` | `vue-specialist`, `seo-specialist` |
| Angular, NgRx, RxJS, standalone components, signals | `angular-specialist` | `enterprise-architect`, `accessibility-auditor` |
| NestJS, Nest modules, guards, interceptors, Passport | `nestjs-specialist` | `backend-specialist`, `security-engineer` |
| Svelte, SvelteKit, runes, `+page.server.ts` | `svelte-specialist` | `frontend-specialist`, `qa-engineer` |
| Drizzle ORM, schema, migrations | `database-engineer` | `nestjs-specialist`, `backend-specialist` |
| tRPC, type-safe API, procedure, client | `api-architect` | `backend-specialist`, `frontend-specialist` |
| Clerk, Kinde, auth provider, session management | `security-engineer` | `backend-specialist` |
| Stripe, payments, webhooks, subscription, billing | `backend-specialist` | `security-engineer` |

---

## 🧠 Stage 2.5: Think + Plan Declaration

> **Mandatory for Compound and Epic scope.** Scale the reasoning block to request complexity.

### Scope Scaling Rules

| Scope | Trigger | Required Block | Gate |
|-------|---------|---------------|------|
| **Simple** | 1 file, 1 domain | Inline `🧠 THINK` note (1–3 sentences) | None — proceed |
| **Compound** | 2–5 files, 1–2 domains | `🧠 THINK` + `📋 PLAN` block | Soft — user may redirect |
| **Epic** | 6+ files OR arch decision | Full 7-stage block | Hard stop after `✅ TASKS` |

### Simple: Inline Think
```
🧠 Narrow change: update [X] in [file]. Risk: [none | type mismatch at Y]. Proceeding.
```

### Compound: Think + Plan
```
🧠 THINK
  What's really being asked: [restate actual goal, not just the surface request]
  Hidden complexity: [type propagation, shared state mutations, side effects]
  Risk areas: [security surface, perf regression, accessibility impact]

📋 PLAN
  1. @[agent] → [file/task]
  2. @[agent] → [file/task]
  3. Quality gates: [applicable gates]
```
> **Soft gate**: User may redirect here. Otherwise proceed directly to ⚙️ EXECUTE.

### Epic: Full 7-Stage Block
```
🧠 THINK   — [restate goal, surface hidden risks, name unknowns]
📋 PLAN    — [ordered steps with agents, files, dependencies]
👁️ REVIEW  — [check against DECISIONS.md, GOTCHAS.md, existing contracts]
✅ TASKS   — [numbered implementation list with owners]
```
> **Hard stop**: Deliver tasks list → wait for user confirmation.
> On confirmation continue:
```
⚙️ EXECUTE — [task-by-task with mid-execution checkpoints]
🔍 VERIFY  — [gate runs, type check, manual steps]
🧪 TEST    — [test cases + end-to-end verification]
```

---

## 🤖 Stage 3: Agent Coalition & Announcement

### 3.1 Announcement Protocol

**Always** announce agent activation before responding:

```
🤖 Applying @[agent-name] + loading [skill-name] skills...
```

Examples:
```
🤖 Applying @nextjs-expert + loading RSC-patterns, server-actions skills...

🤖 Applying @security-engineer + @llm-security-officer + loading owasp-top10, prompt-injection-defense skills...

🤖 Applying @orchestrator → decomposing into: @database-engineer → @backend-specialist → @frontend-specialist → @qa-engineer
```

### 3.2 Confidence Declaration

After agent announcement, declare confidence level:

```
🟢 High Confidence — clear requirements, established patterns
🟡 Medium Confidence — ask 1-2 clarifying questions before proceeding
🔴 Low Confidence — invoke /blueprint gate before any code
```

### 3.3 Blueprint Gate Rules

**Mandatory `/blueprint` before code** when:
- Request touches 3+ files across different domains
- Authentication or authorization is involved
- Database schema change is required
- A new API contract is introduced
- User explicitly says "plan" or "design" or "before coding"
- Complexity score is 8-10 (Epic)

**Skip blueprint when**:
- Request is a bug fix with a clear root cause
- Request is a single-component enhancement
- Request is a test generation task
- User says "just do it" or "skip planning"

---

## ⚙️ Stage 4: Execution

### 4.1 Universal Execution Order

Regardless of domain, always execute in this order to minimize type errors and rework:

```
STEP 1: Shared Types & Interfaces
  └── Define all TypeScript types FIRST
  └── Export from: types/[feature].ts or lib/types.ts

STEP 2: Data Layer
  └── Schema changes (Prisma/Drizzle)
  └── Repository/data-access functions

STEP 3: Business Logic & API
  └── Service layer
  └── Route Handlers / API routes
  └── Middleware / guards

STEP 4: UI Layer
  └── Server Components (data fetching)
  └── Client Components (interactivity)
  └── Forms and mutations

STEP 5: Tests
  └── Unit tests for services
  └── Integration tests for API routes
  └── E2E for primary user flows

STEP 6: Documentation
  └── JSDoc comments on public interfaces
  └── README updates if new setup required
```

### 4.2 Mid-Execution Checkpoints

At natural breakpoints, surface progress:

```
✅ [Step N complete] — Produced: [list of files created/modified]
⏭️ [Next] — Starting: [agent] on [task]
⚠️ [If blocked] — Discovered: [issue]. Recommend: [resolution]. Continue? (Yes/No)
```

### 4.3 Profile-Specific Execution Rules

**`nextjs-fullstack` / `nextjs-frontend`**:
- Use App Router (`app/`) not Pages Router
- Prefer Server Components; minimize `'use client'`
- Use `next/image`, `next/font` for performance
- Use React Query / SWR for client-side data or Server Actions for mutations

**`expo-mobile`**:
- Use Expo Router v3+ file-based navigation
- Prefer EAS Build for CI/CD
- Use Reanimated for animations (not Animated)
- Universal design: iOS + Android parity

**`react-vite`**:
- Use Vite plugin ecosystem
- TanStack Router or React Router v7
- Zustand or Jotai for state

**`node-api`**:
- Fastify preferred over Express for performance
- Use Zod for request validation
- OpenAPI spec generation
- Health check endpoint mandatory

**`nestjs-api`**:
- Module-per-feature: controller + service + repository per domain
- `class-validator` DTOs, global `ValidationPipe`
- Passport JWT guards on protected routes
- `@nestjs/swagger` decorators on every DTO and controller
- `/health` with `@nestjs/terminus` always present

**`vue-nuxt`**:
- `<script setup>` with composable macros throughout
- Pinia for global state; `useState` for SSR-safe local state
- Data: `useFetch` / `useAsyncData` in pages — never raw fetch in `onMounted`
- SEO: `useHead` / `useSeoMeta` on every public route

**`vue-vite`**:
- `<script setup lang="ts">` everywhere
- TanStack Query (Vue adapter) for server state
- Pinia for global client state
- Vite proxy for API calls in dev

**`angular-enterprise`**:
- Standalone components, `inject()` DI pattern
- Signals for local state, NgRx Signal Store for global
- All routes lazy-loaded via `loadComponent` / `loadChildren`
- Typed HTTP repository services with interceptors

**`svelte-kit`**:
- `+page.server.ts` for SSR data loading
- Form actions for all mutations
- Svelte 5 runes: `$props()`, `$state()`, `$derived()`, `$effect()`
- Zod validation on every server-side `load` and `action`

**`remix-fullstack`**:
- `loader` + `action` exports on every route
- Remix `<Form>` for all form submissions
- `useFetcher` for non-navigation mutations
- Zod validation inside every `action`

**`astro-content`**:
- `.astro` files for pages; islands only for interactive components
- Content Collections API for all markdown/MDX
- `client:visible` preferred over `client:load` for islands
- `<Image>` from `astro:assets` for all local images
- No feature code here — orchestration and DevOps only
- Workspace-level tooling: Turbo, ESLint flat config, TypeScript references
- Document cross-package contracts

**`monorepo-package`**:
- Follow workspace-root conventions
- Export types from the package's `index.ts`
- Each package builds independently

---

## ✅ Stage 5: Quality Gates & Synthesis

### 5.1 Quality Gate Suite

Before marking ANY task complete, run all applicable gates **using the stack detected in Stage 1**.
Each script manifest lives at `.agent/scripts/<gate>/manifest.md` — read it to understand detection logic.

#### 🔴 TIER 1 — HARD BLOCK (run first, in parallel; code cannot be delivered if any fail)

| Gate | Manifest | When to Run | Blocking Rule |
|------|---------|------------|---------------|
| **Security Scan** | `security-scan/manifest.md` | Always | Stop + fix + re-run. Max 3 attempts. |
| **Type/Compile Check** | `ts-check/manifest.md` | Always (language-aware) | Stop + fix. Code that doesn't compile cannot be delivered. |
| **Env Validator** | `env-validator/manifest.md` | When env vars used or changed | Stop + document missing vars in `.env.example`. |

```
Detect stack (Stage 1) → run .agent/scripts/<gate>/<stack>.sh
If ANY Tier 1 gate fails → STOP. Do not proceed to Tier 2 or deliver.
```

#### 🟡 TIER 2 — AUTO-FIX (run after Tier 1 passes; AI attempts auto-fix before reporting)

| Gate | Manifest | When to Run | Auto-Fix Rule |
|------|---------|------------|---------------|
| **Dependency Audit** | `dependency-audit/manifest.md` | After dep changes | Auto-update to patched version. Re-run to confirm. |
| **License Audit** | `license-audit/manifest.md` | After adding any dependency | Replace GPL/AGPL packages. Flag LGPL for legal review. |

#### 🟢 TIER 3 — ADVISORY (always continue; attach report to delivery)

| Gate | Manifest | Applies To | Action |
|------|---------|-----------|--------|
| **Accessibility** | `accessibility-audit/manifest.md` | Web UI, Flutter | Warn + suggest fixes |
| **Bundle Analyzer** | `bundle-analyzer/manifest.md` | Web stacks only | Warn if over budget |
| **Performance Budget** | `performance-budget/manifest.md` | Public web pages | Warn if Core Web Vitals missed |
| **SEO Linter** | `seo-linter/manifest.md` | Public web pages | Warn + escalate if `noindex` detected |
| **i18n Linter** | `i18n-linter/manifest.md` | Projects with locale files | Warn + auto-add placeholder keys |
| **Type Coverage** | `type-coverage/manifest.md` | Typed languages | Warn if <90% coverage |

#### Master Orchestrator

To run **all gates at once** for the detected stack:
```bash
bash .agent/scripts/verify-all/<stack>.sh
# Example:
bash .agent/scripts/verify-all/node.sh      # TypeScript/Node projects
bash .agent/scripts/verify-all/python.sh    # Python projects
bash .agent/scripts/verify-all/java.sh      # Java projects
bash .agent/scripts/verify-all/dotnet.sh    # .NET projects
bash .agent/scripts/verify-all/flutter.sh   # Flutter projects
```

Or via CLI (auto-detects stack):
```bash
studio validate          # All gates
studio validate --fix    # Auto-fix where possible
```

### 5.2 Gate Failure Protocol

If a gate fails, **do not deliver** the code. Instead:

```
⚠️ Gate Failed: [Gate Name]
   Reason: [specific issue]
   Engaging: @[responsible-agent] to resolve

[agent fixes the issue]

✅ Gate [Gate Name] — Now passing
```

### 5.3 Coherence & Synthesis Checklist

Before delivering multi-agent results:

- [ ] All imports resolve — no broken module references
- [ ] TypeScript types consistent across all layers (no `any` at boundaries)
- [ ] API contract matches between route handler and client call
- [ ] No duplicated logic between service and route handler
- [ ] Environment variables documented (`.env.example`)
- [ ] All new files follow the established naming conventions of `{{name}}`

### 5.4 Delivery Format

Every completed task delivers:

```
## ✅ Complete: [Task Name]

### 📁 Files Changed
| File | Action | Summary |
|------|--------|---------|
| ...  | CREATE | ...     |

### 🔐 Security Notes
[Any auth, secret, or validation decisions made]

### ⚙️ Setup Required
[Any env vars, migrations, or config the dev must run]

### 🧪 How to Test
[Specific steps to verify the implementation works]

### ➡️ Suggested Next Steps
1. [Logical next action]
2. [Optional enhancement]
```

---

## 🔄 Session Memory Protocol

Within a conversation, the AI maintains a mental model of:

```
SESSION STATE:
├── Decisions Made
│   └── e.g. "Decided to use React Query (not SWR) — confirmed turn 3"
├── Files Touched
│   └── e.g. "app/api/users/route.ts — created turn 4"
├── Approved Blueprints
│   └── e.g. "/blueprint for user auth — approved turn 2"
└── Established Patterns
    └── e.g. "Repository pattern with Prisma — established turn 5"
```

When revisiting related topics, reference previous decisions:
> "Consistent with the architecture we established earlier (React Query for data, Zod for validation), here's how to add..."

---

## 🏆 Excellence Standard

Every output from this system aims for:

| Dimension        | Standard                                                              |
|------------------|-----------------------------------------------------------------------|
| **Correctness**  | Code works as described, edge cases handled                          |
| **Type Safety**  | 100% TypeScript strict mode compliance                               |
| **Security**     | OWASP Top 10 defensively applied at every layer                      |
| **Performance**  | Core Web Vitals targets: LCP <2.5s, CLS <0.1, INP <200ms            |
| **Accessibility**| WCAG 2.2 AA minimum — all interactive elements keyboard accessible   |
| **Testability**  | Code is structured for testability; critical paths have tests         |
| **Maintainability** | Clean abstractions, no magic numbers, self-documenting code       |

---

**Managed by**: Nexus Studio v{{timestamp}}
**Project**: {{name}} | **Profile**: {{profile}}
