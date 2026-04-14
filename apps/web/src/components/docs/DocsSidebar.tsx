import { Link, useLocation } from "react-router";
import {
  BookOpen,
  Download,
  Terminal,
  Layers,
  Bot,
  Zap,
  Shield,
  GitBranch,
  Plug,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}
interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Introduction",
    items: [
      { label: "Getting Started", to: "/docs/getting-started", icon: BookOpen },
      { label: "Installation",    to: "/docs/installation",    icon: Download },
    ],
  },
  {
    label: "Reference",
    items: [
      { label: "CLI Reference",  to: "/docs/cli-reference",  icon: Terminal  },
      { label: "Profiles",       to: "/docs/profiles",       icon: Layers    },
      { label: "AI Agents",      to: "/docs/agents",         icon: Bot       },
      { label: "Skills",         to: "/docs/skills",         icon: Zap       },
      { label: "Quality Gates",  to: "/docs/quality-gates",  icon: Shield    },
      { label: "Workflows",      to: "/docs/workflows",      icon: GitBranch },
    ],
  },
  {
    label: "Integrations",
    items: [
      { label: "MCP Servers", to: "/docs/mcp", icon: Plug },
    ],
  },
];

/**
 * Docs sidebar — icons + active left-border pill.
 *
 * 🤖 @ui-design-engineer — ui-visual-patterns-2026
 */
export function DocsSidebar() {
  const { pathname } = useLocation();

  return (
    <nav aria-label="Documentation navigation">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label} className="mb-6">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-(--color-muted)">
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
                      "flex items-center gap-2.5 rounded-r-md border-l-2 px-3 py-1.5 text-sm transition-colors duration-150",
                      active
                        ? "border-(--color-primary) bg-(--color-surface-raised) font-medium text-(--color-foreground)"
                        : "border-transparent text-(--color-muted) hover:border-(--color-border-subtle) hover:bg-(--color-surface-raised) hover:text-(--color-foreground)"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 transition-colors",
                        active ? "text-(--color-primary)" : "text-(--color-muted)"
                      )}
                      aria-hidden
                    />
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
