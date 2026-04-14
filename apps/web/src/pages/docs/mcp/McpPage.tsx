import { CodeBlock } from "@/components/docs/CodeBlock";
import { Badge } from "@/components/ui";

/**
 * MCP Servers — configuration guide for Model Context Protocol integrations.
 *
 * 🤖 @frontend-specialist
 *    Loading: react-patterns skill...
 */

const MCP_SERVERS = [
  {
    id: "context7",
    name: "Context7",
    tagline: "Live Library Docs",
    description:
      "Fetches up-to-date documentation for any library or framework directly into the agent context. Replaces stale training data with current API docs.",
    command: "npx -y @upstash/context7-mcp@latest",
    badge: "Recommended",
  },
  {
    id: "desktop-commander",
    name: "Desktop Commander",
    tagline: "File System Access",
    description:
      "Gives agents the ability to read/write files, execute terminal commands, and interact with your local file system — extending agent capabilities beyond the editor.",
    command: "npx -y @desktop-commander/mcp@latest",
    badge: undefined,
  },
  {
    id: "git-mcp",
    name: "Git MCP",
    tagline: "Repository Context",
    description:
      "Agents can read git history, inspect commits, create branches, and manage PRs without leaving the AI interface.",
    command: "npx -y @coderabbit/git-mcp@latest",
    badge: undefined,
  },
];

const copilotConfig = `// .vscode/mcp.json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    },
    "desktop-commander": {
      "command": "npx",
      "args": ["-y", "@desktop-commander/mcp@latest"]
    }
  }
}`;

const cursorConfig = `// .cursor/mcp.json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}`;

export default function McpPage() {
  return (
    <article className="mx-auto max-w-3xl">
      <div className="mb-10">
        <Badge variant="muted" className="mb-4">Integrations</Badge>
        <h1 className="mb-3 text-4xl font-bold">MCP Servers</h1>
        <p className="text-lg text-(--color-muted)">
          Model Context Protocol (MCP) servers extend your AI agents with external tools —
          live documentation, file system access, git history, and more. Nexus Studio
          auto-generates MCP config for detected IDEs during <code className="rounded bg-(--color-surface-raised) px-1 font-mono text-sm text-(--color-nexus-blue)">studio init</code>.
        </p>
      </div>

      {/* Server catalogue */}
      <section className="mb-12">
        <h2 className="mb-5 text-xl font-semibold">Recommended Servers</h2>
        <div className="space-y-4">
          {MCP_SERVERS.map((server) => (
            <div
              key={server.id}
              className="rounded-xl border border-(--color-border) bg-(--color-surface) p-5"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{server.name}</p>
                  <p className="text-xs text-(--color-nexus-blue)">{server.tagline}</p>
                </div>
                {server.badge && (
                  <Badge variant="default" className="shrink-0 text-[10px]">
                    {server.badge}
                  </Badge>
                )}
              </div>
              <p className="mb-3 text-sm text-(--color-muted)">{server.description}</p>
              <CodeBlock code={server.command} lang="bash" />
            </div>
          ))}
        </div>
      </section>

      {/* IDE config */}
      <section className="mb-12">
        <h2 className="mb-5 text-xl font-semibold">IDE Configuration</h2>
        <p className="mb-6 text-(--color-muted)">
          Nexus Studio generates these config files automatically. You can also add them manually.
        </p>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-(--color-muted)">GitHub Copilot (<code className="font-mono text-xs">.vscode/mcp.json</code>)</p>
            <CodeBlock code={copilotConfig} lang="json" />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-(--color-muted)">Cursor (<code className="font-mono text-xs">.cursor/mcp.json</code>)</p>
            <CodeBlock code={cursorConfig} lang="json" />
          </div>
        </div>
      </section>

      {/* Usage */}
      <section>
        <h2 className="mb-5 text-xl font-semibold">Using MCP in agents</h2>
        <p className="mb-4 text-(--color-muted)">
          Once configured, agents reference MCP servers using the <code className="rounded bg-(--color-surface-raised) px-1 font-mono text-sm text-(--color-nexus-blue)">use</code> directive in their instruction files.
        </p>
        <CodeBlock
          code={`---
name: frontend-specialist
use_mcp:
  - context7        # Live framework docs
  - desktop-commander  # File system ops
---`}
          lang="yaml"
          filename=".agent/agents/frontend-specialist.md (frontmatter)"
        />
      </section>
    </article>
  );
}
