/**
 * Rich agent metadata — descriptions, activation triggers, key skills, and
 * category styling for every agent in the registry.
 *
 * This is static, build-time data that enriches the lean registry.json entries
 * with human-readable context for the Agents documentation page.
 */

export interface AgentMeta {
  /** Emoji icon representing the agent's domain */
  emoji: string;
  /** Full prose description shown on the agent card */
  description: string;
  /** Comma-separated list of activation triggers (requests that invoke this agent) */
  activation: string;
  /** Key skill IDs this agent typically loads */
  skills: string[];
  /** Short capability highlights (shown as chips) */
  highlights: string[];
}

export const AGENT_META: Record<string, AgentMeta> = {
  // ── Architecture & Leadership ────────────────────────────────────────────
  "enterprise-architect": {
    emoji: "🏛️",
    description:
      "Principal architect responsible for system health, SOLID principles, and long-term codebase evolution. Translates business requirements into scalable technical blueprints with Architecture Decision Records.",
    activation: "/blueprint, architecture decisions, large refactors, system design reviews, SOLID violations",
    skills: ["clean-architecture", "solid-principles", "monorepo-turborepo"],
    highlights: ["ADR Writing", "C4 Diagrams", "Dependency Rule", "Idempotency"],
  },
  "tech-lead": {
    emoji: "👨‍💻",
    description:
      "Senior technical leader who drives delivery velocity, enforces coding standards, and owns team conventions through hands-on code review and mentorship.",
    activation: "code review requests, standards violations, team conventions, delivery planning",
    skills: ["solid-principles", "clean-architecture", "github-actions-ci-cd"],
    highlights: ["Code Review", "Standards", "Tech Debt", "Mentorship"],
  },
  "orchestrator": {
    emoji: "🎭",
    description:
      "Multi-agent coordinator that assembles the right specialist coalition for complex, cross-domain tasks — manages agent handoffs and ensures nothing falls through the cracks.",
    activation: "/orchestrate, complex features spanning multiple domains, agent coordination needed",
    skills: ["clean-architecture", "solid-principles"],
    highlights: ["Multi-Agent Flows", "Task Decomposition", "Agent Routing"],
  },
  "product-manager": {
    emoji: "📋",
    description:
      "Product strategy and user story specialist that translates business goals into well-scoped technical requirements with clear acceptance criteria and Definition of Done.",
    activation: "feature planning, user stories, PRD writing, stakeholder communication, scope definition",
    skills: ["solid-principles"],
    highlights: ["User Stories", "Acceptance Criteria", "Scoping", "Prioritization"],
  },
  "project-planner": {
    emoji: "📅",
    description:
      "Project execution specialist focused on milestone planning, dependency mapping, risk identification, and sprint ceremonies for technical delivery.",
    activation: "sprint planning, milestone decomposition, dependency analysis, timeline estimation",
    skills: ["solid-principles", "github-actions-ci-cd"],
    highlights: ["Sprint Planning", "Risk Assessment", "Milestones", "Delivery Tracking"],
  },
  "cloud-architect": {
    emoji: "☁️",
    description:
      "Cloud infrastructure specialist for AWS, Azure, and GCP deployments. Designs scalable, cost-optimized, and secure cloud architectures with Infrastructure-as-Code.",
    activation: "cloud deployments, infrastructure design, IaC, scaling strategy, cost optimization",
    skills: ["aws-deployment", "azure-deployment", "gcp-deployment", "docker-containerization"],
    highlights: ["AWS / Azure / GCP", "IaC", "Multi-Cloud", "Cost Optimization"],
  },

  // ── Frontend (Web) ────────────────────────────────────────────────────────
  "nextjs-expert": {
    emoji: "▲",
    description:
      "Next.js App Router expert specializing in RSC, streaming, server actions, parallel routes, and Vercel deployment optimizations with ISR/PPR strategies.",
    activation: "Next.js features, App Router, server components, server actions, Vercel deployment, ISR",
    skills: ["nextjs-app-router", "react-patterns", "react-performance", "vercel-deployment"],
    highlights: ["App Router", "Server Components", "Server Actions", "ISR / PPR"],
  },
  "react-performance-guru": {
    emoji: "⚡",
    description:
      "React rendering performance specialist. Diagnoses re-render cascades, optimizes code splitting, implements virtualization, and improves Core Web Vitals scores.",
    activation: "React performance issues, excessive re-renders, bundle size, memo/callback optimization",
    skills: ["react-performance", "react-patterns", "caching-strategies"],
    highlights: ["Re-render Prevention", "Code Splitting", "Virtualisation", "Core Web Vitals"],
  },
  "frontend-specialist": {
    emoji: "⚛️",
    description:
      "Full-stack React/TypeScript engineer specializing in accessible, performant UI components, custom hooks, and client-side state management patterns.",
    activation: "React components, hooks, client-side features, forms, UI implementation, TypeScript",
    skills: ["react-patterns", "tailwind-design-system", "state-management", "form-handling"],
    highlights: ["Component Architecture", "Custom Hooks", "Type-Safe Forms", "State Patterns"],
  },
  "ui-component-architect": {
    emoji: "🧱",
    description:
      "Component library architect who builds scalable, reusable UI systems using shadcn/ui, Radix UI, and design tokens with Storybook-driven development.",
    activation: "component library design, design system implementation, Radix UI, shadcn/ui, Storybook",
    skills: ["shadcn-radix-ui", "tailwind-design-system", "storybook-driven-development"],
    highlights: ["Compound Components", "Radix Primitives", "Storybook Stories", "Token-Driven"],
  },
  "vite-specialist": {
    emoji: "⚡",
    description:
      "Vite build system specialist for React and Vue SPAs — owns vite.config.ts, plugin architecture, manualChunks strategy, HMR configuration, library mode, and sub-path deployment.",
    activation: "vite.config, rollupOptions, manualChunks, import.meta.env, HMR, vite-plugin-, build.lib, chunkSizeWarning, dist/assets",
    skills: ["vite-build-system", "react-performance"],
    highlights: ["Vite Config", "Code Splitting", "Plugin Architecture", "Library Mode"],
  },
  "vue-specialist": {
    emoji: "💚",
    description:
      "Vue 3 Composition API expert — owns <script setup> components, Pinia stores, Vue Router 4, composables, and the full Vue 3 + TypeScript ecosystem.",
    activation: "Vue.js, <script setup>, Pinia, Composition API, defineProps, defineEmits, composable, useStore, vue-router, VueUse",
    skills: ["vue-patterns", "state-management", "tanstack-query"],
    highlights: ["Composition API", "Pinia Stores", "Vue Router 4", "Composables"],
  },
  "nuxt-specialist": {
    emoji: "🌿",
    description:
      "Nuxt 3 full-stack specialist — owns SSR data fetching, Nitro server routes, useAsyncData, SEO with useSeoMeta, Nuxt modules, and hybrid rendering strategies.",
    activation: "Nuxt, nuxt.config, useAsyncData, useFetch, useHead, useSeoMeta, server/api, Nitro, nuxt-link, useRuntimeConfig",
    skills: ["nuxt-patterns", "vue-patterns", "seo-core-web-vitals"],
    highlights: ["SSR / Hybrid", "Nitro Server", "useFetch / useAsyncData", "SEO"],
  },
  "angular-specialist": {
    emoji: "🔺",
    description:
      "Angular 17+ specialist — standalone components, Angular Signals, NgRx Signal Store, inject() DI, lazy routing with loadComponent, and Angular Material/CDK.",
    activation: "Angular, @Component, @Injectable, NgRx, RxJS, standalone, Signal, inject(), Angular Material, ng-content, loadComponent",
    skills: ["angular-patterns", "rxjs-patterns", "state-management"],
    highlights: ["Standalone Components", "Signals API", "NgRx Signal Store", "Lazy Routes"],
  },
  "svelte-specialist": {
    emoji: "🔥",
    description:
      "Svelte 5 and SvelteKit specialist — runes ($props, $state, $derived, $effect), +page.server.ts data loading, form actions with use:enhance, and SvelteKit auth patterns.",
    activation: "Svelte, SvelteKit, +page.svelte, +page.server.ts, $props, $state, $derived, $effect, rune, form actions",
    skills: ["svelte-patterns", "zod-validation", "vitest-unit-tests"],
    highlights: ["Svelte 5 Runes", "SvelteKit Routing", "Form Actions", "SSR Data Loading"],
  },
  "remix-specialist": {
    emoji: "💿",
    description:
      "Remix 2 specialist — loader/action pattern, nested routes, useFetcher for non-navigation mutations, progressive enhancement with <Form>, and session-based auth.",
    activation: "Remix, loader, action, useFetcher, <Form>, remix.config, @remix-run/, useLoaderData, useActionData, ErrorBoundary",
    skills: ["react-patterns", "zod-validation", "playwright-e2e"],
    highlights: ["Loader / Action", "Progressive Enhancement", "Nested Routes", "Session Auth"],
  },
  "astro-specialist": {
    emoji: "🚀",
    description:
      "Astro 4+ specialist — Content Collections with Zod schemas, island architecture with client directives, astro:assets image optimization, and SSR/SSG hybrid rendering.",
    activation: "Astro, .astro, Content Collections, astro:assets, client:load, client:visible, defineCollection, getCollection, islands",
    skills: ["seo-core-web-vitals", "accessibility-wcag", "react-patterns"],
    highlights: ["Content Collections", "Island Architecture", "Zero-JS by Default", "Astro:Assets"],
  },

  // ── UX/UI Design ─────────────────────────────────────────────────────────
  "ux-designer": {
    emoji: "🎯",
    description:
      "UX design specialist focused on user research synthesis, information architecture, interaction patterns, usability heuristics, and design reviews.",
    activation: "UX review, information architecture, user flows, interaction design, usability audit",
    skills: ["ux-fundamentals", "accessibility-wcag", "responsive-patterns"],
    highlights: ["User Flows", "IA Design", "Usability Heuristics", "Design Reviews"],
  },
  "ui-design-engineer": {
    emoji: "🎨",
    description:
      "Visual design engineer bridging design and engineering — pixel-perfect implementations using design tokens, fluid typography, semantic color systems, and responsive patterns.",
    activation: "visual design, design tokens, typography, color systems, pixel-perfect implementation",
    skills: ["design-token-architecture", "typography-system", "color-system", "dark-mode-theming"],
    highlights: ["Design Tokens", "Fluid Typography", "Semantic Colors", "Dark Mode"],
  },
  "accessibility-auditor": {
    emoji: "♿",
    description:
      "Accessibility expert ensuring WCAG 2.2 AA compliance — audits keyboard navigation, screen reader compatibility, color contrast ratios, and ARIA semantics.",
    activation: "/a11y-audit, accessibility audit, WCAG compliance, keyboard navigation, screen reader, ARIA",
    skills: ["accessibility-wcag"],
    highlights: ["WCAG 2.2 AA", "Screen Readers", "Keyboard Nav", "ARIA Semantics"],
  },
  "motion-designer": {
    emoji: "✨",
    description:
      "Animation and micro-interaction specialist using Framer Motion, GSAP ScrollTrigger, and Lottie to create performant, accessibility-respecting motion experiences.",
    activation: "/motion-audit, animations, micro-interactions, Framer Motion, GSAP, Lottie, transitions",
    skills: ["framer-motion", "gsap-animations", "lottie-animations", "micro-interactions"],
    highlights: ["Framer Motion", "GSAP ScrollTrigger", "Lottie", "Perf Budget"],
  },
  "design-system-architect": {
    emoji: "📐",
    description:
      "Design system strategist who architects scalable token systems, component libraries, and living documentation that scales across multiple teams and brands.",
    activation: "/design-system, design system creation, token architecture, multi-brand theming, component API",
    skills: ["design-token-architecture", "shadcn-radix-ui", "storybook-driven-development", "color-system"],
    highlights: ["Token Architecture", "Multi-Brand", "Component API", "Documentation"],
  },
  "creative-director": {
    emoji: "🎬",
    description:
      "Creative direction for brand identity, visual storytelling, and design language — ensures cohesive aesthetic across all digital touchpoints and marketing assets.",
    activation: "brand review, visual identity, design language, aesthetic decisions, marketing materials",
    skills: ["design-token-architecture", "color-system", "typography-system"],
    highlights: ["Brand Identity", "Visual Language", "Design Principles", "Art Direction"],
  },

  // ── Backend & API ─────────────────────────────────────────────────────────
  "backend-specialist": {
    emoji: "⚙️",
    description:
      "Node.js backend engineer specializing in REST/GraphQL APIs, middleware architecture, real-time patterns, and server-side performance optimization.",
    activation: "backend API development, Node.js, Express, middleware, server-side logic, real-time",
    skills: ["api-design-restful", "node-express-testing", "caching-strategies", "realtime-patterns"],
    highlights: ["REST APIs", "Middleware", "Real-time", "Server Performance"],
  },
  "api-architect": {
    emoji: "🔌",
    description:
      "API design strategist who defines versioning strategies, OpenAPI schemas, error contracts, rate limiting, and developer experience across all API surfaces.",
    activation: "API design, OpenAPI/Swagger, versioning, error contracts, API standards, developer portal",
    skills: ["api-design-restful", "realtime-patterns"],
    highlights: ["OpenAPI", "Versioning", "Error Contracts", "Rate Limiting"],
  },
  "database-engineer": {
    emoji: "🗄️",
    description:
      "Database design and optimization specialist for SQL, NoSQL, and graph databases — covers schema design, migrations, query optimization, and indexing strategy.",
    activation: "database schema, migrations, query optimization, Prisma, indexing, DB design, normalization",
    skills: ["prisma-orm", "caching-strategies"],
    highlights: ["Schema Design", "Query Optimization", "Migrations", "Indexing"],
  },
  "data-layer-specialist": {
    emoji: "📊",
    description:
      "Data access layer architect who designs repository patterns, caching strategies, and data transformation pipelines between the domain and infrastructure layers.",
    activation: "data layer architecture, repository pattern, ORM patterns, data caching, transformations",
    skills: ["prisma-orm", "caching-strategies", "clean-architecture"],
    highlights: ["Repository Pattern", "Cache Strategy", "Data Pipelines", "ORM Design"],
  },
  "nestjs-specialist": {
    emoji: "🐱",
    description:
      "NestJS expert — module-per-feature architecture, controllers, guards, interceptors, Prisma repository pattern, @nestjs/swagger Swagger docs, and @nestjs/terminus health checks.",
    activation: "NestJS, @Module, @Injectable, @Controller, Guard, Interceptor, Pipe, Passport, @nestjs/, nest.config, AppModule",
    skills: ["nestjs-patterns", "api-design-restful", "prisma-orm"],
    highlights: ["Module Architecture", "Guards & Interceptors", "Swagger Docs", "Health Checks"],
  },

  // ── Security ──────────────────────────────────────────────────────────────
  "security-engineer": {
    emoji: "🔐",
    description:
      "Application security specialist enforcing OWASP Top-10 mitigations, secure coding standards, authentication flows, CSP headers, and threat modeling.",
    activation: "/audit-security, security review, OWASP issues, auth flows, input validation, CSP, CORS",
    skills: ["owasp-top10", "input-validation-sanitization", "auth-nextauth"],
    highlights: ["OWASP Top 10", "Threat Modeling", "Secure Auth", "CSP / CORS"],
  },
  "penetration-tester": {
    emoji: "🎯",
    description:
      "Offensive security specialist who simulates real-world attacks — injection, XSS, CSRF, privilege escalation — to identify vulnerabilities before they reach production.",
    activation: "penetration testing, vulnerability assessment, attack simulation, red team, security audit",
    skills: ["owasp-top10", "input-validation-sanitization"],
    highlights: ["Attack Simulation", "Vuln Assessment", "Injection Testing", "Security Reports"],
  },

  // ── Mobile ────────────────────────────────────────────────────────────────
  "rn-architect": {
    emoji: "📱",
    description:
      "React Native and Expo architect designing scalable mobile application structures with file-based routing, native module integration, and cross-platform strategies.",
    activation: "React Native architecture, Expo Router, native modules, mobile navigation, deep linking",
    skills: ["expo-router-navigation", "react-patterns", "state-management"],
    highlights: ["Expo Router", "Native Modules", "Cross-Platform", "Deep Linking"],
  },
  "rn-performance-expert": {
    emoji: "🚀",
    description:
      "React Native performance specialist — optimizes render loops, JavaScript bridge communication, list virtualization, Hermes engine tuning, and app startup time.",
    activation: "React Native performance, list lag, bridge overhead, startup time, JS thread bottlenecks",
    skills: ["expo-router-navigation", "react-patterns"],
    highlights: ["Hermes Tuning", "List Virtualization", "Bridge Optimization", "Startup Time"],
  },
  "mobile-ux-designer": {
    emoji: "👆",
    description:
      "Mobile UX specialist designing touch-first, gesture-driven interfaces that follow iOS HIG and Android Material Design guidelines for native-feeling experiences.",
    activation: "mobile UX, touch interactions, gestures, mobile navigation patterns, HIG compliance, haptics",
    skills: ["ux-fundamentals", "accessibility-wcag", "responsive-patterns"],
    highlights: ["Touch Design", "Gesture Nav", "iOS HIG", "Android Material"],
  },

  // ── Quality & Ops ─────────────────────────────────────────────────────────
  "qa-engineer": {
    emoji: "✅",
    description:
      "Quality assurance engineer who writes comprehensive unit, integration, and E2E test suites. Drives TDD adoption, sets coverage standards, and designs test strategies.",
    activation: "/generate-tests, /generate-e2e, test coverage, unit tests, integration tests, TDD workflow",
    skills: ["vitest-unit-tests", "react-testing-library", "playwright-e2e", "tdd-workflow"],
    highlights: ["TDD", "Coverage Standards", "Test Strategy", "E2E Suites"],
  },
  "devops-engineer": {
    emoji: "🔧",
    description:
      "DevOps and CI/CD specialist automating deployments, configuring GitHub Actions pipelines, managing Docker containers, and enforcing infrastructure as code practices.",
    activation: "/deploy, CI/CD, GitHub Actions, Docker, deployment pipelines, infrastructure, monitoring",
    skills: ["github-actions-ci-cd", "docker-containerization", "vercel-deployment"],
    highlights: ["GitHub Actions", "Docker", "IaC", "CD Pipelines"],
  },
  "debugger": {
    emoji: "🐛",
    description:
      "Root cause analysis expert who diagnoses bugs, runtime errors, and performance regressions using systematic investigation — stack traces, bisection, and profiling.",
    activation: "/debug, bug investigation, error diagnosis, stack traces, runtime issues, regression hunting",
    skills: ["react-patterns", "node-express-testing"],
    highlights: ["Root Cause Analysis", "Stack Traces", "Profiling", "Bisection"],
  },
  "validator": {
    emoji: "🔍",
    description:
      "Quality gate orchestration specialist — runs all Tier 1/2/3 gates, coordinates drift detection between registry and installed files, and validates schema contracts across layers.",
    activation: "quality gates, validate, studio validate, drift detection, schema validation, contract verification, verify-all",
    skills: ["vitest-unit-tests", "solid-principles"],
    highlights: ["Gate Orchestration", "Drift Detection", "Contract Verification", "Schema Validation"],
  },

  // ── Marketing ─────────────────────────────────────────────────────────────
  "seo-specialist": {
    emoji: "📈",
    description:
      "Technical SEO specialist optimizing Core Web Vitals, structured data (JSON-LD), meta tags, OpenGraph, sitemap strategy, and content architecture for search visibility.",
    activation: "SEO audit, Core Web Vitals, meta tags, structured data, OpenGraph, robots.txt, sitemaps",
    skills: ["seo-core-web-vitals"],
    highlights: ["Core Web Vitals", "Structured Data", "OpenGraph", "Technical SEO"],
  },

  // ── AI & Innovation ───────────────────────────────────────────────────────
  "ai-engineer": {
    emoji: "🤖",
    description:
      "AI/ML integration engineer building production LLM-powered features using OpenAI, Anthropic, Vercel AI SDK, LangChain, and Retrieval-Augmented Generation pipelines.",
    activation: "AI features, LLM integration, OpenAI, Anthropic, RAG, embeddings, streaming AI, agents",
    skills: ["openai-sdk", "anthropic-claude-sdk", "vercel-ai-sdk", "langchain-typescript", "rag-implementation"],
    highlights: ["LLM Integration", "RAG Pipelines", "Streaming AI", "Embeddings"],
  },
  "prompt-engineer": {
    emoji: "💬",
    description:
      "Prompt design and optimization specialist who crafts, evaluates, and iterates on LLM prompts — system prompts, few-shot examples, chain-of-thought, and evaluation harnesses.",
    activation: "prompt design, prompt optimization, LLM evaluation, few-shot examples, system prompts, evals",
    skills: ["openai-sdk", "anthropic-claude-sdk", "vercel-ai-sdk"],
    highlights: ["Prompt Design", "Few-shot Learning", "CoT", "LLM Evaluation"],
  },
  "llm-security-officer": {
    emoji: "🛡️",
    description:
      "LLM security specialist guarding AI systems against prompt injection, jailbreaks, data leakage, model inversion attacks, and broader AI safety risks.",
    activation: "LLM security audit, prompt injection, jailbreak prevention, data leakage, AI safety review",
    skills: ["owasp-top10", "input-validation-sanitization"],
    highlights: ["Prompt Injection", "Jailbreak Defense", "Data Leakage", "AI Safety"],
  },
};

// ── Category styling ────────────────────────────────────────────────────────

export interface CategoryMeta {
  icon: string;
  /** Tailwind CSS class for the category accent color */
  colorClass: string;
  /** Short description of the category */
  description: string;
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  "Architecture & Leadership": {
    icon: "🏛️",
    colorClass: "text-(--color-nexus-blue)",
    description: "System design, delivery leadership, and strategic direction",
  },
  "Frontend (Web)": {
    icon: "⚛️",
    colorClass: "text-(--color-nexus-blue)",
    description: "React, Vue, Angular, Svelte, Next.js, Nuxt, Remix, Astro, and modern web UI",
  },
  "UX/UI Design": {
    icon: "🎨",
    colorClass: "text-(--color-deep-violet)",
    description: "Visual design, design systems, motion, and accessibility",
  },
  "Backend & API": {
    icon: "⚙️",
    colorClass: "text-(--color-nexus-blue)",
    description: "Node.js, NestJS, Python, Java, .NET, databases, and data layers",
  },
  "Security": {
    icon: "🔐",
    colorClass: "text-(--color-crimson)",
    description: "AppSec, OWASP, penetration testing, and threat modeling",
  },
  "Mobile": {
    icon: "📱",
    colorClass: "text-(--color-nexus-blue)",
    description: "React Native, Expo, and cross-platform mobile",
  },
  "Quality & Ops": {
    icon: "✅",
    colorClass: "text-(--color-emerald)",
    description: "Testing, CI/CD, DevOps, and reliability engineering",
  },
  "Marketing": {
    icon: "📈",
    colorClass: "text-(--color-amber)",
    description: "SEO, Core Web Vitals, and growth engineering",
  },
  "AI & Innovation": {
    icon: "🤖",
    colorClass: "text-(--color-deep-violet)",
    description: "LLM engineering, RAG, prompt design, and AI safety",
  },
};
