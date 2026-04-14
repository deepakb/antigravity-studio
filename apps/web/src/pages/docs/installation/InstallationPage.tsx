import { CodeBlock } from "@/components/docs/CodeBlock";
import { Badge } from "@/components/ui";

/**
 * Installation guide — prerequisites + package managers + verification.
 *
 * 🤖 @frontend-specialist
 *    Loading: react-patterns skill...
 */
export default function InstallationPage() {
  return (
    <article className="mx-auto max-w-3xl">
      <div className="mb-10">
        <Badge variant="muted" className="mb-4">Installation</Badge>
        <h1 className="mb-3 text-4xl font-bold">Installation</h1>
        <p className="text-lg text-(--color-muted)">
          Nexus Studio requires Node.js 18 or higher. It runs via{" "}
          <code className="rounded bg-(--color-surface-raised) px-1.5 py-0.5 font-mono text-sm text-(--color-nexus-blue)">npx</code>{" "}
          with zero global install required.
        </p>
      </div>

      {/* Prerequisites */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">Prerequisites</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {PREREQS.map((p) => (
            <div
              key={p.name}
              className="rounded-lg border border-(--color-border) bg-(--color-surface) p-4"
            >
              <p className="font-semibold text-sm">{p.name}</p>
              <p className="text-xs text-(--color-nexus-blue)">{p.version}</p>
              <p className="mt-1 text-xs text-(--color-muted)">{p.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Install options */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">Initialize in your project</h2>
        <p className="mb-4 text-(--color-muted)">
          Navigate to your project root and run one of these commands:
        </p>

        <div className="space-y-3">
          <div>
            <p className="mb-2 text-sm font-medium text-(--color-muted)">npm</p>
            <CodeBlock code="npx @nexus/studio init" lang="bash" />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-(--color-muted)">pnpm</p>
            <CodeBlock code="pnpm dlx @nexus/studio init" lang="bash" />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-(--color-muted)">yarn</p>
            <CodeBlock code="yarn dlx @nexus/studio init" lang="bash" />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-(--color-muted)">bun</p>
            <CodeBlock code="bunx @nexus/studio init" lang="bash" />
          </div>
        </div>
      </section>

      {/* Verify */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">Verify the installation</h2>
        <p className="mb-4 text-(--color-muted)">
          After init, your project will have a <code className="rounded bg-(--color-surface-raised) px-1.5 py-0.5 font-mono text-sm text-(--color-nexus-blue)">.agent/</code> directory with agents, skills, and IDE configs.
        </p>
        <CodeBlock
          code={`# Check installed agents
npx @nexus/studio list agents

# Check installed skills
npx @nexus/studio list skills

# View current profile
npx @nexus/studio status`}
          lang="bash"
        />
      </section>

      {/* What gets generated */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">Generated file structure</h2>
        <CodeBlock
          code={`.agent/
├── AGENTS.md              # Agent roster + routing table
├── agents/                # Individual agent instruction files
│   ├── frontend-specialist.md
│   ├── ui-component-architect.md
│   └── ...
├── skills/                # Skill knowledge packs
│   ├── react-patterns/
│   ├── tailwind-design-system/
│   └── ...
├── workflows/             # Multi-agent workflow definitions
├── scripts/               # Quality gate scripts
│   ├── ts-check.sh
│   ├── security-scan.sh
│   └── ...
└── context/               # Project-level AI context
    ├── DECISIONS.md
    └── GOTCHAS.md`}
          lang="text"
          filename=".agent/ structure"
        />
      </section>
    </article>
  );
}

const PREREQS = [
  { name: "Node.js", version: "≥ 18.0.0", note: "LTS or Current" },
  { name: "npm / pnpm / yarn", version: "Any", note: "Package manager" },
  { name: "Git", version: "Any", note: "For .agent/ tracking" },
];
