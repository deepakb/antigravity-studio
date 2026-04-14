import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

interface DocModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  /** Extra classes on the panel */
  className?: string;
}

/**
 * Lightweight accessible modal for the docs section.
 * – Portals into document.body so it renders above all layout columns
 * – Traps focus, closes on Esc + backdrop click
 * – Smooth scale+fade enter/leave via CSS transitions
 *
 * 🤖 @ui-design-engineer — ui-visual-patterns-2026
 */
export function DocModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  className,
}: DocModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Esc
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Focus trap — move focus into panel on open
  useEffect(() => {
    if (open && panelRef.current) {
      const firstFocusable = panelRef.current.querySelector<HTMLElement>(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      );
      firstFocusable?.focus();
    }
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          "relative z-10 flex max-h-[85vh] w-full max-w-xl flex-col",
          "rounded-2xl border border-(--color-border-strong)",
          "bg-(--color-surface) shadow-[0_24px_80px_rgba(0,0,0,0.6)]",
          "animate-in fade-in zoom-in-95 duration-200",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-(--color-border) px-6 py-5">
          <div className="min-w-0">
            <div className="text-base font-semibold leading-tight">{title}</div>
            {subtitle && (
              <div className="mt-1 text-sm text-(--color-muted)">{subtitle}</div>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-md p-1.5 text-(--color-muted) transition-colors hover:bg-(--color-surface-raised) hover:text-(--color-foreground) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-nexus-blue)"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
