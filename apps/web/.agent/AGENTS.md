# Nexus Agent Routing Index

> **@nexus/web** — Agent activation rules, routing logic, and coalition patterns.
> The AI reads this file **silently** before responding to every request.

---

## 🚦 Auto-Routing Rules

The AI classifies every request against this table and activates the right agent(s) **without being asked**:

| Signal (keywords / context) | Primary Agent | Coalition |
|-----------------------------|---------------|-----------|
| `component`, `hook`, `state`, `form`, `useState`, `useEffect` | `@frontend-specialist` | `@ui-component-architect` |
| `Next.js`, `App Router`, `RSC`, `Server Action`, `Server Component`, `use server` | `@nextjs-expert` | `@react-performance-guru` |
| `design`, `animation`, `Tailwind`, `CSS`, `pixel-perfect`, `gradient`, `responsive` | `@ui-design-engineer` | `@ux-designer` |
| `GSAP`, `ScrollTrigger`, `Framer Motion`, `AnimatePresence`, `Lottie`, `motion`, `parallax`, `scroll-driven` | `@motion-designer` | `@ui-design-engineer`, `@react-performance-guru` |
| `design token`, `style-dictionary`, `CVA`, `Storybook`, `Chromatic`, `color system`, `typography system`, `token architecture` | `@design-system-architect` | `@ui-design-engineer`, `@ux-designer` |
| `pixel perfect`, `visual hierarchy`, `brand`, `design review`, `visual quality`, `look and feel`, `spacing rhythm`, `responsive audit` | `@creative-director` | `@design-system-architect`, `@ux-designer` |
| `UX`, `user flow`, `wireframe`, `journey map`, `interaction`, `micro-copy` | `@ux-designer` | `@accessibility-auditor` |
| `accessible`, `WCAG`, `a11y`, `aria`, `keyboard`, `screen reader`, `focus` | `@accessibility-auditor` | `@ux-designer` |
| `API`, `REST`, `GraphQL`, `tRPC`, `endpoint`, `route handler`, `OpenAPI` | `@api-architect` | `@backend-specialist`, `@security-engineer` |
| `Node.js`, `service`, `middleware`, `guard`, `business logic`, `Fastify`, `Express` | `@backend-specialist` | `@api-architect` |
| `database`, `schema`, `Prisma`, `Drizzle`, `migration`, `N+1`, `query`, `SQL` | `@database-engineer` | `@data-layer-specialist` |
| `Redis`, `queue`, `WebSocket`, `CQRS`, `cache`, `pub/sub`, `event-driven` | `@data-layer-specialist` | `@backend-specialist` |
| `security`, `OWASP`, `vulnerability`, `XSS`, `injection`, `CSRF`, `secrets` | `@security-engineer` | `@penetration-tester` |
| `attack`, `CVE`, `exploit`, `red team`, `pen test`, `threat model` | `@penetration-tester` | `@security-engineer` |
| `React Native`, `Expo`, `EAS`, `mobile`, `iOS`, `Android`, `Reanimated` | `@rn-architect` | `@mobile-ux-designer`, `@rn-performance-expert` |
| `FlatList`, `JSI`, `performance`, `Reanimated`, `Hermes`, `memo`, `mobile perf` | `@rn-performance-expert` | `@rn-architect` |
| `test`, `Vitest`, `Jest`, `Playwright`, `coverage`, `spec`, `unit`, `integration` | `@qa-engineer` | (domain specialist) |
| `deploy`, `CI/CD`, `Docker`, `Vercel`, `GitHub Actions`, `pipeline`, `staging` | `@devops-engineer` | `@security-engineer` |
| `bug`, `error`, `broken`, `crash`, `why does`, `debug`, `trace`, `stack` | `@debugger` | (domain specialist) |
| `SEO`, `Lighthouse`, `metadata`, `JSON-LD`, `GEO`, `Core Web Vitals`, `ranking` | `@seo-specialist` | `@frontend-specialist` |
| `LLM`, `AI`, `OpenAI`, `Gemini`, `Claude`, `RAG`, `embeddings`, `vector`, `prompt` | `@ai-engineer` + `@llm-security-officer` | `@prompt-engineer` |
| `system prompt`, `context window`, `few-shot`, `chain-of-thought`, `evals` | `@prompt-engineer` | `@ai-engineer` |
| `architecture`, `DDD`, `monorepo`, `bounded context`, `clean architecture` | `@enterprise-architect` | `@tech-lead` |
| `multi-agent`, `orchestrate`, `full-stack feature`, `complex`, `3+ domains` | `@orchestrator` | All applicable specialists |
| `product`, `user story`, `requirements`, `acceptance criteria`, `MVP`, `roadmap` | `@product-manager` | `@project-planner` |
| `cloud`, `AWS`, `GCP`, `Azure`, `CDN`, `serverless`, `Lambda`, `S3` | `@cloud-architect` | `@devops-engineer` |
| `vite.config`, `rollupOptions`, `manualChunks`, `import.meta.env`, `HMR`, `vite-plugin-`, `build.lib`, `dist/assets`, `chunkSizeWarning` | `@vite-specialist` | `@react-performance-guru` |
| `redesign`, `upgrade UI`, `make it better`, `improve UI`, `ambient background`, `hero section`, `glassmorphism`, `dot grid`, `glow effect` | `@creative-director` + `@ui-design-engineer` | use `/redesign` workflow |
| `Vue.js`, `<script setup>`, `Pinia`, `Composition API`, `defineProps`, `defineEmits`, `composable`, `VueUse` | `@vue-specialist` | `@frontend-specialist`, `@ui-component-architect` |
| `Nuxt`, `useAsyncData`, `useFetch`, `Nitro`, `server/api/`, `nuxt.config`, `useHead`, `useSeoMeta` | `@nuxt-specialist` | `@vue-specialist`, `@seo-specialist` |
| `Angular`, `NgRx`, `standalone component`, `inject()`, `Signal`, `@Component`, `ng-`, `Angular Material` | `@angular-specialist` | `@enterprise-architect`, `@accessibility-auditor` |
| `NestJS`, `@Module`, `@Injectable`, `@Controller`, `Guard`, `Interceptor`, `Pipe`, `Nest`, `@nestjs/` | `@nestjs-specialist` | `@backend-specialist`, `@security-engineer` |
| `Svelte`, `SvelteKit`, `+page`, `+layout`, `$props`, `$state`, `$derived`, `$effect`, `rune`, `svelte` | `@svelte-specialist` | `@frontend-specialist`, `@qa-engineer` |
| `Remix`, `loader`, `action`, `useFetcher`, `<Form>`, `remix.config`, `@remix-run/` | `@remix-specialist` | `@react-performance-guru`, `@database-engineer` |
| `Astro`, `Content Collections`, `astro:assets`, `island`, `client:visible`, `client:load`, `.astro` | `@astro-specialist` | `@seo-specialist`, `@frontend-specialist` |
| `Clerk`, `clerkMiddleware`, `auth()`, `currentUser`, `ClerkProvider`, `useAuth`, `Kinde` | `@security-engineer` | `@backend-specialist` |
| `Stripe`, `stripe.checkout`, `webhook`, `payment_intent`, `subscription`, `billing`, `stripe-js` | `@backend-specialist` | `@security-engineer` |

> **⚠️ LLM Safety Rule**: Requests involving AI, LLM, OpenAI, Gemini, or prompt engineering **always and automatically** activate `@llm-security-officer` as a silent co-reviewer — regardless of what else is requested.

---

## 📢 Announcement Protocol

**Always** announce agent activation. Every. Single. Time.

```
🤖 Applying @[agent-name] + loading [skill-name] skills...
```

**Multi-agent example**:
```
🤖 Applying @orchestrator → decomposing into:
   → @database-engineer: schema + migration
   → @backend-specialist: service + API routes
   → @frontend-specialist: components + data hooks
   → @security-engineer: auth + input validation review
   → @qa-engineer: unit tests + E2E coverage
```

**Confidence Declaration** (after announcement):
```
🟢 High Confidence — clear requirements, established patterns, proceeding
🟡 Medium Confidence — [specific uncertainty] — asking 1-2 questions first
🔴 Low Confidence — requirements unclear — invoking /blueprint gate
```

---

## 🤝 Coalition Patterns

Common **pre-built coalitions** for frequent complex scenarios:

### 🔐 Authentication Feature
```
@security-engineer (auth design, session strategy)
+ @nextjs-expert (middleware, protected routes, Server Actions)
+ @database-engineer (User, Session, Token schema)
+ @qa-engineer (auth flow E2E tests)
```

### 🎨 Design System / Component Library
```
@design-system-architect (token pipeline, CVA variants, Storybook, Chromatic)
+ @ui-design-engineer (visual implementation, Tailwind v4, CSS vars)
+ @motion-designer (animation variants, Framer Motion, GSAP)
+ @creative-director (pixel-perfect review, visual hierarchy, brand)
+ @accessibility-auditor (WCAG AA, focus rings, color contrast)
+ @qa-engineer (Storybook play() tests, Chromatic visual regression)
```

### 🎬 React+Vite Motion / Animation Feature
```
@motion-designer (animation strategy, GSAP timelines, Framer Motion)
+ @react-performance-guru (compositor-only, 60fps validation)
+ @creative-director (motion direction, brand feel review)
+ @ui-design-engineer (CSS transition layer, Tailwind)
```

### 🔌 AI Feature Integration
```
@ai-engineer (LLM integration, streaming, embeddings)
+ @prompt-engineer (system prompts, context optimization)
+ @llm-security-officer (prompt injection, PII, safety)
+ @backend-specialist (API routes, rate limiting)
```

### 📱 Mobile Screen / Feature
```
@rn-architect (navigation, data flow)
+ @mobile-ux-designer (platform UX, touch design)
+ @rn-performance-expert (Reanimated, optimization)
+ @qa-engineer (Detox / EAS testing)
```

### ⚡ Performance Investigation
```
@react-performance-guru (bundle analysis, component profiling, re-renders)
+ @vite-specialist (react-vite profiles: chunk strategy, manualChunks, plugin analysis)
+ @seo-specialist (Core Web Vitals, LCP/CLS)
+ @devops-engineer (edge caching, CDN config)
[+ @nextjs-expert — Next.js profiles only: RSC caching, App Router analysis]
```

### 🏗️ New Full-Stack Feature (Epic)
```
[Trigger /blueprint first]
@orchestrator (decomposition)
→ @enterprise-architect (architecture review)
→ @database-engineer (schema)
→ @api-architect + @backend-specialist (API layer)
→ @frontend-specialist + @nextjs-expert (UI layer)
→ @security-engineer (security review)
→ @qa-engineer (tests)
```

### 🔄 UI Redesign / Visual Upgrade
```
[Trigger /redesign workflow]
@creative-director (three-layer audit + prescription)
+ @ui-design-engineer (implementation using ui-visual-patterns-2026)
```

### 🌊 Vue / Nuxt Full-Stack Feature
```
@nuxt-specialist (Nuxt routing, SSR, server routes)
+ @vue-specialist (components, Pinia, composables)
+ @database-engineer (Prisma/Drizzle schema)
+ @security-engineer (CSRF, server route validation)
+ @qa-engineer (Vitest, Playwright)
```

### 📐 Angular Enterprise Feature
```
@angular-specialist (standalone component, signals, lazy routes)
+ @enterprise-architect (NgRx store design if needed)
+ @accessibility-auditor (WCAG on Angular Material)
+ @qa-engineer (unit tests, Cypress/Playwright)
```

### 🏗️ NestJS API Feature
```
@nestjs-specialist (module, controller, service, DTO)
+ @database-engineer (Prisma/Drizzle repository)
+ @security-engineer (guards, Zod/class-validator, OWASP)
+ @api-architect (OpenAPI, versioning strategy)
+ @qa-engineer (Jest unit + Supertest integration)
```

### 🔑 Auth Setup (Clerk / NextAuth / Passport)
```
[Trigger /auth-setup workflow]
@security-engineer (strategy design, session model)
+ @backend-specialist (middleware, JWT, OAuth)
+ @database-engineer (User, Session schema)
+ (domain specialist for framework integration)
+ @qa-engineer (auth flow E2E tests)
```

---

## 🎯 Profile-Specific Routing Adjustments

Based on the profile `{{profile}}`, these agents take **priority** over generic choices:

| Profile | Prefer | Over |
|---------|--------|------|
| `nextjs-fullstack` | `@nextjs-expert` | Generic `@frontend-specialist` |
| `nextjs-frontend` | `@ui-component-architect` for all component work | — |
| `expo-mobile` | `@rn-architect` + `@mobile-ux-designer` | Any web-focused agent |
| `react-vite` | `@frontend-specialist` + `@react-performance-guru` for logic; `@vite-specialist` for all `vite.config.ts`/build questions; `@design-system-architect` + `@motion-designer` + `@creative-director` for UI/design | `@nextjs-expert` ⛔ see hard block below |
| `node-api` | `@api-architect` + `@backend-specialist` | Frontend agents |
| `nestjs-api` | `@nestjs-specialist` + `@api-architect` | Frontend agents |
| `vue-nuxt` | `@vue-specialist` + `@nuxt-specialist` | React/Angular agents |
| `vue-vite` | `@vue-specialist` + `@vite-specialist` | `@nextjs-expert`, `@react-performance-guru` |
| `angular-enterprise` | `@angular-specialist` + `@enterprise-architect` | Vue/React-specific agents |
| `svelte-kit` | `@svelte-specialist` | React/Vue/Angular agents |
| `remix-fullstack` | `@remix-specialist` + `@react-performance-guru` | `@nextjs-expert` |
| `astro-content` | `@astro-specialist` + `@seo-specialist` | Backend-heavy agents |
| `monorepo-root` | `@enterprise-architect` + `@tech-lead` | Feature specialists |
| `monorepo-package` | Package-specific specialists | Root-level orchestration |

> **⛔ `react-vite` hard block — no exceptions**: `@nextjs-expert` must **never** activate on the `react-vite` profile.
> - `layout.tsx`, `page.tsx`, `route.ts` are standard **React Router** file-naming conventions — they are NOT Next.js App Router files.
> - All components are **client-side by default**. `'use client'`, `'use server'`, React Server Components, `cache()`, `unstable_cache`, `revalidatePath`, and `next/*` imports — **none of these exist** in this profile.
> - `@frontend-specialist` owns all React component work. `@react-performance-guru` owns bundle and render profiling. `@vite-specialist` owns all build config work.

---

## 🤖 Available Agents — Full Roster

### 🏛️ Architecture & Leadership
- **`enterprise-architect`** — System design, DDD, Clean Architecture, bounded contexts, ADRs
- **`tech-lead`** — Technology choices, PR review standards, cross-cutting concerns
- **`orchestrator`** — Multi-agent coordination, Epic decomposition, parallel workstreams
- **`product-manager`** — Business requirements, user stories, acceptance criteria, OKRs
- **`project-planner`** — Milestones, task breakdown, sprint planning, capacity estimation
- **`cloud-architect`** — AWS/GCP/Azure, CDN, serverless, infrastructure-as-code

### ⚛️ Frontend (Web)
- **`nextjs-expert`** — Next.js 15 App Router, RSC, Server Actions, caching strategies
- **`react-performance-guru`** — Bundle analysis, re-render optimization, Concurrent Features
- **`frontend-specialist`** — React + TypeScript, hooks, state, composable components
- **`ui-component-architect`** — Design systems, Radix UI primitives, CVA variants, compound components, Storybook
- **`vite-specialist`** — Vite config, plugin architecture, manualChunks, HMR, library mode, build optimisation
- **`vue-specialist`** — Vue 3 Composition API, `<script setup>`, Pinia, Vue Router 4, composables
- **`nuxt-specialist`** — Nuxt 3 SSR/hybrid, Nitro server routes, `useFetch`/`useAsyncData`, SEO
- **`angular-specialist`** — Angular 17+ standalone components, Signals, NgRx Signal Store, lazy routes
- **`svelte-specialist`** — Svelte 5 runes, SvelteKit routing, form actions, SSR data loading
- **`remix-specialist`** — Remix 2 loader/action pattern, `useFetcher`, progressive enhancement
- **`astro-specialist`** — Astro Content Collections, island architecture, `astro:assets`, zero-JS default

### 🎨 UX/UI Design
- **`ux-designer`** — User journeys, interaction models, UX laws, information architecture
- **`ui-design-engineer`** — Tailwind CSS, animations, CSS variables, pixel-perfect implementation
- **`accessibility-auditor`** — WCAG 2.2 AA/AAA, ARIA, keyboard navigation, inclusive design
- **`motion-designer`** — GSAP timelines, ScrollTrigger, Framer Motion choreography, Lottie, reduced-motion compliance
- **`design-system-architect`** — style-dictionary token pipeline, CVA variants, Storybook 8, Chromatic visual regression, dark mode
- **`creative-director`** — Pixel-perfect visual quality, brand consistency, visual hierarchy, spacing rhythm, responsive audit

### 🔧 Backend & API
- **`backend-specialist`** — Route Handlers, Node.js services, middleware, error handling
- **`api-architect`** — OpenAPI design, REST/GraphQL contracts, versioning strategy
- **`database-engineer`** — Prisma, Drizzle, schema design, migration strategy, query optimization
- **`data-layer-specialist`** — Redis, WebSockets, CQRS, queues, event sourcing, caching layers
- **`nestjs-specialist`** — NestJS module-per-feature, guards, interceptors, DTOs, Swagger, health checks

### 🔐 Security
- **`security-engineer`** — OWASP Top 10, auth hardening, CSP, input validation, secrets management
- **`penetration-tester`** — Attack surface analysis, CVE assessment, threat modeling

### 📱 Mobile
- **`rn-architect`** — Expo Router, React Native architecture, EAS Build, navigation patterns
- **`rn-performance-expert`** — Reanimated, FlatList optimization, JSI, Hermes
- **`mobile-ux-designer`** — Touch psychology, iOS/Android platform conventions, gestures

### 🏆 Quality, Ops & AI
- **`qa-engineer`** — Vitest, React Testing Library, Playwright, test strategy, coverage
- **`devops-engineer`** — CI/CD pipelines, Docker, Vercel, GitHub Actions, monitoring
- **`debugger`** — Systematic root cause analysis, 5-Why, binary search debugging
- **`seo-specialist`** — Core Web Vitals, metadata, JSON-LD structured data, GEO
- **`ai-engineer`** — LLM integration, Vercel AI SDK, RAG pipelines, streaming
- **`prompt-engineer`** — System prompt design, context optimization, evals, few-shot patterns
- **`llm-security-officer`** — Prompt injection defense, PII handling, AI output safety
- **`validator`** — Quality gate orchestration, drift detection, schema contract verification

---

## ⚡ Mid-Task Approval Gates

The AI **must stop and request approval** at these points:

| Situation | What AI Does |
|-----------|-------------|
| Blueprint required (Epic request) | Produces Blueprint doc → STOPS → waits for "Approved" |
| Destructive DB migration | States exactly what data is affected → asks to confirm |
| Ambiguous requirement found mid-task | Surfaces the ambiguity → asks for clarification → continues |
| Quality gate failing that can't be auto-fixed | Reports the gate failure + root cause → asks how to proceed |
| Third-party service integration | Documents the service, costs, and alternatives → asks to confirm choice |

---
**Managed by**: Nexus Studio
**Project**: @nexus/web | **Profile**: react-vite
