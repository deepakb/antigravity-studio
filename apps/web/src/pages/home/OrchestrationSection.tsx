import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

/**
 * OrchestrationSection — "From intent to shipped feature."
 *
 * Visualises the 5-stage orchestration pipeline with animated flow nodes,
 * coalition pill assembly, and stage cards. All animation is pure CSS —
 * no external JS animation library required.
 *
 * 🤖 @ui-design-engineer + @creative-director + @motion-designer
 *    Skills: ui-visual-patterns-2026, tailwind-design-system, micro-interactions
 */

// ── Data ─────────────────────────────────────────────────────────────────────

const FLOW_NODES = [
  {
    label: "/blueprint",
    sub: "intent signal",
    accent: "--color-primary",
    isHub: false,
  },
  {
    label: "🧠 Think + Plan",
    sub: "Stage 2.5",
    accent: "--color-secondary",
    isHub: false,
  },
  {
    label: "🎭 Orchestrator",
    sub: "coalition hub",
    accent: "--color-primary",
    isHub: true,
  },
  {
    label: "⚙️ Execute",
    sub: "ordered handoffs",
    accent: "--color-secondary",
    isHub: false,
  },
  {
    label: "✓ Verified",
    sub: "19 gates passed",
    accent: "--color-success",
    isHub: false,
  },
] as const;

const COALITION = [
  { emoji: "🏛️", label: "@enterprise-architect", delay: 0.55 },
  { emoji: "🗄️", label: "@database-engineer",    delay: 0.63 },
  { emoji: "🔌", label: "@api-architect",        delay: 0.71 },
  { emoji: "🔐", label: "@security-engineer",    delay: 0.79 },
  { emoji: "✅", label: "@qa-engineer",          delay: 0.87 },
];

const STAGES = [
  {
    num: "01",
    icon: "🔍",
    name: "Decompose",
    desc: "Scores complexity. Maps primary domain, secondary domains, and the critical path.",
  },
  {
    num: "02",
    icon: "🤝",
    name: "Assemble",
    desc: "Assigns specialists with confidence scores. Minimum viable coalition only.",
  },
  {
    num: "03",
    icon: "📋",
    name: "Contract",
    desc: "TypeScript I/O contracts defined before any file is written. Zero drift.",
  },
  {
    num: "04",
    icon: "⚙️",
    name: "Execute",
    desc: "Types → Data → API → UI → Tests. Hard stops at architecture pivots.",
  },
  {
    num: "05",
    icon: "✅",
    name: "Verify",
    desc: "Quality gates run. Any Tier-1 failure stops the pipeline cold.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function OrchestrationSection() {
  const [ref, visible] = useIntersectionObserver({ threshold: 0.15 });

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden border-t border-(--color-border) bg-(--color-surface) px-4 py-20 md:px-8"
    >
      {/* Ambient — violet-forward, distinct from the blue-forward hero */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-0 h-[480px] w-[700px] -translate-x-1/2 rounded-full opacity-[0.07] blur-[120px]"
          style={{ background: "var(--color-secondary)" }}
        />
        <div
          className="absolute bottom-0 right-0 h-[280px] w-[340px] rounded-full opacity-[0.05] blur-[90px]"
          style={{ background: "var(--color-primary)" }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div
          className="mb-14 text-center"
          style={visible ? { animation: "fade-in-up 0.6s ease both" } : { opacity: 0 }}
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-(--color-border-subtle) bg-(--color-surface-raised) px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-(--color-secondary)">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--color-secondary)" }}
              aria-hidden
            />
            Meet the Orchestrator
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            From intent to{" "}
            <span className="nexus-gradient-text">shipped feature.</span>
          </h2>
          <p className="mx-auto max-w-xl text-(--color-muted)">
            Type{" "}
            <code className="rounded bg-(--color-surface-raised) px-1.5 py-0.5 font-mono text-sm text-(--color-primary)">
              /blueprint
            </code>
            . Nexus scores complexity, assembles the right coalition, enforces
            I/O contracts, and gates every commit — automatically.
          </p>
        </div>

        {/* ── Pipeline flow — lg+ horizontal ──────────────────────────── */}
        <div
          className="mb-6 hidden items-center justify-between lg:flex"
          aria-label="Orchestration pipeline"
        >
          {FLOW_NODES.map((node, i) => (
            <div key={node.label} className="flex flex-1 items-center">

              {/* Node box */}
              <div className="relative flex-shrink-0">

                {/* Hub: double expanding ring */}
                {node.isHub && visible && (
                  <>
                    <div
                      className="absolute -inset-2 rounded-xl border"
                      style={{
                        borderColor: `color-mix(in srgb, var(${node.accent}) 40%, transparent)`,
                        animation: "ring-expand 2.4s ease-out infinite",
                        animationDelay: "0.2s",
                      }}
                      aria-hidden
                    />
                    <div
                      className="absolute -inset-2 rounded-xl border"
                      style={{
                        borderColor: `color-mix(in srgb, var(${node.accent}) 40%, transparent)`,
                        animation: "ring-expand 2.4s ease-out infinite",
                        animationDelay: "1.4s",
                      }}
                      aria-hidden
                    />
                  </>
                )}

                <div
                  className="rounded-xl border px-4 py-3 text-center"
                  style={
                    visible
                      ? {
                          animation: "fade-in-up 0.45s ease both",
                          animationDelay: `${0.1 + i * 0.1}s`,
                          borderColor: `color-mix(in srgb, var(${node.accent}) 35%, var(--color-border))`,
                          background: node.isHub
                            ? `color-mix(in srgb, var(${node.accent}) 10%, var(--color-surface-raised))`
                            : "var(--color-surface-raised)",
                          boxShadow: node.isHub
                            ? `0 0 28px color-mix(in srgb, var(${node.accent}) 18%, transparent)`
                            : undefined,
                        }
                      : { opacity: 0 }
                  }
                >
                  <div
                    className="whitespace-nowrap font-mono text-sm font-bold"
                    style={{ color: `var(${node.accent})` }}
                  >
                    {node.label}
                  </div>
                  <div className="mt-0.5 whitespace-nowrap text-[10px] text-(--color-muted)">
                    {node.sub}
                  </div>
                </div>

              </div>

              {/* Connector arrow (not after last node) */}
              {i < FLOW_NODES.length - 1 && (() => {
                const nextAccent = FLOW_NODES[i + 1]?.accent ?? "--color-border";
                return (
                  <div
                    className="relative mx-1.5 flex flex-1 items-center"
                    aria-hidden
                  >
                    <span
                      className="block h-px flex-1 origin-left"
                      style={
                        visible
                          ? {
                              background: `linear-gradient(90deg,
                                color-mix(in srgb, var(${node.accent}) 30%, var(--color-border)),
                                color-mix(in srgb, var(${nextAccent}) 30%, var(--color-border))
                              )`,
                              animation: "pipeline-reveal 0.35s ease both",
                              animationDelay: `${0.18 + i * 0.1}s`,
                            }
                          : { opacity: 0 }
                      }
                    />
                    <svg
                      width="6"
                      height="10"
                      viewBox="0 0 6 10"
                      fill="none"
                      style={
                        visible
                          ? {
                              color: "var(--color-border-strong)",
                              flexShrink: 0,
                              animation: "fade-in 0.2s ease both",
                              animationDelay: `${0.22 + i * 0.1}s`,
                            }
                          : { opacity: 0, flexShrink: 0 }
                      }
                    >
                      <path
                        d="M1 1l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                );
              })()}

            </div>
          ))}
        </div>

        {/* ── Mobile: pill strip ───────────────────────────────────────── */}
        <div
          className="mb-8 flex flex-wrap items-center justify-center gap-1.5 lg:hidden"
          aria-label="Pipeline steps"
        >
          {FLOW_NODES.map((node, i) => (
            <span key={node.label} className="flex items-center gap-1.5">
              <span
                className="rounded-lg border px-3 py-1.5 font-mono text-xs font-semibold"
                style={
                  visible
                    ? {
                        borderColor: `color-mix(in srgb, var(${node.accent}) 35%, var(--color-border))`,
                        color: `var(${node.accent})`,
                        animation: "fade-in 0.4s ease both",
                        animationDelay: `${0.05 + i * 0.07}s`,
                      }
                    : { opacity: 0 }
                }
              >
                {node.label}
              </span>
              {i < FLOW_NODES.length - 1 && (
                <span className="text-xs text-(--color-muted)" aria-hidden>
                  ›
                </span>
              )}
            </span>
          ))}
        </div>

        {/* ── Coalition assembly pills ─────────────────────────────────── */}
        <div
          className="mb-14 flex flex-wrap items-center justify-center gap-2"
          aria-label="Example Epic coalition"
        >
          <span
            className="mr-1 text-xs text-(--color-muted)"
            style={
              visible
                ? { animation: "fade-in 0.4s ease both", animationDelay: "0.5s" }
                : { opacity: 0 }
            }
          >
            Epic coalition:
          </span>
          {COALITION.map((agent) => (
            <span
              key={agent.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-(--color-border-subtle) bg-(--color-surface-raised) px-3 py-1 font-mono text-xs text-(--color-foreground)"
              style={
                visible
                  ? {
                      animation:
                        "agent-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
                      animationDelay: `${agent.delay}s`,
                    }
                  : { opacity: 0 }
              }
            >
              <span aria-hidden>{agent.emoji}</span>
              {agent.label}
            </span>
          ))}
        </div>

        {/* ── 5-Stage pipeline cards ───────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {STAGES.map((stage, i) => (
            <div
              key={stage.num}
              className="group rounded-xl border border-(--color-border-subtle) bg-(--color-surface) p-5 transition-colors duration-150 hover:border-(--color-border-strong) hover:bg-(--color-surface-raised)"
              style={
                visible
                  ? {
                      animation: "fade-in-up 0.5s ease both",
                      animationDelay: `${0.72 + i * 0.07}s`,
                    }
                  : { opacity: 0 }
              }
            >
              <div className="nexus-gradient-text mb-3 font-mono text-xs font-bold tracking-widest">
                {stage.num}
              </div>
              <div className="mb-2 text-xl">{stage.icon}</div>
              <div className="mb-1.5 text-sm font-semibold text-(--color-foreground)">
                {stage.name}
              </div>
              <p className="text-xs leading-relaxed text-(--color-muted)">
                {stage.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
