import { Link } from "react-router";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { Badge } from "@/components/ui";

/**
 * Getting Started guide — full step-by-step content.
 *
 * 🤖 @frontend-specialist + @ux-designer
 *    Loading: react-patterns skill...
 */
export default function GettingStartedPage() {
  return (
    <article className="mx-auto max-w-3xl">
      {/* Page header */}
      <div className="mb-10">
        <Badge variant="secondary" className="mb-4">Quick Start</Badge>
        <h1 className="mb-3 text-4xl font-bold">Getting Started</h1>
        <p className="text-lg text-(--color-muted)">
          Deploy a complete AI agent system into any project in under two minutes.
          Nexus Studio auto-detects your stack and installs exactly what you need.
        </p>
      </div>

      {/* Step 1 */}
      <Step number={1} title="Install Nexus Studio">
        <p className="mb-4 text-(--color-muted)">
          Run the initializer with <code className="rounded bg-(--color-surface-raised) px-1.5 py-0.5 font-mono text-sm text-(--color-nexus-blue)">npx</code> — no global install required.
          The wizard will detect your project type and suggest the best profile.
        </p>
        <CodeBlock code="npx @nexus/studio init" lang="bash" />
      </Step>

      {/* Step 2 */}
      <Step number={2} title="Select a Profile">
        <p className="mb-4 text-(--color-muted)">
          Nexus Studio detects your stack and suggests the right profile.
          Each profile bundles the correct agents, skills, and quality gates for your technology.
        </p>
        <CodeBlock
          code={`? Select a profile:
  ❯ react-vite          React 19 + Vite + React Router
    nextjs-app-router   Next.js 15 App Router
    node-api            Node.js REST/GraphQL API
    fullstack           Next.js + Prisma + tRPC
    → 12 more profiles...`}
          lang="text"
          filename="Terminal output"
        />
        <p className="mt-4 text-sm text-(--color-muted)">
          Not sure which to pick?{" "}
          <Link to="/docs/profiles" className="text-(--color-nexus-blue) hover:underline">
            Browse all 15 profiles →
          </Link>
        </p>
      </Step>

      {/* Step 3 */}
      <Step number={3} title="Configure Your IDE">
        <p className="mb-4 text-(--color-muted)">
          Nexus Studio generates IDE-specific config files automatically.
          Choose your IDE during setup or run{" "}
          <code className="rounded bg-(--color-surface-raised) px-1.5 py-0.5 font-mono text-sm text-(--color-nexus-blue)">studio context init</code>{" "}
          to regenerate.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {IDE_CONFIGS.map((ide) => (
            <div
              key={ide.name}
              className="flex items-start gap-3 rounded-lg border border-(--color-border) bg-(--color-surface) p-4"
            >
              <span className="mt-0.5 text-xl">{ide.icon}</span>
              <div>
                <p className="font-semibold text-sm">{ide.name}</p>
                <p className="font-mono text-xs text-(--color-muted)">{ide.file}</p>
              </div>
            </div>
          ))}
        </div>
      </Step>

      {/* Step 4 */}
      <Step number={4} title="Run Quality Gates">
        <p className="mb-4 text-(--color-muted)">
          Validate your project immediately with the built-in quality gates.
          Tier 1 gates block on failure; Tier 2 auto-fix; Tier 3 are advisory.
        </p>
        <CodeBlock
          code={`# Run all quality gates
npx @nexus/studio run

# Run a specific gate
npx @nexus/studio run ts-check
npx @nexus/studio run security-scan`}
          lang="bash"
        />
        <p className="mt-4 text-sm text-(--color-muted)">
          See all{" "}
          <Link to="/docs/quality-gates" className="text-(--color-nexus-blue) hover:underline">
            19 quality gates →
          </Link>
        </p>
      </Step>

      {/* What's next */}
      <div className="mt-12 rounded-xl border border-(--color-border-subtle) bg-(--color-surface) p-6">
        <h2 className="mb-4 text-lg font-semibold">What's next?</h2>
        <ul className="space-y-2 text-sm">
          {NEXT_LINKS.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className="flex items-center justify-between rounded-md px-3 py-2 text-(--color-muted) transition-colors hover:bg-(--color-surface-raised) hover:text-(--color-foreground)"
              >
                <span>{link.label}</span>
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-(--color-nexus-blue)/10 text-sm font-bold text-(--color-nexus-blue)">
          {number}
        </span>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────

const IDE_CONFIGS = [
  { name: "GitHub Copilot", file: ".github/copilot-instructions.md", icon: "🤖" },
  { name: "Cursor", file: ".cursorrules", icon: "⚡" },
  { name: "Windsurf", file: ".windsurfrules", icon: "🏄" },
  { name: "Claude Code", file: "CLAUDE.md", icon: "🧠" },
];

const NEXT_LINKS = [
  { label: "Explore all 15 profiles", to: "/docs/profiles" },
  { label: "Browse 29 AI agents", to: "/docs/agents" },
  { label: "Explore 51 skill libraries", to: "/docs/skills" },
  { label: "Full CLI reference", to: "/docs/cli-reference" },
  { label: "Quality gate catalog", to: "/docs/quality-gates" },
];
