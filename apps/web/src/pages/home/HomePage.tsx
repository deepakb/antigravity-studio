import { useLoaderData } from "react-router";
import { Link } from "react-router";
import type { homeLoader } from "./home.loader";
import { Button } from "@/components/ui";
import { Terminal, type TerminalStack } from "@/components/ui/Terminal";
import { Bot, Shield, Plug2, Zap } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useCountUp } from "@/hooks/useCountUp";
import { OrchestrationSection } from "./OrchestrationSection";

/**
 * Home page — hero + terminal + stats + feature grid
 *
 * 🤖 @ui-design-engineer + @creative-director
 *    Loading: ui-visual-patterns-2026, tailwind-design-system skills...
 *    /redesign full applied — three layers: ambient + surface + motion
 */
export default function HomePage() {
  const { stats } = useLoaderData<typeof homeLoader>();

  return (
    <div className="flex flex-col items-center">

      {/* ── Hero — Split-screen: left copy + right live terminal ────────── */}
      <section className="relative w-full overflow-hidden">

        {/* Ambient layer */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "radial-gradient(circle, var(--color-border-strong) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          {/* Primary glow — left quadrant */}
          <div
            className="absolute left-1/4 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.14] blur-[130px]"
            style={{
              background: "var(--color-primary)",
              animation: "glow-pulse 4s ease-in-out infinite",
            }}
          />
          {/* Secondary glow — right quadrant */}
          <div
            className="absolute right-0 top-1/2 h-[440px] w-[440px] -translate-y-1/2 rounded-full opacity-[0.09] blur-[110px]"
            style={{ background: "var(--color-secondary)" }}
          />
          {/* Bottom vignette */}
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-(--color-background) to-transparent" />
        </div>

        {/* Split grid — fills viewport height on lg+ */}
        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-56px)] max-w-screen-xl grid-cols-1 items-center gap-12 px-4 py-16 md:px-8 lg:grid-cols-2 lg:gap-20 lg:py-0">

          {/* Left — headline + description + CTA */}
          <div style={{ animation: "fade-in-up 0.7s ease forwards" }}>
            {/* Badge pill */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-(--color-border-subtle) bg-(--color-surface) px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-(--color-primary)">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--color-primary)" }}
                aria-hidden
              />
              The AI Dev OS for Every Team
            </div>

            <h1 className="mb-6 text-5xl font-bold leading-[1.07] tracking-tight md:text-6xl xl:text-7xl">
              <span className="block">One command.</span>
              <span className="nexus-gradient-text block">Your whole team,</span>
              <span className="nexus-gradient-text block">AI&#8209;ready.</span>
            </h1>

            <p
              className="mb-10 max-w-md text-lg text-(--color-muted)"
              style={{ lineHeight: 1.65 }}
            >
              Nexus wires{" "}
              <span className="font-semibold text-(--color-foreground)">{stats.agentCount} specialist agents</span>,{" "}
              <span className="font-semibold text-(--color-foreground)">{stats.gateCount} quality gates</span>, and every
              IDE your team uses — before your next coffee.{" "}
              <span className="font-medium text-(--color-foreground)">No config. No drift. No YAML.</span>
            </p>

            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link to="/docs/getting-started">Get Started →</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link to="/docs/cli-reference">CLI Reference</Link>
              </Button>
            </div>

            {/* npx copy-hint */}
            <p className="mt-6 font-mono text-xs text-(--color-muted)">
              $ npx @nexus/studio init
            </p>
          </div>

          {/* Right — live terminal demo */}
          <div
            className="relative"
            style={{ animation: "fade-in-up 0.7s ease 0.25s both" }}
          >
            {/* Halo glow behind the terminal */}
            <div
              aria-hidden
              className="absolute -inset-8 rounded-3xl opacity-[0.18] blur-3xl"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
              }}
            />
            <Terminal
              className="relative"
              stacks={TERMINAL_STACKS}
            />
          </div>

        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <section className="relative w-full border-y border-(--color-border) bg-(--color-surface)">
        {/* Gradient wash */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.05]"
          style={{
            background:
              "linear-gradient(90deg, var(--color-primary), var(--color-secondary))",
          }}
        />
        <div className="relative mx-auto grid max-w-5xl grid-cols-2 gap-px bg-(--color-border) sm:grid-cols-3 lg:grid-cols-5">
          <StatCard label="Specialist Agents"  value={stats.agentCount}       />
          <StatCard label="Domain Skills"      value={stats.skillCount}       />
          <StatCard label="Stack Profiles"     value={stats.profileCount}     />
          <StatCard label="Quality Gates"      value={stats.gateCount}        />
          <StatCard label="Workflow Commands"  value={stats.slashCommandCount}/>
        </div>
      </section>

      {/* ── Feature grid ─────────────────────────────────────────────────── */}
      <section className="w-full px-4 py-20 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div
            className="mb-12 text-center"
            style={{ animation: "fade-in-up 0.6s ease both" }}
          >
            <h2 className="mb-3 text-3xl font-bold tracking-tight">
              One source of truth for your{" "}
              <span className="nexus-gradient-text">entire dev team</span>
            </h2>
            <p className="text-(--color-muted)">
              One CLI. {stats.profileCount} framework profiles. No configuration required.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} {...f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Orchestration flow ────────────────────────────────────────────── */}
      <OrchestrationSection />
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────────────────────────── */

function StatCard({ label, value }: { label: string; value: number }) {
  const [ref, visible] = useIntersectionObserver();
  const animated = useCountUp(value, visible);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center gap-1.5 bg-(--color-surface) px-6 py-10"
    >
      <span
        className="text-4xl font-bold tracking-tight text-(--color-foreground)"
        style={visible ? { animation: "count-resolve 0.6s ease forwards" } : {}}
      >
        {animated}
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-(--color-muted)">
        {label}
      </span>
    </div>
  );
}

/* ── Terminal stack data ─────────────────────────────────────────────────────────────── */

const TERMINAL_STACKS: TerminalStack[] = [
  {
    label: "React + Vite",
    lines: [
      { command: "npx @nexus/studio init", delay: 500 },
      { prompt: "›", command: "◆  Nexus Studio", delay: 200 },
      { prompt: "›", command: "●  React + Vite + TypeScript detected", delay: 300 },
      { prompt: "›", command: "  Stack: Vite • TypeScript • Tailwind", delay: 250 },
      { prompt: "›", command: "◆  Profile → React + Vite (SPA — Enterprise)  ✔", delay: 300 },
      { prompt: "›", command: "◆  IDE → GitHub Copilot (VS Code)  ✔", delay: 350 },
      { prompt: "›", command: "⦈  Installing 15 agents, 23 skills...", delay: 600 },
      { prompt: "›", command: "✔  47 files installed", delay: 400 },
      { prompt: "›", command: "◆  All done. Run /status to see what's wired.", delay: 99999 },
    ],
  },
  {
    label: "Python / FastAPI",
    lines: [
      { command: "npx @nexus/studio init", delay: 500 },
      { prompt: "›", command: "◆  Nexus Studio", delay: 200 },
      { prompt: "›", command: "●  Python + FastAPI + SQLAlchemy detected", delay: 300 },
      { prompt: "›", command: "  Stack: FastAPI • Pydantic • SQLAlchemy", delay: 250 },
      { prompt: "›", command: "◆  Profile → Python / FastAPI  ✔", delay: 300 },
      { prompt: "›", command: "◆  IDE → Cursor  ✔", delay: 350 },
      { prompt: "›", command: "⦈  Installing 9 agents, 9 skills...", delay: 600 },
      { prompt: "›", command: "✔  39 files installed", delay: 400 },
      { prompt: "›", command: "◆  All done. Run /audit-security to harden your API.", delay: 99999 },
    ],
  },
  {
    label: "Vue + Nuxt",
    lines: [
      { command: "npx @nexus/studio init", delay: 500 },
      { prompt: "›", command: "◆  Nexus Studio", delay: 200 },
      { prompt: "›", command: "●  Vue 3 + Nuxt 3 + TypeScript detected", delay: 300 },
      { prompt: "›", command: "  Stack: Nuxt • Pinia • Vue Router 4", delay: 250 },
      { prompt: "›", command: "◆  Profile → Vue + Nuxt (Full-Stack)  ✔", delay: 300 },
      { prompt: "›", command: "◆  IDE → GitHub Copilot (VS Code)  ✔", delay: 350 },
      { prompt: "›", command: "⦈  Installing 11 agents, 8 skills...", delay: 600 },
      { prompt: "›", command: "✔  43 files installed", delay: 400 },
      { prompt: "›", command: "◆  All done. Run /status to see what's wired.", delay: 99999 },
    ],
  },
  {
    label: "NestJS API",
    lines: [
      { command: "npx @nexus/studio init", delay: 500 },
      { prompt: "›", command: "◆  Nexus Studio", delay: 200 },
      { prompt: "›", command: "●  NestJS + Prisma + TypeScript detected", delay: 300 },
      { prompt: "›", command: "  Stack: NestJS • Prisma • Passport", delay: 250 },
      { prompt: "›", command: "◆  Profile → NestJS API (Enterprise)  ✔", delay: 300 },
      { prompt: "›", command: "◆  IDE → Cursor  ✔", delay: 350 },
      { prompt: "›", command: "⦈  Installing 9 agents, 11 skills...", delay: 600 },
      { prompt: "›", command: "✔  41 files installed", delay: 400 },
      { prompt: "›", command: "◆  All done. Run /api-design to wire your first route.", delay: 99999 },
    ],
  },
];

const FEATURES = [
  {
    icon: Bot,
    title: "Specialist Agents",
    description:
      "React, Vue, Angular, Svelte, NestJS, Remix, Astro — 41 specialist agents, auto-routed by stack. You write code. Nexus picks the brain.",
  },
  {
    icon: Shield,
    title: "Quality Gates",
    description:
      "19 automated checks that hard-block bad code before CI does. Not suggestions. Gates.",
  },
  {
    icon: Plug2,
    title: "IDE-Native",
    description:
      "Copilot, Cursor, Windsurf, Claude Code. One command. All of them, configured.",
  },
  {
    icon: Zap,
    title: "Zero Config",
    description:
      "Stack detected. Agents installed. Team aligned. No YAML. No therapy bill.",
  },
] as const;

function FeatureCard({
  icon: Icon,
  title,
  description,
  index,
}: (typeof FEATURES)[number] & { index: number }) {
  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-(--color-border-subtle) bg-(--color-surface) p-7 transition-all duration-200 hover:border-(--color-border-strong) hover:bg-(--color-surface-raised) hover:shadow-[0_1px_3px_rgba(124,58,237,0.06),0_4px_16px_rgba(2,132,199,0.06)]"
      style={{
        animation: "fade-in-up 0.5s ease both",
        animationDelay: `${index * 0.08}s`,
      }}
    >
      {/* Per-card hover glow — violet in light mode, primary in dark */}
      <div
        aria-hidden
        className="absolute left-5 top-5 h-16 w-16 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-[0.2]"
        style={{ background: "var(--color-secondary)" }}
      />
      <Icon
        className="relative mb-5 h-6 w-6 text-(--color-primary)"
        aria-hidden
      />
      <h3 className="relative mb-2.5 text-base font-semibold text-(--color-foreground)">
        {title}
      </h3>
      <p className="relative text-sm leading-relaxed text-(--color-muted)">
        {description}
      </p>
    </div>
  );
}
