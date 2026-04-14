import { useState } from "react";
import { useLoaderData } from "react-router";
import type { profilesLoader } from "./profiles.loader";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import { AGENT_META } from "@/data/agent-meta";
import { DocModal } from "@/components/docs/DocModal";

/**
 * Profiles catalogue — all architectural profiles with full agent/skill/gate details.
 *
 * 🤖 @frontend-specialist + @ui-component-architect
 *    Loading: react-patterns, tailwind-design-system skills...
 */

// ── Stack icons per profile ───────────────────────────────────────────────
const PROFILE_ICON: Record<string, string> = {
  "nextjs-fullstack":   "▲",
  "nextjs-frontend":    "▲",
  "react-vite":         "⚡",
  "node-api":           "🟢",
  "monorepo-root":      "📦",
  "monorepo-package":   "🧩",
  "angular-enterprise": "🅰️",
  "vue-nuxt":           "💚",
  "vue-vite":           "💚",
  "python-fastapi":     "🐍",
  "python-django":      "🐍",
  "java-spring":        "☕",
  "dotnet-api":         "🟣",
  "expo-mobile":        "📱",
  "flutter-mobile":     "💙",
  "nestjs-api":         "🐱",
  "svelte-kit":         "🔥",
  "remix-fullstack":    "💿",
  "astro-content":      "🚀",
};

// ── Script runner badges ──────────────────────────────────────────────────
const RUNNER_VARIANT: Record<string, "default" | "secondary" | "success" | "warning" | "muted"> = {
  node:    "default",
  python:  "warning",
  java:    "secondary",
  dotnet:  "secondary",
  flutter: "success",
};

export default function ProfilesPage() {
  const { profiles } = useLoaderData<typeof profilesLoader>();
  type ProfileData = typeof profiles[number];
  const [selected, setSelected] = useState<ProfileData | null>(null);

  return (
    <article className="w-full">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="mb-10">
        <Badge variant="muted" className="mb-3">Profiles</Badge>
        <h1 className="mb-3 text-4xl font-bold">Architectural Profiles</h1>
        <p className="text-(--color-muted)">
          {profiles.length} curated profiles that bundle the exact agents, skills, and quality
          gates for your stack. Selected once during{" "}
          <code className="rounded bg-(--color-surface-raised) px-1 font-mono text-sm text-(--color-nexus-blue)">
            studio init
          </code>{" "}
          — upgradeable any time via{" "}
          <code className="rounded bg-(--color-surface-raised) px-1 font-mono text-sm text-(--color-nexus-blue)">
            studio sync
          </code>.
        </p>
      </div>

      {/* ── Profile grid ─────────────────────────────────────────────── */}
      <section className="mb-12">
        <h2 className="mb-5 text-xl font-semibold" id="all-profiles">All Profiles</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onClick={() => setSelected(profile)}
            />
          ))}
        </div>
      </section>

      {/* ── Profile detail modal ──────────────────────────────────────── */}
      <DocModal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={
          selected ? (
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--color-surface-raised) text-lg">
                {PROFILE_ICON[selected.id] ?? "📦"}
              </span>
              <div>
                <p className="font-semibold leading-tight">{selected.label}</p>
                <code className="font-mono text-[11px] text-(--color-muted)">{selected.id}</code>
              </div>
            </div>
          ) : null
        }
      >
        {selected && (
          <div className="space-y-5">
            {/* Stats */}
            <div className="flex flex-wrap items-center gap-3">
              <StatChip label="agents" value={selected.agents.length} />
              <StatChip label="skills" value={selected.skills.length} />
              <StatChip label="gates" value={selected.scriptGates.length} />
              {selected.scriptRunners.map((r) => (
                <Badge key={r} variant={RUNNER_VARIANT[r] ?? "muted"} className="text-[10px]">{r}</Badge>
              ))}
              {selected.hint && (
                <Badge variant="secondary" className="text-[10px]">{selected.hint}</Badge>
              )}
            </div>

            {/* Agents */}
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-(--color-muted)">
                Included Agents ({selected.agents.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selected.agents.map((agentId) => {
                  const meta = AGENT_META[agentId];
                  return (
                    <span
                      key={agentId}
                      title={meta?.description}
                      className="flex items-center gap-1 rounded-full border border-(--color-border) bg-(--color-surface-raised) px-2.5 py-1 text-[11px] text-(--color-muted)"
                    >
                      {meta?.emoji && <span className="text-xs">{meta.emoji}</span>}
                      <code className="font-mono">{agentId}</code>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Skills */}
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-(--color-muted)">
                Skill Packs ({selected.skills.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selected.skills.map((skillId) => (
                  <code
                    key={skillId}
                    className="rounded border border-(--color-border) bg-(--color-surface-raised) px-2 py-0.5 font-mono text-[11px] text-(--color-nexus-blue)"
                  >
                    {skillId}
                  </code>
                ))}
              </div>
            </div>

            {/* Gates */}
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-(--color-muted)">
                Quality Gates ({selected.scriptGates.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selected.scriptGates.map((gate) => (
                  <span
                    key={gate}
                    className="rounded border border-(--color-border) bg-(--color-surface-raised) px-2 py-0.5 font-mono text-[11px] text-(--color-muted)"
                  >
                    {gate}
                  </span>
                ))}
              </div>
            </div>

            {/* Install command */}
            <div className="rounded-lg bg-(--color-surface-raised) px-4 py-3">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-(--color-muted)">Install this profile</p>
              <code className="font-mono text-sm text-(--color-nexus-blue)">
                npx @nexus/studio init --profile {selected.id}
              </code>
            </div>
          </div>
        )}
      </DocModal>

      {/* ── How profiles work ─────────────────────────────────────────── */}
      <section id="how-profiles-work">
        <h2 className="mb-4 text-xl font-semibold">How Profiles Work</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {HOW_IT_WORKS.map((step) => (
            <div
              key={step.title}
              className="rounded-xl border border-(--color-border-subtle) bg-(--color-surface) p-5"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-(--color-surface-raised) text-lg">
                {step.icon}
              </div>
              <p className="mb-1 font-semibold text-sm">{step.title}</p>
              <p className="text-xs text-(--color-muted) leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}

// ── ProfileCard sub-component ─────────────────────────────────────────────

type ProfileData = ReturnType<typeof import("./profiles.loader").profilesLoader>["profiles"][number];

function ProfileCard({
  profile,
  onClick,
}: {
  profile: ProfileData;
  onClick: () => void;
}) {
  const icon = PROFILE_ICON[profile.id] ?? "📦";

  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full rounded-xl border bg-(--color-card) text-left transition-colors duration-150",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_2px_12px_rgba(0,0,0,0.35)]",
        "border-(--color-border-subtle) hover:border-(--color-nexus-blue)",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-nexus-blue)",
        "px-5 py-5"
      )}
      aria-haspopup="dialog"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--color-surface-raised) text-lg">
            {icon}
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold leading-tight">{profile.label}</p>
              {profile.hint && (
                <Badge variant="secondary" className="text-[10px]">{profile.hint}</Badge>
              )}
            </div>
            <code className="mt-0.5 block font-mono text-[11px] text-(--color-muted)">
              {profile.id}
            </code>
          </div>
        </div>
        {/* Open indicator */}
        <svg
          className="mt-1 h-4 w-4 shrink-0 text-(--color-muted) transition-colors group-hover:text-(--color-nexus-blue)"
          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden
        >
          <path d="M15 3h6v6M14 10l6.1-6.1M9 21H3v-6M10 14l-6.1 6.1" />
        </svg>
      </div>

      {/* Stats row */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <StatChip label="agents" value={profile.agents.length} />
        <StatChip label="skills" value={profile.skills.length} />
        <StatChip label="gates" value={profile.scriptGates.length} />
        {profile.scriptRunners.map((r) => (
          <Badge key={r} variant={RUNNER_VARIANT[r] ?? "muted"} className="text-[10px]">{r}</Badge>
        ))}
      </div>
    </button>
  );
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <span className="flex items-center gap-1 text-xs text-(--color-muted)">
      <span className="font-semibold text-(--color-foreground)">{value}</span>
      {label}
    </span>
  );
}

// ── How it works data ──────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    icon: "🔍",
    title: "Auto-detected",
    description:
      "During init, Nexus Studio inspects your package.json, framework markers, and language files to recommend the best-fit profile automatically.",
  },
  {
    icon: "📦",
    title: "Bundled resources",
    description:
      "Each profile installs a precise set of agents, skill knowledge packs, and quality gates — no manual wiring needed.",
  },
  {
    icon: "🔄",
    title: "Always up-to-date",
    description:
      "Run studio sync to pull the latest agent and skill versions from the registry while preserving your local customizations.",
  },
];
