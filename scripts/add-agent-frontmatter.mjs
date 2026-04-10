/**
 * One-shot script: adds YAML frontmatter headers to agent template files
 * that are missing them (consistent with the SKILL.md header pattern).
 * Run from: antigravity-studio/
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { TEMPLATES_DIR, DRY_RUN } from './config.mjs';

const agentsDir = join(TEMPLATES_DIR, '.agent', 'agents');

if (!existsSync(agentsDir)) {
  console.error(`❌ Agents directory not found at: ${agentsDir}`);
  console.error(`   Run from the monorepo root or pass --templates-dir <path>`);
  process.exit(1);
}

if (DRY_RUN) console.log('🔍 DRY RUN — no files will be written\n');

const AGENT_METADATA = {
  "accessibility-auditor": {
    description: "WCAG 2.2 AA accessibility auditor — keyboard navigation, ARIA patterns, contrast ratios, screen reader support, and inclusive design",
    activation: "accessibility audit requests, WCAG compliance checks, /a11y-audit, aria/role issues",
  },
  "ai-engineer": {
    description: "AI/LLM integration specialist for OpenAI, Anthropic, and Gemini SDKs — evaluation pipelines, RAG, and production-safe AI features. Always pairs with @llm-security-officer",
    activation: "LLM/AI feature implementation, embeddings, RAG, chatbots, AI SDK integration",
  },
  "api-architect": {
    description: "RESTful and GraphQL API design architect — contracts, versioning, OpenAPI specs, and API developer experience",
    activation: "API design, endpoint creation, OpenAPI spec, REST/GraphQL, API versioning",
  },
  "backend-specialist": {
    description: "Node.js/TypeScript backend specialist for scalable services, middleware, authentication, and server-side architecture",
    activation: "server-side logic, service layer, middleware, Node.js features, backend APIs",
  },
  "cloud-architect": {
    description: "Multi-cloud infrastructure architect for AWS, GCP, and Azure — cloud-native patterns, cost optimization, and platform selection",
    activation: "cloud deployment, infrastructure as code, multi-cloud strategy, serverless",
  },
  "data-layer-specialist": {
    description: "Data access patterns, caching strategies, real-time data, and state management specialist for high-performance data flow",
    activation: "caching, state management, data flow optimization, real-time data, SWR/React Query",
  },
  "database-engineer": {
    description: "Database schema design and query optimization specialist for Prisma ORM, Drizzle ORM, and raw SQL",
    activation: "schema design, migrations, ORM queries, database performance, indexing",
  },
  "debugger": {
    description: "Systematic debugger using 5-Why root cause analysis — diagnoses bugs with evidence and hypotheses, never guesses",
    activation: "bug reports, unexpected behavior, /debug, runtime errors, test failures",
  },
  "devops-engineer": {
    description: "CI/CD pipelines, Docker containerization, and zero-downtime deployment specialist",
    activation: "CI/CD setup, Docker, deployment pipelines, /deploy, GitHub Actions",
  },
  "enterprise-architect": {
    description: "Principal enterprise architect for SOLID principles, clean architecture, and long-term system health — translates business requirements into technical blueprints",
    activation: "architecture decisions, /blueprint, large refactors, system design, SOLID violations",
  },
  "frontend-specialist": {
    description: "React/TypeScript frontend specialist for accessible, performant, and maintainable UI components and client-side features",
    activation: "React components, hooks, client-side features, forms, UI implementation",
  },
  "mobile-ux-designer": {
    description: "Mobile UX designer for touch interactions, thumb-zone design, and platform-specific patterns in React Native / Expo apps",
    activation: "React Native UI, mobile screens, touch interactions, iOS/Android UX patterns",
  },
  "nextjs-expert": {
    description: "Next.js 15 App Router authority — React Server Components, SSR, Partial Prerendering, and high-performance full-stack architecture",
    activation: "Next.js pages, layouts, Server Components, App Router, routing, SSR/SSG",
  },
  "orchestrator": {
    description: "Master coordinator for complex multi-domain tasks spanning 3+ layers — decomposes requirements and governs multi-agent workstreams",
    activation: "complexity score ≥4, features spanning 3+ domains, /orchestrate, /blueprint, epics",
  },
  "penetration-tester": {
    description: "White-hat penetration tester — finds vulnerabilities through attacker-mindset assessment, exploitation testing, and actionable reports",
    activation: "pen testing, security assessment, /audit-security, vulnerability research",
  },
  "product-manager": {
    description: "Product manager for translating business goals into prioritized user stories with testable acceptance criteria",
    activation: "requirements gathering, user stories, feature scoping, product decisions",
  },
  "project-planner": {
    description: "Project planner for sprint decomposition, milestone tracking, and dependency mapping",
    activation: "sprint planning, task breakdown, project timelines, /orchestrate",
  },
  "qa-engineer": {
    description: "Quality assurance specialist for test strategy, test pyramid, and automated testing in TypeScript — Vitest, RTL, Playwright",
    activation: "test writing, /generate-tests, test strategy, coverage gaps, test automation",
  },
  "react-performance-guru": {
    description: "React performance specialist — rendering optimization, memoization, bundle size reduction, and Core Web Vitals improvement",
    activation: "/perf-audit, React rendering issues, slow components, bundle size, Core Web Vitals",
  },
  "rn-architect": {
    description: "React Native / Expo architect for cross-platform iOS and Android app architecture using Expo SDK and Expo Router",
    activation: "React Native app architecture, Expo Router, mobile navigation, cross-platform features",
  },
  "rn-performance-expert": {
    description: "React Native performance expert — eliminates jank, reduces memory usage, and maximizes frame rates with Flipper and Flashlight profiling",
    activation: "React Native performance issues, frame rate drops, memory leaks, bridge bottlenecks",
  },
  "security-engineer": {
    description: "Lead security engineer for Zero Trust architecture, OWASP Top 10, authentication, input validation, and defensive design",
    activation: "auth implementation, OWASP compliance, /audit-security, security hardening",
  },
  "seo-specialist": {
    description: "SEO and Core Web Vitals specialist for technical SEO, structured data, metadata, and Generative Engine Optimization",
    activation: "/perf-audit, SEO issues, meta tags, structured data, Core Web Vitals, LCP/CLS/INP",
  },
  "tech-lead": {
    description: "Tech lead combining deep technical expertise with code quality enforcement, architecture standards, and team unblocking",
    activation: "code reviews, architectural decisions, technical standards, PR reviews",
  },
  "ui-component-architect": {
    description: "Design systems expert for reusable, accessible, and themeable component libraries with shadcn/ui, Radix UI, and Tailwind CSS",
    activation: "component library, shadcn/ui, design system, Radix UI primitives, composable UI",
  },
  "ui-design-engineer": {
    description: "Lead design systems engineer bridging design and code — Tailwind CSS, Framer Motion, design tokens, and accessible UI architecture",
    activation: "design tokens, Tailwind, animations, Framer Motion, CSS architecture",
  },
  "ux-designer": {
    description: "Senior product designer bridging user needs with business goals through interaction design, user flows, and shared design tokens",
    activation: "user flow design, wireframes, interaction design, UX research, usability",
  },
};

let updated = 0;
let skipped = 0;

for (const [id, meta] of Object.entries(AGENT_METADATA)) {
  const filePath = join(agentsDir, `${id}.md`);
  const content = readFileSync(filePath, "utf8");

  if (content.startsWith("---")) {
    console.log(`⏭  Skipping ${id}.md — already has frontmatter`);
    skipped++;
    continue;
  }

  const frontmatter = [
    "---",
    `name: ${id}`,
    `description: "${meta.description}"`,
    `activation: "${meta.activation}"`,
    "---",
    "",
    "",
  ].join("\n");

  if (DRY_RUN) {
    console.log(`📝 Would add frontmatter to ${id}.md`);
  } else {
    writeFileSync(filePath, frontmatter + content, "utf8");
    console.log(`✅ Added frontmatter to ${id}.md`);
  }
  updated++;
}

console.log(`\nDone: ${updated} updated, ${skipped} already had frontmatter.`);
