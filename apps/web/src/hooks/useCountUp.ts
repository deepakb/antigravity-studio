import { useEffect, useState } from "react";

/**
 * Animates a number from 0 → `target` over `duration` ms using ease-out cubic.
 * Only starts when `enabled` flips to true (wire to IntersectionObserver).
 */
export function useCountUp(
  target: number,
  enabled: boolean,
  duration = 1400
): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let startTime: number | null = null;
    let rafId: number;

    function easeOutCubic(t: number): number {
      return 1 - Math.pow(1 - t, 3);
    }

    function tick(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setValue(Math.round(easeOutCubic(progress) * target));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, enabled, duration]);

  return value;
}
