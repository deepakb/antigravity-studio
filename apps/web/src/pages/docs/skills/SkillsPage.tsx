import { useLoaderData } from "react-router";
import type { skillsLoader } from "./skills.loader";
import { Badge } from "@/components/ui";
import type { Skill } from "@/data/registry";
import { cn } from "@/lib/cn";

/**
 * Skills catalogue — grouped by category with descriptions, token budgets,
 * and category-level explanations.
 *
 * 🤖 @frontend-specialist + @ui-component-architect
 *    Loading: react-patterns, tailwind-design-system skills...
 */

// ── Skill descriptions ────────────────────────────────────────────────────

const SKILL_DESC: Record<string, string> = {
  // Frontend & UI
  "accessibility-wcag":        "WCAG 2.2 AA standards, ARIA semantics, keyboard navigation patterns, and screen reader compatibility guidance.",
  "nextjs-app-router":         "Next.js 15 App Router patterns — RSC, server actions, streaming, parallel routes, and ISR/PPR strategies.",
  "react-patterns":            "Modern React patterns: hooks, compound components, render props, context optimization, and composition strategies.",
  "react-performance":         "Re-render prevention, memoization, code splitting, virtualization, and React Profiler analysis techniques.",
  "shadcn-radix-ui":           "shadcn/ui component patterns, Radix UI primitives, accessibility wiring, and customization via CSS variables.",
  "tailwind-design-system":    "Tailwind v4 utility patterns, design token integration, responsive utilities, and arbitrary value strategies.",
  "state-management":          "Zustand, TanStack Query, React Router loaders, and Context API — choosing the right tool for each use case.",
  "form-handling":             "React Hook Form + Zod integration, multi-step forms, field arrays, async validation, and error UX patterns.",
  "dark-mode-theming":         "CSS variable–based theme switching, prefers-color-scheme detection, and flash-of-unstyled-content prevention.",
  "i18n-localization":         "next-intl / react-i18next setup, locale detection, pluralization, date/currency formatting, and RTL support.",
  "design-token-architecture": "Style Dictionary setup, semantic token layering (primitive → semantic → component), and multi-brand token systems.",
  "typography-system":         "Fluid typography with clamp(), type scales, variable fonts, and performance-optimized font loading strategies.",
  "color-system":              "Radix Colors integration, semantic color mapping, P3 wide-gamut support, and accessible contrast enforcement.",
  "responsive-patterns":       "Container queries, CSS Grid areas, intrinsic sizing, and modern responsive design techniques beyond breakpoints.",
  "micro-interactions":        "CSS transition choreography, feedback animations, spring physics, and reduced-motion accessibility handling.",
  "storybook-driven-development": "Storybook v8 setup, CSF3 stories, addon configuration, interaction tests, and Chromatic integration.",
  "lottie-animations":         "Lottie/dotLottie file integration, React player setup, performance optimization, and accessibility fallbacks.",
  "framer-motion":             "Framer Motion animation patterns — layout animations, shared element transitions, gestures, and AnimatePresence.",
  "gsap-animations":           "GSAP ScrollTrigger setup, timeline sequencing, pinning, scrubbing, and GPU-accelerated transform animations.",
  "angular-patterns":          "Angular 18 standalone components, signals, inject(), smart/dumb split, and Angular CLI workspace patterns.",
  "rxjs-patterns":             "RxJS operators, observable composition, error handling, higher-order observables, and unsubscription patterns.",
  "vue-patterns":              "Vue 3 Composition API, Pinia state, Vue Router 4, Nuxt layers, and performant component patterns.",
  "nuxt-patterns":             "Nuxt 3 universal rendering modes, auto-imports, Nitro server routes, composables, and the Nuxt modules ecosystem.",
  "svelte-patterns":           "Svelte 5 runes syntax, SvelteKit routing, server/client load functions, form actions, and Svelte transitions.",
  "tanstack-query":            "TanStack Query v5 — query/mutation patterns, cache invalidation, optimistic updates, infinite queries, and devtools.",
  "tanstack-router":           "TanStack Router — type-safe route definitions, search params, loaders, pending states, and code-split routes.",
  "vite-build-system":         "Vite 6 configuration, plugin authoring, code-splitting strategies, environment variables, and HMR optimisation.",
  "ui-craft":                  "UI craftsmanship patterns: component composition, visual precision, spacing rhythms, and pixel-perfect implementation.",

  // Backend & API
  "api-design-restful":        "RESTful API design: resource naming, versioning strategies, HATEOAS, OpenAPI 3.1 schema, and error contracts.",
  "node-express-testing":      "Express.js middleware architecture, request validation, error handling, and integration testing with Supertest.",
  "prisma-orm":                "Prisma schema design, migrations, relations, composite indices, raw queries, and connection pooling with PgBouncer.",
  "realtime-patterns":         "WebSocket lifecycle, Socket.io rooms, Server-Sent Events, and optimistic UI patterns for real-time data.",
  "python-fastapi-patterns":   "FastAPI dependency injection, Pydantic v2 models, async routes, background tasks, and OpenAPI generation.",
  "python-django-patterns":    "Django 5 views, ORM optimization, middleware, class-based views, Django REST Framework, and migrations.",
  "java-spring-patterns":      "Spring Boot 3 auto-configuration, Spring Data JPA, Spring Security, actuator health checks, and Testcontainers.",
  "dotnet-patterns":           ".NET 8 minimal APIs, Entity Framework Core, dependency injection, middleware pipeline, and Azure integration.",
  "flutter-patterns":          "Flutter widget composition, BLoC pattern, go_router navigation, Riverpod state, and platform channel usage.",
  "drizzle-orm":               "Drizzle ORM schema definition, type-safe queries, relations, migrations, and connection-pooling with Postgres/MySQL/SQLite.",
  "nestjs-patterns":           "NestJS modules, controllers, providers, guards, interceptors, pipes, and decorator-driven architecture patterns.",
  "trpc-patterns":             "tRPC v11 router definition, type-safe client, React Query integration, middleware, context, and Zod input validation.",
  "stripe-integration":        "Stripe Checkout, Payment Intents, webhook signature verification, subscription billing, and PCI-compliant payment flows.",

  // Architecture
  "clean-architecture":        "Dependency Rule enforcement: domain entities, use cases, interface adapters, and framework isolation patterns.",
  "solid-principles":          "SRP, OCP, LSP, ISP, DIP — practical TypeScript/Java examples with before/after refactoring comparisons.",
  "monorepo-turborepo":        "Turborepo workspace setup, task pipeline configuration, remote caching, and package boundary enforcement.",
  "zod-validation":            "Zod v3 schema design, .parse/.safeParse, discriminated unions, branded types, transforms, and end-to-end type inference.",

  // Security & Auth
  "auth-nextauth":             "NextAuth.js v5 / Auth.js configuration, OAuth providers, JWT sessions, database adapters, and route protection.",
  "owasp-top10":               "OWASP Top-10 mitigations: injection, XSS, CSRF, IDOR, security misconfiguration, and insecure deserialization.",
  "input-validation-sanitization": "Zod / Joi / class-validator schema design, sanitization pipelines, and defense-in-depth validation strategies.",
  "auth-clerk":                "Clerk authentication: Next.js / React integration, organisation management, middleware, webhooks, and JWT session verification.",

  // DevOps & Cloud
  "github-actions-ci-cd":      "GitHub Actions workflow authoring, matrix builds, reusable workflows, secrets management, and deployment jobs.",
  "docker-containerization":   "Multi-stage Dockerfiles, layer caching, non-root users, healthchecks, and Docker Compose for local dev.",
  "vercel-deployment":         "Vercel project configuration, preview deployments, environment variables, edge functions, and KV/Blob storage.",
  "aws-deployment":            "AWS CDK / Terraform patterns for ECS Fargate, Lambda, RDS, S3+CloudFront, and IAM least-privilege policies.",
  "azure-deployment":          "Azure Bicep / ARM templates for App Service, AKS, Azure SQL, and managed identity configurations.",
  "gcp-deployment":            "GCP Cloud Run, Cloud SQL, Artifact Registry, and Workload Identity Federation for CI/CD pipelines.",

  // AI & Engineering
  "openai-sdk":                "OpenAI API — chat completions, structured outputs, function calling, streaming, embeddings, and fine-tuning.",
  "anthropic-claude-sdk":      "Anthropic Claude API — messages, system prompts, vision, tool use, streaming, and safety best practices.",
  "vercel-ai-sdk":             "Vercel AI SDK — useChat/useCompletion hooks, streaming RSC, tool invocation, and multi-provider abstraction.",
  "langchain-typescript":      "LangChain.js chains, LCEL, memory, tool agents, LangSmith tracing, and RAG document loaders.",
  "rag-implementation":        "Retrieval-Augmented Generation: chunking strategies, embedding models, vector stores (Pinecone/pgvector), and re-ranking.",
  "google-gemini-sdk":         "Google Gemini API — multimodal prompts, streaming, function calling, and Vertex AI integration patterns.",

  // Performance
  "caching-strategies":        "HTTP caching headers, Redis caching patterns, in-memory LRU caches, stale-while-revalidate, and cache invalidation.",
  "performance-testing":       "k6 load testing, Lighthouse CI integration, React profiling, and database query performance benchmarking.",

  // Quality (QA)
  "vitest-unit-tests":         "Vitest configuration, describe/it/expect patterns, mocking, timers, and snapshot testing for TS/JSX code.",
  "react-testing-library":     "RTL best practices: user-event, async queries, accessibility-first selectors, and testing custom hooks.",
  "playwright-e2e":            "Playwright test authoring, page object model, API mocking, visual comparisons, and CI parallelisation.",
  "tdd-workflow":              "Red-Green-Refactor cycle, test pyramid strategy, mutation testing with Stryker, and TDD mob programming.",
  "python-testing":            "pytest fixtures, parametrize, mocking with unittest.mock, coverage, and async test patterns.",

  // UX/UI Design
  "ux-fundamentals":           "Heuristic evaluation, cognitive load reduction, information architecture, JTBD framework, and UX research synthesis.",

  // Mobile
  "expo-router-navigation":    "Expo Router v3 file-based navigation, deep links, tabs/drawers, typed routes, and universal links.",

  // Marketing & SEO
  "seo-core-web-vitals":       "LCP optimization, INP improvement, CLS prevention, structured data (JSON-LD), and Search Console integration.",

  // Contributed skills
  "angular-enterprise-standards":       "EPAM Enterprise Angular standards — module boundaries, Nx workspace rules, and code generation patterns.",
  "enterprise-testing-standards":       "Enterprise QA standards — test pyramid ratios, coverage gates, test data management, and CI quality reporting.",
  "enterprise-accessibility-standards": "Enterprise a11y standards — VPAT documentation, assistive tech testing matrix, and compliance reporting.",
};

// ── Category metadata ────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { icon: string; description: string }> = {
  "Frontend & UI":        { icon: "⚛️",  description: "React, Vue, Svelte, Vite, component libraries, animations, and design systems" },
  "Backend & API":        { icon: "⚙️",  description: "REST APIs, NestJS, Drizzle/Prisma, tRPC, Stripe, and real-time patterns" },
  "Architecture":         { icon: "🏛️",  description: "Clean architecture, SOLID principles, Zod validation, and monorepo structures" },
  "Security & Auth":      { icon: "🔐",  description: "Clerk, NextAuth, OWASP mitigations, and input validation" },
  "DevOps & Cloud":       { icon: "☁️",  description: "CI/CD pipelines, containerization, and cloud deployments" },
  "AI & Engineering":     { icon: "🤖",  description: "LLM SDKs, RAG pipelines, and AI application patterns" },
  "Performance":          { icon: "⚡",  description: "Caching, load testing, and performance profiling" },
  "Quality (QA)":         { icon: "✅",  description: "Unit, integration, and E2E testing frameworks" },
  "UX/UI Design":         { icon: "🎨",  description: "UX research, design principles, and interaction design" },
  "Mobile":               { icon: "📱",  description: "React Native, Expo, and cross-platform mobile patterns" },
  "Marketing & SEO":      { icon: "📈",  description: "Search engine optimization and Core Web Vitals" },
};

// Token budget colour thresholds
function budgetVariant(tokens: number): "success" | "warning" | "destructive" | "muted" {
  if (tokens <= 450) return "success";
  if (tokens <= 700) return "warning";
  if (tokens > 700)  return "destructive";
  return "muted";
}

export default function SkillsPage() {
  const { skills, byCategory } = useLoaderData<typeof skillsLoader>();

  return (
    <article className="w-full">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="mb-8">
        <Badge variant="muted" className="mb-4">Skill Library</Badge>
        <h1 className="mb-3 text-4xl font-bold">Expert Skills</h1>
        <p className="mb-5 text-lg text-(--color-muted)">
          {skills.length} domain knowledge packs injected as context. Each skill
          teaches your AI assistant your exact stack, patterns, and conventions —
          reducing hallucinations and improving suggestion quality.
        </p>

        {/* Token budget legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-(--color-muted)">
          <span className="font-medium text-(--color-foreground)">Token budget:</span>
          {(["success", "warning", "destructive"] as const).map((v, i) => {
            const labels = ["≤ 450 (light)", "451–700 (medium)", "> 700 (heavy)"];
            return (
              <span key={v} className="flex items-center gap-1.5">
                <Badge variant={v} className="text-[10px]">~{["350", "550", "950"][i]}t</Badge>
                <span>{labels[i]}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* ── Category sections ─────────────────────────────────────────── */}
      {Object.entries(byCategory).map(([category, categorySkills]) => {
        const catMeta = CATEGORY_META[category];
        const slugId = category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-");
        return (
          <section key={category} className="mb-12" id={slugId}>
            <div className="mb-5 flex items-center gap-3 border-b border-(--color-border) pb-4">
              <span className="text-xl" aria-hidden>{catMeta?.icon ?? "📦"}</span>
              <div className="flex-1">
                <h2 className="text-base font-semibold text-(--color-nexus-blue)">
                  {category}
                </h2>
                {catMeta?.description && (
                  <p className="mt-0.5 text-xs text-(--color-muted)">{catMeta.description}</p>
                )}
              </div>
              <Badge variant="muted">{(categorySkills as Skill[]).length}</Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {(categorySkills as Skill[]).map((skill) => {
                const desc = SKILL_DESC[skill.id];
                const budgetV = skill.tokenBudget ? budgetVariant(skill.tokenBudget) : undefined;
                return (
                  <div
                    key={skill.id}
                    className={cn(
                      "rounded-xl border border-(--color-border-subtle) bg-(--color-card) p-4 transition-colors hover:border-(--color-nexus-blue)",
                      "shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_2px_12px_rgba(0,0,0,0.35)]"
                    )}
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm leading-tight">{skill.name}</p>
                        <code className="mt-0.5 block font-mono text-[11px] text-(--color-nexus-blue)">
                          {skill.id}
                        </code>
                      </div>
                      {skill.tokenBudget && budgetV && (
                        <Badge variant={budgetV} className="shrink-0 text-[10px]">
                          ~{skill.tokenBudget}t
                        </Badge>
                      )}
                    </div>
                    {desc && (
                      <p className="text-xs text-(--color-muted) leading-relaxed">{desc}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </article>
  );
}
