import { Outlet } from "react-router";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { TableOfContents } from "@/components/docs/TableOfContents";
import { PrevNextNav } from "@/components/docs/PrevNextNav";

/**
 * Docs layout — 3-column on xl+:
 *   Left: sidebar navigation (lg+)
 *   Centre: main content (scrollable)
 *   Right: Table of Contents (xl+)
 * PrevNextNav is rendered below every page automatically.
 *
 * 🤖 @ui-design-engineer — ui-visual-patterns-2026
 */
export function DocsLayout() {
  return (
    <div className="mx-auto flex w-full max-w-screen-xl gap-10 px-4 py-10 md:px-8 md:py-12 xl:gap-14">
      {/* Sidebar — sticky, desktop only */}
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-24">
          <DocsSidebar />
        </div>
      </aside>

      {/* Main content + prev/next */}
      <main id="docs-main" className="min-w-0 flex-1 pt-1">
        <Outlet />
        <PrevNextNav />
      </main>

      {/* Table of contents — wide screens only */}
      <aside className="hidden w-48 shrink-0 xl:block">
        <div className="sticky top-24">
          <TableOfContents />
        </div>
      </aside>
    </div>
  );
}
