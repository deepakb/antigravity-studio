import { useState } from "react";
import { useLoaderData } from "react-router";
import type { agentsLoader } from "./agents.loader";
import { Badge } from "@/components/ui";
import { AGENT_META, CATEGORY_META } from "@/data/agent-meta";
import type { Agent } from "@/data/registry";
import { cn } from "@/lib/cn";
import { DocModal } from "@/components/docs/DocModal";

/**
 * Agents catalogue — full profiles grouped by domain category.
 * Each card shows: description, activation triggers, key skills, and highlights.
 *
 * 🤖 @frontend-specialist + @ui-component-architect
 *    Loading: react-patterns, tailwind-design-system skills...
 */
export default function AgentsPage() {
  const { agents, byCategory } = useLoaderData<typeof agentsLoader>();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const categories = Object.keys(byCategory);
  const selectedMeta = selectedAgent ? AGENT_META[selectedAgent.id] : undefined;

  return (
    <article className="w-full">
      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="mb-8">
        <Badge variant="muted" className="mb-4">Agent Catalogue</Badge>
        <h1 className="mb-3 text-4xl font-bold">AI Agents</h1>
        <p className="mb-5 text-lg text-(--color-muted)">
          {agents.length} specialist agents across {categories.length} domains —
          each one auto-activated based on your request context and loaded with
          the right skill packs for your stack.
        </p>

        {/* Stats row */}
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => {
            const catMeta = CATEGORY_META[cat];
            const slugId = cat.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-");
            return (
              <a
                key={cat}
                href={`#${slugId}`}
                className="flex items-center gap-1.5 rounded-full border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-xs text-(--color-muted) transition-colors hover:border-(--color-border-strong) hover:text-(--color-foreground)"
              >
                <span>{catMeta?.icon ?? "📦"}</span>
                <span>{cat}</span>
                <span className="ml-1 rounded-full bg-(--color-surface-raised) px-1.5 py-0.5 text-[10px]">
                  {(byCategory[cat] as Agent[]).length}
                </span>
              </a>
            );
          })}
        </div>
      </div>

      {/* ── How agents activate (info panel) ─────────────────────────── */}
      <div className="mb-10 rounded-xl border border-(--color-border-subtle) bg-(--color-surface) p-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-xl">💡</span>
          <div>
            <p className="mb-1 font-semibold text-sm">How agent auto-activation works</p>
            <p className="text-sm text-(--color-muted)">
              When you write a prompt in your IDE, Nexus Studio reads the request context and
              selects the most relevant specialist agent automatically. You can also invoke any
              agent directly by mentioning{" "}
              <code className="rounded bg-(--color-surface-raised) px-1 font-mono text-xs text-(--color-nexus-blue)">
                @agent-id
              </code>{" "}
              in your message, or trigger multi-agent workflows with slash commands like{" "}
              <code className="rounded bg-(--color-surface-raised) px-1 font-mono text-xs text-(--color-nexus-blue)">
                /blueprint
              </code>{" "}
              or{" "}
              <code className="rounded bg-(--color-surface-raised) px-1 font-mono text-xs text-(--color-nexus-blue)">
                /orchestrate
              </code>.
            </p>
          </div>
        </div>
      </div>

      {/* ── Agent detail modal ────────────────────────────────────────── */}
      <DocModal
        open={selectedAgent !== null}
        onClose={() => setSelectedAgent(null)}
        title={
          <div className="flex items-center gap-3">
            {selectedMeta?.emoji && (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--color-surface-raised) text-lg">
                {selectedMeta.emoji}
              </span>
            )}
            <div>
              <p className="font-semibold">{selectedAgent?.name}</p>
              <code className="font-mono text-[11px] text-(--color-nexus-blue)">
                @{selectedAgent?.id}
              </code>
            </div>
          </div>
        }
      >
        {selectedAgent && selectedMeta && (
          <div className="space-y-5">
            {/* Description */}
            <p className="text-sm text-(--color-muted) leading-relaxed">
              {selectedMeta.description}
            </p>

            {/* Highlights */}
            {selectedMeta.highlights.length > 0 && (
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-(--color-muted)">Capabilities</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMeta.highlights.map((h) => (
                    <span
                      key={h}
                      className="rounded-full border border-(--color-border) bg-(--color-surface-raised) px-2.5 py-1 text-xs font-medium text-(--color-muted)"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Activation triggers */}
            <div className="rounded-lg border border-(--color-border-subtle) bg-(--color-surface-raised) p-4">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-(--color-muted)">Activates on</p>
              <p className="text-sm text-(--color-muted) leading-relaxed">{selectedMeta.activation}</p>
            </div>

            {/* Key skills */}
            {selectedMeta.skills.length > 0 && (
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-(--color-muted)">Key Skills Loaded</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMeta.skills.map((skill) => (
                    <code
                      key={skill}
                      className="rounded border border-(--color-border) bg-(--color-surface-raised) px-2 py-0.5 font-mono text-[11px] text-(--color-nexus-blue)"
                    >
                      {skill}
                    </code>
                  ))}
                </div>
              </div>
            )}

            {/* Category */}
            <div className="flex items-center gap-2 text-xs text-(--color-muted)">
              <span>Category:</span>
              <span className="font-medium text-(--color-foreground)">{selectedAgent.category}</span>
            </div>

            {/* Invoke hint */}
            <div className="rounded-lg bg-(--color-surface-raised) px-4 py-3">
              <p className="text-[11px] text-(--color-muted)">
                <span className="font-semibold text-(--color-foreground)">Invoke directly: </span>
                mention{" "}
                <code className="font-mono text-(--color-nexus-blue)">@{selectedAgent.id}</code>{" "}
                in your IDE chat, or let Nexus Studio activate it automatically based on context.
              </p>
            </div>
          </div>
        )}
      </DocModal>

      {/* ── Category sections ──────────────────────────────────────────── */}
      {Object.entries(byCategory).map(([category, categoryAgents]) => {
        const catMeta = CATEGORY_META[category];
        const slugId = category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-");
        return (
          <section key={category} className="mb-12" id={slugId}>
            {/* Category heading */}
            <div className="mb-6 flex items-center gap-3 border-b border-(--color-border) pb-4">
              <span className="text-xl" aria-hidden="true">{catMeta?.icon ?? "📦"}</span>
              <div className="flex-1">
                <h2
                  className={cn(
                    "text-base font-semibold",
                    catMeta?.colorClass ?? "text-(--color-nexus-blue)"
                  )}
                >
                  {category}
                </h2>
                {catMeta?.description && (
                  <p className="mt-0.5 text-xs text-(--color-muted)">{catMeta.description}</p>
                )}
              </div>
              <Badge variant="muted">{(categoryAgents as Agent[]).length}</Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {(categoryAgents as Agent[]).map((agent) => {
                const meta = AGENT_META[agent.id];
                return (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    meta={meta}
                    onClick={() => setSelectedAgent(agent)}
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </article>
  );
}

// ── AgentCard sub-component ────────────────────────────────────────────────

function AgentCard({
  agent,
  meta,
  onClick,
}: {
  agent: Agent;
  meta: ReturnType<typeof AGENT_META[string]> | undefined;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full rounded-xl border bg-(--color-card) text-left transition-colors duration-150",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_2px_12px_rgba(0,0,0,0.35)]",
        "border-(--color-border-subtle) hover:border-(--color-nexus-blue) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-nexus-blue)",
        "px-5 py-5"
      )}
      aria-haspopup="dialog"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {meta?.emoji && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--color-surface-raised) text-lg">
              {meta.emoji}
            </span>
          )}
          <div>
            <p className="font-semibold leading-tight">{agent.name}</p>
            <code className="mt-0.5 block font-mono text-[11px] text-(--color-nexus-blue)">
              @{agent.id}
            </code>
          </div>
        </div>
        {/* Open indicator */}
        <svg
          className="mt-1 h-4 w-4 shrink-0 text-(--color-muted) transition-colors group-hover:text-(--color-nexus-blue)"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M15 3h6v6M14 10l6.1-6.1M9 21H3v-6M10 14l-6.1 6.1" />
        </svg>
      </div>

      {/* Short description */}
      {meta?.description && (
        <p className="mt-3 text-sm text-(--color-muted) leading-relaxed line-clamp-2">
          {meta.description}
        </p>
      )}

      {/* Highlight chips */}
      {meta?.highlights && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {meta.highlights.map((h) => (
            <span
              key={h}
              className="rounded-full border border-(--color-border) bg-(--color-surface-raised) px-2 py-0.5 text-[10px] font-medium text-(--color-muted)"
            >
              {h}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
