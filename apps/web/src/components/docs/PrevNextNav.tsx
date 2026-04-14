import { Link, useLocation } from "react-router";
import { DOCS_PAGES } from "@/lib/docs-nav";

/**
 * Previous / Next page navigation — rendered in DocsLayout below <Outlet />.
 * Automatically resolves prev/next from the canonical DOCS_PAGES order.
 *
 * 🤖 @ui-design-engineer — ui-visual-patterns-2026
 */
export function PrevNextNav() {
  const { pathname } = useLocation();
  const idx = DOCS_PAGES.findIndex((p) => p.to === pathname);
  if (idx === -1) return null;

  const prev = idx > 0 ? DOCS_PAGES[idx - 1] : undefined;
  const next = idx < DOCS_PAGES.length - 1 ? DOCS_PAGES[idx + 1] : undefined;

  if (!prev && !next) return null;

  return (
    <div className="mt-12 flex items-center justify-between gap-4 border-t border-(--color-border) pt-8">
      {prev ? (
        <Link
          to={prev.to}
          className="group flex items-center gap-3 rounded-xl border border-(--color-border) bg-(--color-surface) px-5 py-4 text-sm transition-all duration-150 hover:border-(--color-border-strong) hover:bg-(--color-surface-raised)"
        >
          {/* Chevron left */}
          <svg
            className="h-4 w-4 shrink-0 text-(--color-muted) transition-transform duration-150 group-hover:-translate-x-1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          <div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-(--color-muted)">
              Previous
            </div>
            <div className="font-medium text-(--color-foreground)">
              {prev.label}
            </div>
          </div>
        </Link>
      ) : (
        <div />
      )}

      {next && (
        <Link
          to={next.to}
          className="group ml-auto flex items-center gap-3 rounded-xl border border-(--color-border) bg-(--color-surface) px-5 py-4 text-right text-sm transition-all duration-150 hover:border-(--color-border-strong) hover:bg-(--color-surface-raised)"
        >
          <div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-(--color-muted)">
              Next
            </div>
            <div className="font-medium text-(--color-foreground)">
              {next.label}
            </div>
          </div>
          {/* Chevron right */}
          <svg
            className="h-4 w-4 shrink-0 text-(--color-muted) transition-transform duration-150 group-hover:translate-x-1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>
      )}
    </div>
  );
}
