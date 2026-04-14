import { useEffect, useState, useCallback } from "react";
import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import { cn } from "@/lib/cn";

/**
 * Syntax-highlighted code block powered by Shiki.
 *
 * Finding #12 fix: codeToHtml from the "shiki" barrel import caused Vite to
 * emit 250+ separate language grammar chunks. Using createHighlighterCore with
 * explicit static lang imports limits Vite to only the languages we actually
 * use — reducing from 250+ chunks to ~6 lang chunks.
 *
 * 🤖 @ui-component-architect + @frontend-specialist
 *    Loading: react-patterns, tailwind-design-system skills...
 */

// ── Singleton highlighter ─────────────────────────────────────────────────
// Created once and shared across ALL CodeBlock instances on the page.
// Each lang import is a static reference → Vite only bundles these 6 langs.
type HighlighterCore = Awaited<ReturnType<typeof createHighlighterCore>>;
let _highlighterPromise: Promise<HighlighterCore> | null = null;

function getHighlighter(): Promise<HighlighterCore> {
  if (!_highlighterPromise) {
    _highlighterPromise = createHighlighterCore({
      themes: [import("shiki/themes/github-dark-dimmed.mjs")],
      langs: [
        import("shiki/langs/bash.mjs"),
        import("shiki/langs/typescript.mjs"),
        import("shiki/langs/tsx.mjs"),
        import("shiki/langs/json.mjs"),
        import("shiki/langs/yaml.mjs"),
        import("shiki/langs/shellscript.mjs"),
      ],
      engine: createOnigurumaEngine(import("shiki/wasm")),
    });
  }
  return _highlighterPromise;
}

interface CodeBlockProps {
  code: string;
  lang?: string;
  filename?: string;
  showLineNumbers?: boolean;
  className?: string;
}

// Nexus brand Shiki theme — maps to our CSS tokens
const NEXUS_THEME = "github-dark-dimmed";

export function CodeBlock({
  code,
  lang = "bash",
  filename,
  showLineNumbers = false,
  className,
}: CodeBlockProps) {
  const [html, setHtml] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function highlight() {
      try {
        const hl = await getHighlighter();
        // Fall back gracefully for langs not in our bundle (e.g. "python", "text")
        const resolvedLang = hl.getLoadedLanguages().includes(lang) ? lang : "bash";
        // codeToHtml is synchronous once the highlighter is initialised
        const result = hl.codeToHtml(code.trim(), {
          lang: resolvedLang,
          theme: NEXUS_THEME,
        });
        if (!cancelled) {
          setHtml(result);
          setLoading(false);
        }
      } catch {
        // Fallback: plain text render
        if (!cancelled) {
          setHtml("");
          setLoading(false);
        }
      }
    }

    highlight();
    return () => {
      cancelled = true;
    };
  }, [code, lang, showLineNumbers]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface)",
        className
      )}
    >
      {/* Header bar */}
      {(filename || lang) && (
        <div className="flex items-center justify-between border-b border-(--color-border) px-4 py-2">
          <span className="font-mono text-xs text-(--color-muted)">
            {filename ?? lang}
          </span>
          <span className="rounded-full border border-(--color-border) px-2 py-0.5 font-mono text-[10px] uppercase text-(--color-muted)">
            {lang}
          </span>
        </div>
      )}

      {/* Copy button — visible on hover */}
      <button
        onClick={handleCopy}
        className={cn(
          "absolute right-3 top-2.5 z-10 flex items-center gap-1 rounded-md px-2 py-1",
          "text-xs text-(--color-muted) transition-all",
          "border border-(--color-border) bg-(--color-surface)",
          "opacity-0 group-hover:opacity-100",
          filename && "top-10",
          copied && "text-(--color-success)"
        )}
        aria-label={copied ? "Copied!" : "Copy code"}
      >
        {copied ? (
          <>
            <CheckIcon className="h-3.5 w-3.5" />
            Copied
          </>
        ) : (
          <>
            <CopyIcon className="h-3.5 w-3.5" />
            Copy
          </>
        )}
      </button>

      {/* Code content */}
      <div className="overflow-x-auto">
        {loading ? (
          <pre className="p-4 font-mono text-sm text-(--color-muted)">
            <code>{code.trim()}</code>
          </pre>
        ) : html ? (
          <div
            className={cn(
              "shiki-wrapper [&_pre]:m-0 [&_pre]:overflow-x-auto [&_pre]:p-4",
              "[&_pre]:bg-transparent! [&_pre]:font-mono [&_pre]:text-sm",
              showLineNumbers &&
                "[&_.line]:before:mr-4 [&_.line]:before:inline-block [&_.line]:before:w-4 [&_.line]:before:text-right [&_.line]:before:text-(--color-muted) [&_.line]:before:content-[counter(step)] [&_pre]:counter-reset-[step] [&_code_.line]:counter-increment-[step]"
            )}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki produces sanitized HTML
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          // Plain fallback
          <pre className="overflow-x-auto p-4 font-mono text-sm text-(--color-muted)">
            <code>{code.trim()}</code>
          </pre>
        )}
      </div>
    </div>
  );
}

// ── Icon helpers ──────────────────────────────────────────────────────────

function CopyIcon({ className }: { className?: string }) {
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
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
