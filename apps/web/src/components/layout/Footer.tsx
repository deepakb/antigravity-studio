import { Link } from "react-router";

/**
 * Site footer — internal links use React Router Link (no full page reload).
 *
 * 🤖 @ui-design-engineer — Loading: tailwind-design-system skill...
 */
export function Footer() {
  return (
    <footer className="border-t border-(--color-border) bg-(--color-surface) px-4 py-12 md:px-8">
      <div className="mx-auto flex max-w-screen-xl flex-col items-center justify-between gap-4 text-sm text-(--color-muted) md:flex-row">
        <p>
          Built with{" "}
          <span className="nexus-gradient-text font-semibold">Nexus Studio</span>{" "}
          — Enterprise CLI Orchestrator
        </p>
        <nav aria-label="Footer navigation" className="flex gap-4">
          <a
            href="https://github.com/deepakbiswal/nexus-studio"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-(--color-foreground)"
          >
            GitHub
          </a>
          <Link
            to="/docs/getting-started"
            className="transition-colors hover:text-(--color-foreground)"
          >
            Docs
          </Link>
          <Link
            to="/docs/cli-reference"
            className="transition-colors hover:text-(--color-foreground)"
          >
            CLI
          </Link>
        </nav>
      </div>
    </footer>
  );
}
