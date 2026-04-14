import { forwardRef } from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@/lib/cn";

/**
 * Separator — thin rule using Radix UI Separator primitive.
 *
 * Radix handles the `role="separator"` / `role="none"` ARIA logic automatically
 * based on the `decorative` prop.
 *
 * 🤖 @ui-component-architect + @accessibility-auditor
 *    Loading: shadcn-radix-ui, accessibility-wcag skills...
 */
export const Separator = forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      "shrink-0 bg-(--color-border)",
      orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
      className
    )}
    {...props}
  />
));
Separator.displayName = SeparatorPrimitive.Root.displayName;
