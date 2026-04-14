---
name: ui-visual-patterns-2026
description: "2026 UI aesthetic vocabulary with production-ready code — ambient hero backgrounds, animated terminal components, feature grids, glassmorphic cards, dot-grid overlays, glow effects, TOC, prev/next navigation, and command palette. Reference: Linear, Vercel, Resend, Stripe."
---

# SKILL: UI Visual Patterns (2026)

## Overview
Production-ready code recipes for the visual patterns that define **great UI in 2026**. These are not design theory — each section contains working Tailwind v4 + React code you can drop directly into a project.

**Reference sites this skill encodes**: Linear, Vercel, Resend, Stripe, Raycast, Planetscale, Liveblocks.

> **Tailwind v4 reminder**: `bg-(--color-var)` syntax, `@theme {}` tokens, `[data-theme="dark"]` — never `.dark` class, never bare HSL.

---

## The Three-Layer Model

Every great UI surface has exactly three layers stacked on top of each other:

```
┌─────────────────────────────────────┐
│  3. Motion layer                    │  ← entrances, hovers, active states
│  2. Surface layer                   │  ← card border, backdrop-blur, elevation
│  1. Ambient layer  ◄── most missed  │  ← background atmosphere, glow, grid
└─────────────────────────────────────┘
```

A UI is "flat" when layer 1 is missing. That's what makes 2023-era sites look dated in 2026.

---

## 1. Ambient Hero Background

The signature of every great docs/marketing site. Pure CSS — zero runtime cost.

```tsx
// HeroAmbient.tsx — drop behind any hero section
export function HeroAmbient() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `radial-gradient(circle, var(--color-border) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />
      {/* Primary glow — brand color, center */}
      <div
        className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-20 blur-[120px]"
        style={{ background: 'var(--color-primary)' }}
      />
      {/* Secondary glow — offset for depth */}
      <div
        className="absolute right-1/4 top-1/3 h-[400px] w-[400px] rounded-full opacity-10 blur-[80px]"
        style={{ background: 'var(--color-secondary)' }}
      />
      {/* Fade to background at bottom — clean transition into content */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-(--color-background) to-transparent" />
    </div>
  );
}

// Usage — wrap hero section in relative + overflow-hidden
<section className="relative w-full overflow-hidden px-4 py-24 text-center">
  <HeroAmbient />
  <div className="relative z-10 mx-auto max-w-4xl">
    {/* hero content — z-10 ensures it sits above ambient */}
  </div>
</section>
```

**Tuning guide:**
| Effect | Adjust | Impact |
|---|---|---|
| Subtler grid | `opacity-[0.08]` | More refined, less noise |
| Tighter dots | `backgroundSize: '20px 20px'` | Denser grid |
| Wider glow | `w-[1200px] blur-[160px]` | More atmospheric |
| No secondary glow | Remove second div | Cleaner, more focused |

---

## 2. Animated Terminal Component

The single highest-impact hero element for developer tools. Typewriter + shell aesthetic.

```tsx
// Terminal.tsx
import { useEffect, useRef, useState } from 'react';

interface TerminalProps {
  lines: { prompt?: string; command: string; delay?: number }[];
  className?: string;
}

export function Terminal({ lines, className }: TerminalProps) {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [currentChars, setCurrentChars] = useState<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    // Type current line char by char
    if (visibleLines < lines.length) {
      const target = lines[visibleLines].command.length;
      intervalRef.current = setInterval(() => {
        setCurrentChars((c) => {
          if (c >= target) {
            clearInterval(intervalRef.current);
            // Pause then reveal next line
            setTimeout(() => {
              setVisibleLines((l) => l + 1);
              setCurrentChars(0);
            }, lines[visibleLines].delay ?? 600);
            return c;
          }
          return c + 1;
        });
      }, 35); // 35ms per character ≈ fast typist feel
    }
    return () => clearInterval(intervalRef.current);
  }, [visibleLines, lines]);

  return (
    <div
      className={[
        'relative overflow-hidden rounded-xl border border-(--color-border)',
        'bg-(--color-surface) font-mono text-sm shadow-[0_0_40px_rgba(0,0,0,0.4)]',
        className,
      ].join(' ')}
    >
      {/* macOS traffic light bar */}
      <div className="flex items-center gap-2 border-b border-(--color-border) px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-xs text-(--color-muted)">terminal</span>
      </div>

      {/* Lines */}
      <div className="space-y-1 p-4">
        {lines.slice(0, visibleLines).map((line, i) => (
          <div key={i} className="flex gap-2">
            <span className="select-none text-(--color-success)">
              {line.prompt ?? '$'}
            </span>
            <span className="text-(--color-foreground)">{line.command}</span>
          </div>
        ))}
        {/* Currently typing line */}
        {visibleLines < lines.length && (
          <div className="flex gap-2">
            <span className="select-none text-(--color-success)">
              {lines[visibleLines].prompt ?? '$'}
            </span>
            <span className="text-(--color-foreground)">
              {lines[visibleLines].command.slice(0, currentChars)}
              <span className="animate-pulse">▌</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Usage
<Terminal
  lines={[
    { command: 'npx @nexus/studio init', delay: 800 },
    { command: '✔ Detected: React + Vite + TypeScript', prompt: '›', delay: 400 },
    { command: '✔ Installing 33 specialist agents...', prompt: '›', delay: 600 },
    { command: '✔ Generating .agent/ context files...', prompt: '›', delay: 400 },
    { command: '✔ Done. Studio ready.', prompt: '›', delay: 99999 },
  ]}
  className="mx-auto max-w-xl"
/>
```

---

## 3. Feature Grid

The "Why use this?" section. 4-column grid of cards with icon + title + description. Pattern from Vercel, Linear.

```tsx
// FeatureGrid.tsx
import { type LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureGrid({ features }: { features: Feature[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {features.map(({ icon: Icon, title, description }) => (
        <div
          key={title}
          className="group relative overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface) p-6 transition-colors hover:border-(--color-border-strong) hover:bg-(--color-surface-raised)"
        >
          {/* Hover glow — subtle radial behind icon */}
          <div
            aria-hidden
            className="absolute left-6 top-6 h-16 w-16 rounded-full opacity-0 blur-xl transition-opacity group-hover:opacity-20"
            style={{ background: 'var(--color-primary)' }}
          />
          <Icon className="relative mb-3 h-5 w-5 text-(--color-primary)" aria-hidden />
          <h3 className="relative mb-1 text-sm font-semibold text-(--color-foreground)">
            {title}
          </h3>
          <p className="relative text-sm leading-relaxed text-(--color-muted)">
            {description}
          </p>
        </div>
      ))}
    </div>
  );
}
```

**What makes this 2026 quality:**
- `group` hover: border intensifies + bg lifts subtly — no jarring color jump
- Per-card glow appears on hover — ambient layer at surface scope, not page scope
- `relative overflow-hidden` traps the glow inside the card boundary

---

## 4. Glassmorphic Card

For overlays, modals, callout panels, or premium content areas.

```tsx
// GlassCard.tsx — works on dark backgrounds with a gradient or image behind it
export function GlassCard({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={[
        'rounded-2xl border border-white/10',
        'bg-white/5 backdrop-blur-xl',
        'shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)]',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}
```

**When to use:** On hero sections with a gradient/image background. **Not** on plain dark surfaces — glass needs something to blur. On flat dark backgrounds, use a regular bordered card instead.

---

## 5. Stats Bar

Upgrade from plain numbers to a section with visual weight.

```tsx
// StatsBar.tsx
interface Stat { label: string; value: string | number; suffix?: string }

export function StatsBar({ stats }: { stats: Stat[] }) {
  return (
    <div className="relative border-y border-(--color-border) bg-(--color-surface)">
      {/* Subtle gradient wash */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-5"
        style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))' }}
      />
      <div className="relative mx-auto grid max-w-5xl grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-5">
        {stats.map(({ label, value, suffix }) => (
          <div key={label} className="flex flex-col items-center gap-1 px-6 py-10">
            <span className="text-3xl font-bold tracking-tight text-(--color-foreground)">
              {value}
              {suffix && <span className="text-xl text-(--color-primary)">{suffix}</span>}
            </span>
            <span className="text-xs font-medium uppercase tracking-widest text-(--color-muted)">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 6. Docs Sidebar (2026 Quality)

Active state = left border pill + bg lift. Icons before labels.

```tsx
// DocsSidebar.tsx
import { type LucideIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { cn } from '@/lib/cn';

interface NavItem { label: string; to: string; icon: LucideIcon }
interface NavSection { label: string; items: NavItem[] }

export function DocsSidebar({ sections }: { sections: NavSection[] }) {
  const { pathname } = useLocation();
  return (
    <nav aria-label="Documentation navigation">
      {sections.map((section) => (
        <div key={section.label} className="mb-6">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-(--color-muted)">
            {section.label}
          </p>
          <ul className="space-y-0.5">
            {section.items.map(({ label, to, icon: Icon }) => {
              const active = pathname === to;
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className={cn(
                      'flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors',
                      active
                        ? 'border-l-2 border-(--color-primary) bg-(--color-surface-raised) font-medium text-(--color-foreground) pl-[10px]'
                        : 'text-(--color-muted) hover:bg-(--color-surface-raised) hover:text-(--color-foreground)'
                    )}
                  >
                    <Icon className={cn('h-3.5 w-3.5 shrink-0', active ? 'text-(--color-primary)' : '')} aria-hidden />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
```

---

## 7. Right-Rail Table of Contents (TOC)

Auto-parses headings. Highlights active section on scroll. Sticky in 3-column docs layout.

```tsx
// TableOfContents.tsx
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

interface TocItem { id: string; text: string; level: number }

function useActiveHeading(ids: string[]): string {
  const [active, setActive] = useState('');
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) { setActive(entry.target.id); break; }
        }
      },
      { rootMargin: '-20% 0% -70% 0%' }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [ids]);
  return active;
}

export function TableOfContents({ items }: { items: TocItem[] }) {
  const active = useActiveHeading(items.map((i) => i.id));
  return (
    <nav aria-label="On this page" className="sticky top-24">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-(--color-muted)">
        On this page
      </p>
      <ul className="space-y-1">
        {items.map(({ id, text, level }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={cn(
                'block text-sm leading-snug transition-colors',
                level === 3 && 'pl-3',
                active === id
                  ? 'font-medium text-(--color-foreground)'
                  : 'text-(--color-muted) hover:text-(--color-foreground)'
              )}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

**DocsLayout 3-column wiring:**
```tsx
<div className="mx-auto flex w-full max-w-screen-xl gap-8 px-4 py-8 md:px-8">
  <aside className="hidden w-56 shrink-0 lg:block">
    <DocsSidebar sections={NAV_SECTIONS} />
  </aside>
  <main className="min-w-0 flex-1">
    <Outlet />
  </main>
  <aside className="hidden w-48 shrink-0 xl:block">
    <TableOfContents items={tocItems} />
  </aside>
</div>
```

---

## 8. Prev / Next Page Navigation

Landmark at the bottom of every docs page. One component, data-driven.

```tsx
// PrevNextNav.tsx
import { Link } from 'react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PageLink { label: string; to: string }

export function PrevNextNav({ prev, next }: { prev?: PageLink; next?: PageLink }) {
  return (
    <div className="mt-16 flex items-center justify-between gap-4 border-t border-(--color-border) pt-8">
      {prev ? (
        <Link
          to={prev.to}
          className="group flex items-center gap-3 rounded-xl border border-(--color-border) bg-(--color-surface) px-5 py-4 text-sm transition-colors hover:border-(--color-border-strong) hover:bg-(--color-surface-raised)"
        >
          <ChevronLeft className="h-4 w-4 text-(--color-muted) transition-transform group-hover:-translate-x-0.5" />
          <div>
            <div className="text-[10px] uppercase tracking-widest text-(--color-muted)">Previous</div>
            <div className="font-medium text-(--color-foreground)">{prev.label}</div>
          </div>
        </Link>
      ) : <div />}
      {next && (
        <Link
          to={next.to}
          className="group flex items-center gap-3 rounded-xl border border-(--color-border) bg-(--color-surface) px-5 py-4 text-sm transition-colors hover:border-(--color-border-strong) hover:bg-(--color-surface-raised) ml-auto text-right"
        >
          <div>
            <div className="text-[10px] uppercase tracking-widest text-(--color-muted)">Next</div>
            <div className="font-medium text-(--color-foreground)">{next.label}</div>
          </div>
          <ChevronRight className="h-4 w-4 text-(--color-muted) transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
```

---

## 9. Command Palette (Cmd+K)

Radix Dialog + fuzzy-filtered page list. The signature feature of great docs sites.

```tsx
// CommandPalette.tsx
import { useState, useEffect, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useNavigate } from 'react-router';
import { Search } from 'lucide-react';
import { cn } from '@/lib/cn';

interface CommandItem { label: string; to: string; section: string }

export function CommandPalette({ items }: { items: CommandItem[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const filtered = useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter((i) => i.label.toLowerCase().includes(q) || i.section.toLowerCase().includes(q));
  }, [query, items]);

  function select(to: string) {
    navigate(to);
    setOpen(false);
    setQuery('');
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-[20vh] z-[201] w-full max-w-xl -translate-x-1/2 rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <VisuallyHidden.Root>
            <Dialog.Title>Command Palette</Dialog.Title>
          </VisuallyHidden.Root>

          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-(--color-border) px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-(--color-muted)" aria-hidden />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search docs..."
              className="flex-1 bg-transparent text-sm text-(--color-foreground) placeholder:text-(--color-muted) focus:outline-none"
            />
            <kbd className="rounded border border-(--color-border) px-1.5 py-0.5 text-[10px] text-(--color-muted)">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <ul className="max-h-72 overflow-y-auto p-2" role="listbox">
            {filtered.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-(--color-muted)">
                No results for "{query}"
              </li>
            ) : (
              filtered.map((item) => (
                <li key={item.to}>
                  <button
                    onClick={() => select(item.to)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-(--color-surface-raised) focus-visible:bg-(--color-surface-raised) focus-visible:outline-none"
                    role="option"
                  >
                    <span className="text-(--color-foreground)">{item.label}</span>
                    <span className="text-xs text-(--color-muted)">{item.section}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

---

## Reference Patterns Decoded

### What makes Linear's UI great:
- Dot grid on all hero surfaces (subtle, 12-20px spacing)
- Borders are `1px solid` at 6-8% opacity on dark — barely visible, creates edge definition
- Typography: tight tracking (`-0.02em`) on all headings, nothing loose
- Hover states: `8ms` bg transitions — so fast they feel instantaneous
- Icons: always 14–16px, never 20px+ in body content

### What makes Vercel's docs great:
- 3-column layout: sidebar + content + TOC — users always know where they are
- Active sidebar item: left border + bg lift — not just color change
- Code blocks: filename label above, language badge top-right, line numbers for long blocks
- Prev/Next: always present, treated as a first-class navigation element

### What makes Resend's homepage great:
- One animated terminal in the hero — shows the product in 5 seconds
- Stats bar with gradient wash behind the numbers
- Feature grid: 4 cards, icon + 2 lines — scannable in 10 seconds
- Zero illustrations — code IS the illustration

## Skills to Load
- `tailwind-design-system`
- `shadcn-radix-ui`
- `responsive-patterns`
- `accessibility-wcag`
- `framer-motion`
