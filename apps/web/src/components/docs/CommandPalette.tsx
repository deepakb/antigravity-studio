import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useNavigate } from "react-router";
import { DOCS_PAGES } from "@/lib/docs-nav";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Cmd+K / Ctrl+K command palette — fuzzy-filtered docs pages.
 * Uses existing @radix-ui/react-dialog (no new deps).
 *
 * 🤖 @ui-design-engineer — ui-visual-patterns-2026
 */
export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOpenChange]);

  // Reset query when closed
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return DOCS_PAGES;
    const q = query.toLowerCase();
    return DOCS_PAGES.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.section.toLowerCase().includes(q)
    );
  }, [query]);

  function select(to: string) {
    navigate(to);
    onOpenChange(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm data-[state=open]:animate-[fade-in_150ms_ease] data-[state=closed]:animate-[fade-in_100ms_ease_reverse]" />
        <Dialog.Content
          className="fixed left-1/2 top-[18vh] z-[201] w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-[0_24px_80px_rgba(0,0,0,0.6)] data-[state=open]:animate-[fade-in-up_150ms_ease] data-[state=closed]:animate-[fade-in_100ms_ease_reverse]"
          aria-describedby={undefined}
        >
          <VisuallyHidden.Root>
            <Dialog.Title>Command Palette</Dialog.Title>
          </VisuallyHidden.Root>

          {/* Search row */}
          <div className="flex items-center gap-3 border-b border-(--color-border) px-4 py-3.5">
            {/* Search icon */}
            <svg
              className="h-4 w-4 shrink-0 text-(--color-muted)"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search docs…"
              className="w-auto flex-1 border-0 bg-transparent py-1 text-sm text-(--color-foreground) placeholder:text-(--color-muted) focus:outline-none"
            />
            <kbd className="rounded border border-(--color-border) px-1.5 py-0.5 text-[10px] text-(--color-muted)">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <ul className="max-h-72 overflow-y-auto p-2" role="listbox">
            {filtered.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-(--color-muted)">
                No results for &ldquo;{query}&rdquo;
              </li>
            ) : (
              filtered.map((page) => (
                <li key={page.to}>
                  <button
                    onClick={() => select(page.to)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors duration-100 hover:bg-(--color-surface-raised) focus-visible:bg-(--color-surface-raised) focus-visible:outline-none"
                    role="option"
                    aria-selected={false}
                  >
                    <span className="text-(--color-foreground)">{page.label}</span>
                    <span className="text-xs text-(--color-muted)">{page.section}</span>
                  </button>
                </li>
              ))
            )}
          </ul>

          {/* Footer hint */}
          <div className="flex items-center gap-3 border-t border-(--color-border) px-4 py-2.5">
            <span className="text-[11px] text-(--color-muted)">
              <kbd className="rounded border border-(--color-border) px-1 py-0.5">↑↓</kbd>
              {" "}navigate
            </span>
            <span className="text-[11px] text-(--color-muted)">
              <kbd className="rounded border border-(--color-border) px-1 py-0.5">↵</kbd>
              {" "}open
            </span>
            <span className="ml-auto text-[11px] text-(--color-muted)">
              <kbd className="rounded border border-(--color-border) px-1 py-0.5">ESC</kbd>
              {" "}close
            </span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
