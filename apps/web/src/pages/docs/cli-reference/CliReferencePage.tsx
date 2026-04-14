import { CodeBlock } from "@/components/docs/CodeBlock";
import { Badge } from "@/components/ui";

/**
 * CLI Reference — full command catalog with flags and examples.
 * Explicit section IDs ensure the right-rail TOC always picks up headings.
 *
 * 🤖 @frontend-specialist + @technical-writer
 *    Loading: react-patterns skill...
 */
export default function CliReferencePage() {
  return (
    <article className="mx-auto max-w-3xl">
      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="mb-10">
        <Badge variant="muted" className="mb-4">CLI Reference</Badge>
        <h1 className="mb-3 text-4xl font-bold">CLI Reference</h1>
        <p className="text-lg text-(--color-muted)">
          All commands, flags, and examples for{" "}
          <code className="rounded bg-(--color-surface-raised) px-1.5 py-0.5 font-mono text-sm text-(--color-nexus-blue)">@nexus/studio</code>.
          Run without installing via{" "}
          <code className="rounded bg-(--color-surface-raised) px-1.5 py-0.5 font-mono text-sm text-(--color-nexus-blue)">npx</code>.
        </p>
      </div>

      {/* ── Quick Reference Table ─────────────────────────────────────── */}
      <section className="mb-12" id="quick-reference">
        <h2 className="mb-4 text-xl font-semibold">Quick Reference</h2>
        <div className="overflow-hidden rounded-xl border border-(--color-border)">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--color-border) bg-(--color-surface-raised)">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-(--color-muted)">
                  Command
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-(--color-muted)">
                  Purpose
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-(--color-muted) sm:table-cell">
                  Category
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-border)">
              {CLI_COMMANDS.map((cmd) => (
                <tr
                  key={cmd.command}
                  className="bg-(--color-surface) transition-colors hover:bg-(--color-surface-raised)"
                >
                  <td className="px-4 py-3">
                    <a
                      href={`#${cmd.id}`}
                      className="font-mono text-sm font-medium text-(--color-nexus-blue) hover:underline"
                    >
                      studio {cmd.command}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-(--color-muted)">{cmd.shortDescription}</td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    {cmd.badge && (
                      <Badge variant={cmd.badgeVariant ?? "muted"} className="text-[10px]">
                        {cmd.badge}
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Command sections ──────────────────────────────────────────── */}
      {CLI_COMMANDS.map((cmd) => (
        <section key={cmd.command} className="mb-12" id={cmd.id}>
          <div className="mb-3 flex items-start gap-3">
            <h2 className="font-mono text-xl font-bold text-(--color-nexus-blue)">
              studio {cmd.command}
            </h2>
            {cmd.badge && (
              <Badge variant={cmd.badgeVariant ?? "muted"} className="mt-0.5">
                {cmd.badge}
              </Badge>
            )}
          </div>
          <p className="mb-5 text-(--color-muted)">{cmd.description}</p>

          <CodeBlock code={cmd.usage} lang="bash" filename="Usage" />

          {cmd.flags && (
            <div className="mt-5">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-(--color-muted)">
                Flags
              </p>
              <div className="divide-y divide-(--color-border) overflow-hidden rounded-lg border border-(--color-border)">
                {cmd.flags.map((flag) => (
                  <div
                    key={flag.flag}
                    className="flex flex-col gap-1 bg-(--color-surface) px-4 py-3 sm:flex-row sm:items-baseline sm:gap-4"
                  >
                    <code className="min-w-[200px] shrink-0 font-mono text-sm text-(--color-nexus-blue)">
                      {flag.flag}
                    </code>
                    <div className="flex-1">
                      <span className="text-sm text-(--color-muted)">{flag.description}</span>
                      {flag.default !== undefined && (
                        <span className="ml-2 rounded bg-(--color-surface-raised) px-1.5 py-0.5 font-mono text-[10px] text-(--color-muted)">
                          default: {flag.default}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cmd.example && (
            <div className="mt-5">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-(--color-muted)">
                Example
              </p>
              <CodeBlock code={cmd.example} lang="bash" />
            </div>
          )}

          {cmd.notes && (
            <div className="mt-5 rounded-lg border border-(--color-border-subtle) bg-(--color-surface) p-4">
              <p className="text-sm text-(--color-muted)">{cmd.notes}</p>
            </div>
          )}
        </section>
      ))}

      {/* ── Global flags ─────────────────────────────────────────────── */}
      <section className="mb-12" id="global-flags">
        <h2 className="mb-4 text-xl font-semibold">Global Flags</h2>
        <p className="mb-4 text-(--color-muted)">
          These flags are available on all commands:
        </p>
        <div className="divide-y divide-(--color-border) overflow-hidden rounded-xl border border-(--color-border)">
          {GLOBAL_FLAGS.map((flag) => (
            <div
              key={flag.flag}
              className="flex flex-col gap-1 bg-(--color-surface) px-4 py-3 sm:flex-row sm:items-baseline sm:gap-4"
            >
              <code className="min-w-[180px] shrink-0 font-mono text-sm text-(--color-nexus-blue)">
                {flag.flag}
              </code>
              <span className="text-sm text-(--color-muted)">{flag.description}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Exit codes ───────────────────────────────────────────────── */}
      <section id="exit-codes">
        <h2 className="mb-4 text-xl font-semibold">Exit Codes</h2>
        <div className="divide-y divide-(--color-border) overflow-hidden rounded-xl border border-(--color-border)">
          {EXIT_CODES.map(({ code, meaning }) => (
            <div
              key={code}
              className="flex items-center gap-6 bg-(--color-surface) px-4 py-3"
            >
              <code className="w-8 shrink-0 font-mono text-sm font-bold text-(--color-nexus-blue)">
                {code}
              </code>
              <span className="text-sm text-(--color-muted)">{meaning}</span>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}

// ── Command data ──────────────────────────────────────────────────────────

type FlagDef = {
  flag: string;
  description: string;
  default?: string;
};

interface CliCommand {
  /** Unique kebab-case ID used as section anchor */
  id: string;
  command: string;
  shortDescription: string;
  description: string;
  usage: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "success" | "warning" | "destructive" | "muted";
  flags?: FlagDef[];
  example?: string;
  notes?: string;
}

const CLI_COMMANDS: CliCommand[] = [
  {
    id: "studio-init",
    command: "init",
    badge: "Core",
    badgeVariant: "default",
    shortDescription: "Bootstrap a project with agents, skills, and IDE configs",
    description:
      "Initialize Nexus Studio in a project. Auto-detects the stack, presents profile options, installs the chosen agents + skills, and generates IDE-specific config files for GitHub Copilot, Cursor, Windsurf, and Claude Code.",
    usage: "npx @nexus/studio init [flags]",
    flags: [
      {
        flag: "--profile <name>",
        description: "Skip the interactive wizard and install a specific profile directly",
      },
      {
        flag: "--ide <name>",
        description: "Target a specific IDE: copilot | cursor | windsurf | claude",
        default: "all detected",
      },
      {
        flag: "--dry-run",
        description: "Preview what would be installed without writing any files",
      },
      {
        flag: "--skip-ide",
        description: "Install agents and skills but skip IDE config file generation",
      },
      {
        flag: "--force",
        description: "Overwrite existing .agent/ directory without prompting",
      },
    ],
    example: `# Interactive wizard (recommended first run)
npx @nexus/studio init

# Direct profile install — no prompts
npx @nexus/studio init --profile react-vite

# Preview what would be installed
npx @nexus/studio init --dry-run

# Install only for Cursor
npx @nexus/studio init --ide cursor`,
    notes:
      "Run from the root of your project. Nexus Studio detects your package.json, framework, and language to recommend the best profile.",
  },
  {
    id: "studio-run",
    command: "run",
    badge: "Quality",
    badgeVariant: "warning",
    shortDescription: "Execute one or all quality gates",
    description:
      "Execute one or all quality gates. Tier 1 gates block CI on failure. Tier 2 gates attempt automated fixes and re-run. Tier 3 gates emit advisory warnings only. Run all gates or target a specific one by ID.",
    usage: "npx @nexus/studio run [gate] [flags]",
    flags: [
      {
        flag: "--tier <1|2|3>",
        description: "Run only gates belonging to the specified enforcement tier",
      },
      {
        flag: "--fix",
        description: "Apply auto-fixes where available (default behaviour for Tier 2)",
      },
      {
        flag: "--json",
        description: "Output results as JSON — useful for CI/CD pipeline parsing",
      },
      {
        flag: "--bail",
        description: "Stop on the first gate failure instead of running all gates",
      },
    ],
    example: `# Run all quality gates
npx @nexus/studio run

# Run a specific gate
npx @nexus/studio run ts-check
npx @nexus/studio run security-scan
npx @nexus/studio run accessibility-audit

# Run only hard-block gates (CI use-case)
npx @nexus/studio run --tier 1

# JSON output for CI parsing
npx @nexus/studio run --json`,
  },
  {
    id: "studio-sync",
    command: "sync",
    badge: "Maintenance",
    badgeVariant: "secondary",
    shortDescription: "Sync agents and skills with the latest registry versions",
    description:
      "Sync installed agents and skills with the latest template versions from the public registry. Nexus Studio performs a three-way merge: your local customizations are preserved unless --force is passed.",
    usage: "npx @nexus/studio sync [flags]",
    flags: [
      {
        flag: "--dry-run",
        description: "Show which files would change without modifying anything on disk",
      },
      {
        flag: "--force",
        description: "Overwrite all local customizations with the upstream versions",
      },
      {
        flag: "--agents-only",
        description: "Sync only agent instruction files, skip skills",
      },
      {
        flag: "--skills-only",
        description: "Sync only skill packs, skip agent files",
      },
    ],
    example: `# Preview available updates
npx @nexus/studio sync --dry-run

# Apply updates (preserving local edits)
npx @nexus/studio sync

# Force-reset to upstream (discard local changes)
npx @nexus/studio sync --force`,
    notes:
      "Use --dry-run in your CI pipeline to alert your team when upstream updates are available.",
  },
  {
    id: "studio-context-init",
    command: "context init",
    badge: "Context",
    badgeVariant: "muted",
    shortDescription: "Regenerate IDE-specific context files from .agent/",
    description:
      "Generate or regenerate IDE context files from the agent system. Reads the .agent/ directory and produces IDE-specific instruction files: copilot-instructions.md, .cursorrules, .windsurfrules, and CLAUDE.md.",
    usage: "npx @nexus/studio context init [flags]",
    flags: [
      {
        flag: "--ide <name>",
        description: "Regenerate config for a specific IDE only: copilot | cursor | windsurf | claude",
      },
      {
        flag: "--force",
        description: "Regenerate context files even if they already exist",
      },
      {
        flag: "--preview",
        description: "Print the generated content to stdout without writing files",
      },
    ],
    example: `# Regenerate all IDE configs
npx @nexus/studio context init

# Regenerate only Copilot config
npx @nexus/studio context init --ide copilot

# Preview output without writing
npx @nexus/studio context init --preview`,
  },
  {
    id: "studio-list",
    command: "list",
    shortDescription: "List installed agents, skills, profiles, or quality gates",
    description:
      "List installed agents, skills, profiles, or quality gates in the current project. Output includes the resource ID, name, source (built-in vs. custom), and last sync date.",
    usage: "npx @nexus/studio list <resource>",
    example: `npx @nexus/studio list agents
npx @nexus/studio list skills
npx @nexus/studio list profiles
npx @nexus/studio list gates`,
  },
  {
    id: "studio-status",
    command: "status",
    shortDescription: "Show current project configuration and health summary",
    description:
      "Show the current project's Nexus Studio configuration: active profile, installed agent count, skill count, quality gate count, last sync date, and any outdated resources.",
    usage: "npx @nexus/studio status",
    example: `npx @nexus/studio status

# Example output:
# ✅ Nexus Studio v2.4.0
# Profile:   react-vite
# Agents:    15 installed
# Skills:    23 installed
# Gates:     19 configured
# Last sync: 2 days ago
# ⚠️  3 agents have upstream updates — run: studio sync`,
  },
  {
    id: "studio-add",
    command: "add",
    badge: "Core",
    badgeVariant: "default",
    shortDescription: "Add individual agents or skills to an existing project",
    description:
      "Add one or more agents or skills to an already-initialized project without running the full init wizard. Useful for expanding a project's capabilities incrementally.",
    usage: "npx @nexus/studio add <type> <id...>",
    flags: [
      {
        flag: "--ide <name>",
        description: "Update IDE context files after adding the resource",
      },
    ],
    example: `# Add a single agent
npx @nexus/studio add agent ai-engineer

# Add multiple skills
npx @nexus/studio add skill openai-sdk rag-implementation

# Add and refresh IDE context
npx @nexus/studio add agent llm-security-officer --ide copilot`,
  },
  {
    id: "studio-remove",
    command: "remove",
    shortDescription: "Remove agents or skills from the project",
    description:
      "Remove one or more agents or skills from the project. Deletes the corresponding files from .agent/ and updates the context index.",
    usage: "npx @nexus/studio remove <type> <id...>",
    example: `npx @nexus/studio remove agent seo-specialist
npx @nexus/studio remove skill lottie-animations`,
  },
];

// ── Global flags ──────────────────────────────────────────────────────────

const GLOBAL_FLAGS: FlagDef[] = [
  { flag: "--help, -h",     description: "Print help text and exit" },
  { flag: "--version, -v",  description: "Print the installed version and exit" },
  { flag: "--verbose",      description: "Enable verbose logging output" },
  { flag: "--no-color",     description: "Disable ANSI color output (useful in CI)" },
  { flag: "--cwd <path>",   description: "Override the working directory (default: process.cwd())" },
];

// ── Exit codes ────────────────────────────────────────────────────────────

const EXIT_CODES = [
  { code: "0",  meaning: "Success — all gates passed, command completed without errors" },
  { code: "1",  meaning: "General error — command failed with an unrecoverable error" },
  { code: "2",  meaning: "Gate failure — one or more Tier 1 quality gates blocked execution" },
  { code: "3",  meaning: "Not initialized — .agent/ directory not found in current project" },
  { code: "130", meaning: "Interrupted — process received SIGINT (Ctrl+C)" },
];
