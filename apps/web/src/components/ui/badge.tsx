import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/**
 * Badge — small label used for categories, status indicators, and tags.
 *
 * Uses border-only styling (no fill) so it works on any background colour
 * without needing opacity utilities (which don't work on CSS vars in Tailwind v4).
 *
 * 🤖 @ui-component-architect — Loading: tailwind-design-system skill...
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        /** Nexus blue — primary entity labels */
        default:     "border-(--color-nexus-blue) text-(--color-nexus-blue)",
        /** Deep violet — secondary / alternate labels */
        secondary:   "border-(--color-deep-violet) text-(--color-deep-violet)",
        /** Emerald — success / active status */
        success:     "border-(--color-emerald) text-(--color-emerald)",
        /** Amber — warning / beta / experimental */
        warning:     "border-(--color-amber) text-(--color-amber)",
        /** Crimson — error / destructive / deprecated */
        destructive: "border-(--color-crimson) text-(--color-crimson)",
        /** Muted — neutral / count chips */
        muted:       "border-(--color-border) text-(--color-muted)",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}

export { badgeVariants };
