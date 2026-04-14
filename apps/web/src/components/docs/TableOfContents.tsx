import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { cn } from "@/lib/cn";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

/**
 * Auto-parsed right-rail Table of Contents.
 * Reads h2/h3 headings from #docs-main, assigns IDs if missing,
 * highlights the active heading as the user scrolls.
 * Uses a retry strategy to handle lazy-loaded / data-loaded pages.
 *
 * 🤖 @ui-design-engineer — ui-visual-patterns-2026
 */
export function TableOfContents() {
  const { pathname } = useLocation();
  const [items, setItems] = useState<TocItem[]>([]);
  const [active, setActive] = useState("");
  const attemptsRef = useRef(0);

  // Re-parse headings on every route change — retry up to 5× with back-off
  // to handle lazy-loaded + data-loader pages that mount after route change.
  useEffect(() => {
    attemptsRef.current = 0;
    setItems([]);
    setActive("");

    function parseHeadings(): boolean {
      const container = document.getElementById("docs-main");
      if (!container) return false;

      const els = Array.from(
        container.querySelectorAll("h2, h3")
      ) as HTMLElement[];

      if (els.length === 0) return false;

      const parsed: TocItem[] = els
        .map((el) => {
          // Auto-assign id if missing
          if (!el.id) {
            el.id = (el.textContent ?? "")
              .toLowerCase()
              .trim()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "")
              .replace(/-{2,}/g, "-"); // collapse double-dashes
          }
          return {
            id: el.id,
            text: (el.textContent ?? "").trim(),
            level: parseInt(el.tagName.slice(1), 10),
          };
        })
        .filter((i) => i.id && i.text);

      if (parsed.length === 0) return false;
      setItems(parsed);
      return true;
    }

    const DELAYS = [80, 200, 400, 800, 1500];
    const timers: ReturnType<typeof setTimeout>[] = [];

    function tryParse(delayIndex: number) {
      const t = setTimeout(() => {
        attemptsRef.current += 1;
        if (parseHeadings()) return; // success
        if (delayIndex + 1 < DELAYS.length) {
          tryParse(delayIndex + 1);
        }
      }, DELAYS[delayIndex]);
      timers.push(t);
    }

    tryParse(0);
    return () => timers.forEach(clearTimeout);
  }, [pathname]);

  // Highlight active heading via IntersectionObserver
  useEffect(() => {
    if (items.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-16% 0% -68% 0%" }
    );

    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });

    return () => obs.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="On this page">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-(--color-muted)">
        On this page
      </p>
      <ul className="space-y-1.5">
        {items.map(({ id, text, level }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={cn(
                "block text-[13px] leading-snug transition-colors duration-150",
                level === 3 && "pl-3",
                active === id
                  ? "font-medium text-(--color-foreground)"
                  : "text-(--color-muted) hover:text-(--color-foreground)"
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
