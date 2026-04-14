import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Link, useLocation } from "react-router";
import { cn } from "@/lib/cn";

/**
 * Mobile navigation drawer — Radix Dialog as a side-sheet.
 *
 * 🤖 @accessibility-auditor + @ui-component-architect
 *    Loading: accessibility-wcag, responsive-patterns skills...
 *
 * Direct Radix implementation (ADR-003) — no shadcn Sheet wrapper.
 * responsive-patterns skill Section 7 references SheetTrigger/SheetContent
 * which are shadcn abstractions — on direct Radix we build this ourselves.
 *
 * WCAG compliance:
 * - Focus trap: Radix Dialog handles focus locking automatically
 * - aria-expanded: Dialog.Trigger gets aria state from Radix
 * - Dismiss: Escape key + overlay click both close drawer (Radix default)
 */

const NAV_LINKS = [
  {
    label: "Introduction",
    items: [
      { label: "Getting Started", to: "/docs/getting-started" },
      { label: "Installation", to: "/docs/installation" },
    ],
  },
  {
    label: "Reference",
    items: [
      { label: "CLI Reference", to: "/docs/cli-reference" },
      { label: "Profiles", to: "/docs/profiles" },
      { label: "AI Agents", to: "/docs/agents" },
      { label: "Skills", to: "/docs/skills" },
      { label: "Quality Gates", to: "/docs/quality-gates" },
      { label: "Workflows", to: "/docs/workflows" },
    ],
  },
  {
    label: "Integrations",
    items: [{ label: "MCP Servers", to: "/docs/mcp" }],
  },
];

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const { pathname } = useLocation();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {/* Overlay */}
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-(--z-modal) bg-black/60 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
        />

        {/* Side drawer */}
        <Dialog.Content
          className={cn(
            "fixed left-0 top-0 z-(--z-modal) h-full w-72 bg-(--color-surface)",
            "border-r border-(--color-border) shadow-xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
            "duration-200 ease-out",
            "flex flex-col overflow-y-auto"
          )}
        >
          {/* Accessible title (visually hidden) */}
          <VisuallyHidden.Root>
            <Dialog.Title>Navigation menu</Dialog.Title>
          </VisuallyHidden.Root>

          {/* Drawer header */}
          <div className="flex h-14 items-center justify-between border-b border-(--color-border) px-4">
            <span className="nexus-gradient-text font-bold">Nexus Studio</span>
            <Dialog.Close
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md",
                "text-(--color-muted) transition-colors hover:bg-(--color-surface-raised) hover:text-(--color-foreground)",
                "focus-visible:outline-2 focus-visible:outline-(--color-nexus-blue)"
              )}
              aria-label="Close menu"
            >
              <XIcon className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {/* Nav links */}
          <nav aria-label="Mobile navigation" className="flex-1 px-3 py-4">
            {NAV_LINKS.map((section) => (
              <div key={section.label} className="mb-6">
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-widest text-(--color-muted)">
                  {section.label}
                </p>
                <ul className="space-y-0.5">
                  {section.items.map((item) => (
                    <li key={item.to}>
                      <Dialog.Close asChild>
                        <Link
                          to={item.to}
                          className={cn(
                            "block rounded-md px-3 py-2 text-sm transition-colors",
                            pathname === item.to
                              ? "bg-(--color-surface-raised) font-medium text-(--color-nexus-blue)"
                              : "text-(--color-muted) hover:bg-(--color-surface-raised) hover:text-(--color-foreground)"
                          )}
                        >
                          {item.label}
                        </Link>
                      </Dialog.Close>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
