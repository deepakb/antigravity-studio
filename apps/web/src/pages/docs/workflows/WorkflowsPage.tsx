import { CodeBlock } from "@/components/docs/CodeBlock";
import { Badge } from "@/components/ui";
import { getSlashCommands } from "@/data/registry";
import { AGENT_META } from "@/data/agent-meta";

/**
 * Workflows — slash command reference with agent activations, categories, and examples.
 *
 * 🤖 @frontend-specialist
 *    Loading: react-patterns skill...
 */

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "destructive" | "muted";

interface SlashMeta {
  description: string;
  agents: string[];
  category: string;
  categoryVariant: BadgeVariant;
  example?: string;
}

const SLASH_META: Record<string, SlashMeta> = {
  "/blueprint": {
    description: "Scaffold a new feature end-to-end — component, API route, types, tests, and documentation in one coordinated pass.",
    agents: ["enterprise-architect", "frontend-specialist", "qa-engineer"],
    category: "Scaffolding",
    categoryVariant: "default",
    example: "/blueprint Create a user profile page with avatar upload and edit modal",
  },
  "/create": {
    description: "Generate a new component, hook, utility function, or API endpoint following your stack's patterns and conventions.",
    agents: ["frontend-specialist", "ui-component-architect", "backend-specialist"],
    category: "Scaffolding",
    categoryVariant: "default",
    example: "/create A reusable DataTable component with sorting, filtering, and pagination",
  },
  "/enhance": {
    description: "Improve an existing piece of code — boost performance, readability, test coverage, or conformance to team conventions.",
    agents: ["react-performance-guru", "qa-engineer", "frontend-specialist"],
    category: "Code Quality",
    categoryVariant: "secondary",
    example: "/enhance The UserList component — it re-renders on every keystroke",
  },
  "/debug": {
    description: "Diagnose a bug or error with full stack investigation — root cause analysis, reproduction steps, and a targeted fix.",
    agents: ["debugger", "backend-specialist"],
    category: "Debugging",
    categoryVariant: "warning",
    example: "/debug TypeError: Cannot read properties of undefined reading 'map' in ProductGrid",
  },
  "/audit-security": {
    description: "Run a security audit against OWASP Top-10 attack classes, insecure dependencies, and custom security rules.",
    agents: ["security-engineer", "penetration-tester"],
    category: "Security",
    categoryVariant: "destructive",
    example: "/audit-security Review the authentication flow and API rate limiting",
  },
  "/refactor-solid": {
    description: "Refactor code to follow SOLID principles and clean architecture patterns — reduces coupling and improves testability.",
    agents: ["enterprise-architect", "tech-lead"],
    category: "Code Quality",
    categoryVariant: "secondary",
    example: "/refactor-solid The OrderService class — it violates SRP and OCP",
  },
  "/generate-tests": {
    description: "Write comprehensive unit and integration tests for a function, component, hook, or service with high coverage.",
    agents: ["qa-engineer"],
    category: "Testing",
    categoryVariant: "success",
    example: "/generate-tests The useCartStore hook — all state transitions and edge cases",
  },
  "/generate-e2e": {
    description: "Write end-to-end tests using Playwright covering critical user journeys from UI through to data persistence.",
    agents: ["qa-engineer"],
    category: "Testing",
    categoryVariant: "success",
    example: "/generate-e2e The checkout flow — add to cart, payment, and confirmation",
  },
  "/deploy": {
    description: "Generate deployment scripts, CI/CD pipeline configuration, and infrastructure-as-code for your target platform.",
    agents: ["devops-engineer", "cloud-architect"],
    category: "DevOps",
    categoryVariant: "muted",
    example: "/deploy Configure GitHub Actions for staging and production on Vercel",
  },
  "/perf-audit": {
    description: "Audit performance: bundle size analysis, React render profiling, Core Web Vitals, and server response times.",
    agents: ["react-performance-guru", "seo-specialist"],
    category: "Performance",
    categoryVariant: "warning",
    example: "/perf-audit The dashboard page loads slowly — LCP > 3s",
  },
  "/a11y-audit": {
    description: "Audit accessibility against WCAG 2.2 AA standards — keyboard navigation, ARIA semantics, contrast ratios, and screen reader compatibility.",
    agents: ["accessibility-auditor", "ux-designer"],
    category: "Accessibility",
    categoryVariant: "secondary",
    example: "/a11y-audit The data table component — keyboard navigation and announcements",
  },
  "/document": {
    description: "Generate comprehensive documentation from code — JSDoc, README, ADR, API docs, or Storybook stories.",
    agents: ["tech-lead", "enterprise-architect"],
    category: "Documentation",
    categoryVariant: "muted",
    example: "/document Generate API documentation for the /api/users endpoints",
  },
  "/orchestrate": {
    description: "Coordinate a complex multi-agent workflow for a large feature — the orchestrator agent assembles the right specialists.",
    agents: ["orchestrator"],
    category: "Orchestration",
    categoryVariant: "default",
    example: "/orchestrate Build the full authentication system — JWT, refresh tokens, OAuth, and account management",
  },
  "/preview": {
    description: "Validate the running dev server against expected routes, component contracts, and UI states before committing to full implementation.",
    agents: ["qa-engineer", "frontend-specialist"],
    category: "Testing",
    categoryVariant: "success",
    example: "/preview Verify the dashboard route renders correctly with mock data and responsive breakpoints",
  },
  "/status": {
    description: "Show current project health: installed agents, skill versions, quality gate results, and any pending upstream updates.",
    agents: [],
    category: "Diagnostics",
    categoryVariant: "muted",
  },
  "/design-system": {
    description: "Run the full design system workflow — audit tokens, enforce naming conventions, generate documentation, and validate Storybook.",
    agents: ["design-system-architect", "ui-design-engineer", "motion-designer"],
    category: "Design",
    categoryVariant: "secondary",
    example: "/design-system Migrate from hardcoded hex values to semantic CSS tokens",
  },
  "/motion-audit": {
    description: "Audit all animations for performance (frame budget), accessibility (prefers-reduced-motion), and design consistency.",
    agents: ["motion-designer", "accessibility-auditor"],
    category: "Design",
    categoryVariant: "secondary",
    example: "/motion-audit Review the page transition animations for performance and accessibility",
  },
  "/chromatic": {
    description: "Run the Chromatic visual regression testing workflow — capture story snapshots and compare against approved baselines.",
    agents: ["qa-engineer", "ui-component-architect"],
    category: "Testing",
    categoryVariant: "success",
    example: "/chromatic Run visual regression tests after the Button component redesign",
  },
  "/redesign": {
    description: "Trigger a three-layer visual audit — brand identity, interaction design, and pixel-perfect implementation — then apply the full /redesign workflow.",
    agents: ["creative-director", "ui-design-engineer"],
    category: "Design",
    categoryVariant: "secondary",
    example: "/redesign The hero section — apply the new brand gradient and glassmorphism surface",
  },
  "/scaffold": {
    description: "Generate a complete, production-ready feature scaffold in one pass — types, data layer, API, UI, tests, and barrel exports in dependency order.",
    agents: ["orchestrator", "frontend-specialist", "qa-engineer"],
    category: "Architecture",
    categoryVariant: "default",
    example: "/scaffold A user profile page with avatar upload, edit modal, and optimistic UI",
  },
  "/ship": {
    description: "Run the full pre-flight checklist before merging to main — type check, lint, tests, security audit, bundle budget, and staged deployment.",
    agents: ["devops-engineer", "qa-engineer", "security-engineer"],
    category: "DevOps",
    categoryVariant: "muted",
    example: "/ship Validate the checkout feature branch before merging to main",
  },
  "/data-model": {
    description: "Design or review a database schema — entity relationships, normalisation, index strategy, migration plan, and Prisma/Drizzle model generation.",
    agents: ["database-engineer", "enterprise-architect"],
    category: "Architecture",
    categoryVariant: "default",
    example: "/data-model Design the schema for a multi-tenant SaaS with organisations and billing",
  },
  "/api-design": {
    description: "Define or review an API contract — OpenAPI schema, versioning strategy, error codes, rate limiting, and developer experience guidelines.",
    agents: ["api-architect", "backend-specialist"],
    category: "Architecture",
    categoryVariant: "default",
    example: "/api-design Design the REST API for the notifications service with pagination and webhooks",
  },
  "/auth-setup": {
    description: "Wire end-to-end authentication — provider selection (Clerk, NextAuth, Passport), session strategy, protected routes, and RBAC scaffolding.",
    agents: ["security-engineer", "backend-specialist", "database-engineer"],
    category: "Security",
    categoryVariant: "destructive",
    example: "/auth-setup Add Clerk authentication with organisation-level roles and protected API routes",
  },
};

// ── Category order for display ────────────────────────────────────────────

const CATEGORY_ORDER = [
  "Scaffolding",
  "Architecture",
  "Code Quality",
  "Testing",
  "Security",
  "Debugging",
  "Performance",
  "Accessibility",
  "Design",
  "DevOps",
  "Documentation",
  "Orchestration",
  "Diagnostics",
];

export default function WorkflowsPage() {
  const commands = getSlashCommands();

  // Group commands by category
  const byCategory: Record<string, string[]> = {};
  for (const cmd of commands) {
    const meta = SLASH_META[cmd];
    const cat = meta?.category ?? "Other";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(cmd);
  }

  // Sort categories by canonical order
  const orderedCategories = [
    ...CATEGORY_ORDER.filter((c) => byCategory[c]),
    ...Object.keys(byCategory).filter((c) => !CATEGORY_ORDER.includes(c)),
  ];

  return (
    <article className="mx-auto max-w-3xl">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="mb-10">
        <Badge variant="muted" className="mb-4">Workflows</Badge>
        <h1 className="mb-3 text-4xl font-bold">Workflows & Slash Commands</h1>
        <p className="text-lg text-(--color-muted)">
          {commands.length} slash commands that trigger coordinated multi-agent workflows.
          Type them directly in your AI assistant's chat — agents are assembled automatically
          based on the task.
        </p>
      </div>

      {/* ── Usage ────────────────────────────────────────────────────── */}
      <section className="mb-12" id="usage">
        <h2 className="mb-4 text-xl font-semibold">Usage</h2>
        <p className="mb-4 text-(--color-muted)">
          Slash commands work in GitHub Copilot Chat, Cursor, Windsurf, and Claude Code.
          Each command assembles the right coalition of specialist agents automatically.
        </p>

        {/* IDE compatibility */}
        <div className="mb-6 grid gap-2 sm:grid-cols-2">
          {IDE_COMPAT.map((ide) => (
            <div
              key={ide.name}
              className="flex items-center gap-3 rounded-lg border border-(--color-border-subtle) bg-(--color-surface) px-4 py-3"
            >
              <span className="text-xl">{ide.icon}</span>
              <div>
                <p className="text-sm font-medium">{ide.name}</p>
                <p className="text-xs text-(--color-muted)">{ide.invocation}</p>
              </div>
            </div>
          ))}
        </div>

        <CodeBlock
          code={`# Scaffold a complete feature with tests and docs
/blueprint Create a user profile page with avatar upload

# Generate unit tests for a specific component
/generate-tests UserProfileCard

# Run security and accessibility audits
/audit-security
/a11y-audit

# Multi-agent orchestration for complex tasks
/orchestrate Build the full authentication system with OAuth`}
          lang="bash"
        />
      </section>

      {/* ── Commands by category ──────────────────────────────────────── */}
      {orderedCategories.map((category) => {
        const catCommands = byCategory[category] ?? [];
        const firstMeta = SLASH_META[catCommands[0]];
        return (
          <section
            key={category}
            className="mb-10"
            id={category.toLowerCase().replace(/\s+/g, "-")}
          >
            <div className="mb-4 flex items-center gap-3 border-b border-(--color-border) pb-3">
              <h2 className="text-base font-semibold">{category}</h2>
              {firstMeta && (
                <Badge variant={firstMeta.categoryVariant} className="text-[10px]">
                  {catCommands.length} command{catCommands.length !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>

            <div className="space-y-3">
              {catCommands.map((cmd) => {
                const meta = SLASH_META[cmd];
                return (
                  <div
                    key={cmd}
                    className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4 transition-colors hover:bg-(--color-surface-raised)"
                  >
                    {/* Command + description */}
                    <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
                      <code className="shrink-0 font-mono text-sm font-semibold text-(--color-nexus-blue)">
                        {cmd}
                      </code>
                      <span className="text-sm text-(--color-muted)">
                        {meta?.description ?? "Workflow command"}
                      </span>
                    </div>

                    {/* Agent coalition */}
                    {meta?.agents && meta.agents.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {meta.agents.map((agentId) => {
                          const agentMeta = AGENT_META[agentId];
                          return (
                            <span
                              key={agentId}
                              title={agentMeta?.description}
                              className="flex items-center gap-1 rounded-full border border-(--color-border) bg-(--color-surface-raised) px-2 py-0.5 text-[11px] text-(--color-muted)"
                            >
                              {agentMeta?.emoji && (
                                <span className="text-xs">{agentMeta.emoji}</span>
                              )}
                              <code className="font-mono">@{agentId}</code>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Example usage */}
                    {meta?.example && (
                      <div className="rounded-lg bg-(--color-surface-raised) px-3 py-2">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-(--color-muted)">
                          Example
                        </p>
                        <code className="font-mono text-xs text-(--color-nexus-blue)">
                          {meta.example}
                        </code>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* ── Creating custom commands ──────────────────────────────────── */}
      <section id="custom-commands">
        <h2 className="mb-4 text-xl font-semibold">Custom Slash Commands</h2>
        <p className="mb-4 text-(--color-muted)">
          Define your own slash commands in{" "}
          <code className="rounded bg-(--color-surface-raised) px-1 font-mono text-sm text-(--color-nexus-blue)">
            .agent/workflows/
          </code>. Each workflow file specifies the agents to invoke, the task template, and any required context.
        </p>
        <CodeBlock
          code={`# .agent/workflows/review-pr.md
name: /review-pr
description: "Full PR review — security, performance, tests, and code quality"
agents:
  - security-engineer
  - react-performance-guru
  - qa-engineer
  - tech-lead
template: |
  Review the following diff for:
  1. Security vulnerabilities (OWASP Top-10)
  2. Performance regressions
  3. Missing test coverage
  4. Code quality and convention violations`}
          lang="yaml"
          filename=".agent/workflows/review-pr.md"
        />
      </section>
    </article>
  );
}

// ── IDE compatibility data ────────────────────────────────────────────────

const IDE_COMPAT = [
  { name: "GitHub Copilot", icon: "🤖", invocation: "Type in Copilot Chat" },
  { name: "Cursor",         icon: "⚡", invocation: "Type in AI chat panel" },
  { name: "Windsurf",       icon: "🏄", invocation: "Type in Cascade chat" },
  { name: "Claude Code",    icon: "🧠", invocation: "Type in terminal or chat" },
];
