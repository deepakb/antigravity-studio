import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export interface TerminalLine {
  prompt?: string;
  command: string;
  /** ms to pause after this line finishes before moving to the next */
  delay?: number;
}

export interface TerminalStack {
  label: string;
  lines: TerminalLine[];
}

/**
 * Animated terminal — dual-stack cycling with tab pills, real CLI output,
 * typewriter character-by-character, macOS title bar.
 *
 * Pure React + CSS — no external animation library.
 * 🤖 @ui-design-engineer — ui-visual-patterns-2026, tailwind-design-system
 */
export function Terminal({
  stacks,
  className,
}: {
  stacks: TerminalStack[];
  className?: string;
}) {
  const [activeStack, setActiveStack] = useState(0);
  const [fading, setFading] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const [currentChars, setCurrentChars] = useState(0);
  const [pausing, setPausing] = useState(false);
  const cycleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lines = stacks[activeStack]?.lines ?? [];

  // Switch to a specific stack with a 300ms cross-fade
  function switchStack(index: number) {
    if (index === activeStack || fading) return;
    if (cycleTimer.current) clearTimeout(cycleTimer.current);
    setFading(true);
    setTimeout(() => {
      setActiveStack(index);
      setVisibleLines(0);
      setCurrentChars(0);
      setPausing(false);
      setFading(false);
    }, 300);
  }

  // Typewriter state machine
  useEffect(() => {
    if (visibleLines >= lines.length || fading) return;
    const line = lines[visibleLines]!;
    const isLastLine = visibleLines === lines.length - 1;

    if (pausing) {
      if (isLastLine) {
        // Hold 2 s on completed output, then auto-cycle to next stack
        const t = setTimeout(() => {
          cycleTimer.current = setTimeout(() => {
            switchStack((activeStack + 1) % stacks.length);
          }, 2000);
        }, 0);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => {
        setVisibleLines((v) => v + 1);
        setCurrentChars(0);
        setPausing(false);
      }, line.delay ?? 700);
      return () => clearTimeout(t);
    }

    if (currentChars >= line.command.length) {
      setPausing(true);
      return;
    }

    const t = setTimeout(() => setCurrentChars((c) => c + 1), 28);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleLines, currentChars, pausing, lines, fading]);

  // Cleanup on unmount
  useEffect(() => () => { if (cycleTimer.current) clearTimeout(cycleTimer.current); }, []);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-(--color-border)",
        "bg-(--color-surface) font-mono text-sm",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_8px_40px_rgba(0,0,0,0.5)]",
        "terminal-surface",
        className
      )}
    >
      {/* macOS-style title bar with stack tab pills */}
      <div className="flex items-center gap-2 border-b border-(--color-border) bg-(--color-surface-raised) px-4 py-3">
        <span className="h-3 w-3 shrink-0 rounded-full bg-[#ff5f57]" aria-hidden />
        <span className="h-3 w-3 shrink-0 rounded-full bg-[#febc2e]" aria-hidden />
        <span className="h-3 w-3 shrink-0 rounded-full bg-[#28c840]" aria-hidden />
        {/* Stack selector pills */}
        <div className="ml-4 flex gap-1.5">
          {stacks.map((stack, i) => (
            <button
              key={stack.label}
              onClick={() => switchStack(i)}
              aria-pressed={i === activeStack}
              className={cn(
                "rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest transition-all duration-200 cursor-pointer",
                i === activeStack
                  ? "terminal-tab-active"
                  : "text-(--color-muted) hover:text-(--color-foreground)"
              )}
            >
              {stack.label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-[10px] text-(--color-muted) opacity-50">
          nexus studio
        </span>
      </div>

      {/* Terminal output — cross-fades between stacks */}
      <div
        className="space-y-2 p-5 transition-opacity duration-300"
        style={{ opacity: fading ? 0 : 1 }}
      >
        {lines.map((line, i) => {
          const isDone    = i < visibleLines;
          const isCurrent = i === visibleLines;
          const isPending = i > visibleLines;

          // Semantic colouring based on real CLI output shape
          const isSuccess = line.command.startsWith("✔");
          const isHeader  = line.command.startsWith("◆  Nexus");
          const isStep    = line.command.startsWith("●");
          const isNote    = line.command.startsWith("  ");
          const isSpinner = line.command.startsWith("⠋");

          return (
            <div key={i} className={cn("flex gap-3", isPending && "invisible")}>
              <span
                className={cn(
                  "w-3 shrink-0 select-none",
                  line.prompt ? "text-(--color-muted)" : "terminal-prompt-dollar"
                )}
              >
                {line.prompt ?? "$"}
              </span>
              <span
                className={cn(
                  "break-all",
                  !line.prompt                        && "text-(--color-foreground)",
                  line.prompt && isSuccess            && "terminal-success",
                  line.prompt && isHeader             && "font-bold text-(--color-foreground)",
                  line.prompt && isStep               && "text-(--color-primary)",
                  line.prompt && isNote               && "text-(--color-muted) opacity-80",
                  line.prompt && isSpinner            && "text-(--color-amber)",
                  line.prompt && !isSuccess && !isHeader && !isStep && !isNote && !isSpinner
                                                      && "text-(--color-muted)",
                )}
              >
                {(isDone || isPending) && line.command}
                {isCurrent && (
                  <>
                    {line.command.slice(0, currentChars)}
                    <span className="ml-px animate-pulse text-(--color-primary)" aria-hidden>▌</span>
                  </>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
