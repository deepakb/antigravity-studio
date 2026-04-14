import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { cn } from "@/lib/cn";
import { MobileNav } from "./MobileNav";
import { CommandPalette } from "@/components/docs/CommandPalette";

/**
 * activePrefix: the URL prefix that makes this link "active".
 * "/docs" is the fallback catch-all; more specific prefixes win first.
 */
const NAV_LINKS = [
  { label: "Docs", to: "/docs/getting-started", activePrefix: "/docs" },
  { label: "Agents", to: "/docs/agents", activePrefix: "/docs/agents" },
  { label: "CLI", to: "/docs/cli-reference", activePrefix: "/docs/cli-reference" },
];

type Theme = "dark" | "light" | "system";

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem("nexus-theme") as Theme) ?? "dark";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }
}

/**
 * Site header — brand logo, primary nav, theme toggle, GitHub link, mobile hamburger.
 *
 * 🤖 @ui-design-engineer + @accessibility-auditor
 *    Loading: tailwind-design-system, accessibility-wcag skills...
 *
 * Active state fix: each link carries its own activePrefix.
 * "/docs" only wins when no more-specific prefix matches — avoids all-active bug.
 */
export function Header() {
  const { pathname } = useLocation();
  const [theme, setTheme] = useState<Theme>(getStoredTheme);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("nexus-theme", theme);
  }, [theme]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function cycleTheme() {
    setTheme((prev) => {
      if (prev === "dark") return "light";
      if (prev === "light") return "system";
      return "dark";
    });
  }

  return (
    <>
      <header className="sticky top-0 z-(--z-overlay) border-b border-(--color-border) bg-(--color-background)/80 backdrop-blur-md">
        <div className="relative mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4 md:px-8">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 font-bold tracking-tight"
            aria-label="Nexus Studio home"
          >
            {/* Brand mark — The Node SVG logo */}
            <img
              src="/logo-mark.svg"
              alt=""
              aria-hidden
              className="h-7 w-7 shrink-0"
            />
            <span className="nexus-gradient-text text-lg">Nexus Studio</span>
          </Link>

          {/* Primary nav — desktop only */}
          <nav aria-label="Primary navigation" className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              // More-specific prefix wins: "Agents" and "CLI" match before generic "/docs"
              const isActive =
                link.activePrefix !== "/docs"
                  ? pathname.startsWith(link.activePrefix)
                  : pathname.startsWith("/docs") &&
                    !NAV_LINKS.slice(1).some((l) => pathname.startsWith(l.activePrefix));

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "text-(--color-nexus-blue)"
                      : "text-(--color-muted) hover:text-(--color-foreground)"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right-side actions */}
          <div className="flex items-center gap-2">
            {/* Cmd+K search trigger — desktop only */}
            <button
              onClick={() => setCmdOpen(true)}
              className={cn(
                "hidden h-8 items-center gap-2 rounded-md border border-(--color-border) px-3.5 md:flex",
                "text-xs text-(--color-muted) transition-colors",
                "hover:border-(--color-border-strong) hover:text-(--color-foreground)"
              )}
              aria-label="Open command palette"
            >
              <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <span>Search</span>
              <kbd className="ml-1 rounded border border-(--color-border) px-1 py-px text-[9px] font-sans">
                ⌘K
              </kbd>
            </button>
            {/* Theme toggle — cycles dark → light → system */}
            <button
              onClick={cycleTheme}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md",
                "text-(--color-muted) transition-colors",
                "hover:bg-(--color-surface-raised) hover:text-(--color-foreground)"
              )}
              aria-label={`Switch theme (current: ${theme})`}
              title={`Theme: ${theme}`}
            >
              {theme === "light" ? (
                <SunIcon className="h-4 w-4" />
              ) : theme === "dark" ? (
                <MoonIcon className="h-4 w-4" />
              ) : (
                <MonitorIcon className="h-4 w-4" />
              )}
            </button>

            {/* GitHub */}
            <a
              href="https://github.com/deepakbiswal/nexus-studio"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md",
                "text-(--color-muted) transition-colors",
                "hover:bg-(--color-surface-raised) hover:text-(--color-foreground)"
              )}
              aria-label="View Nexus Studio on GitHub"
            >
              <GitHubIcon className="h-4 w-4" />
            </a>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileOpen(true)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md md:hidden",
                "text-(--color-muted) transition-colors",
                "hover:bg-(--color-surface-raised) hover:text-(--color-foreground)"
              )}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
            >
              <MenuIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav drawer */}
      <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} />

      {/* Cmd+K command palette */}
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
    </>
  );
}

// ── Icon set ────────────────────────────────────────────────────────────────

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function MonitorIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}
