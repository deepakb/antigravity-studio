import { forwardRef } from "react";
import { cn } from "@/lib/cn";

/**
 * Card system — composable container following the compound-component pattern.
 *
 * Usage:
 *   <Card>
 *     <CardHeader>
 *       <CardTitle>Heading</CardTitle>
 *       <CardDescription>Sub-text</CardDescription>
 *     </CardHeader>
 *     <CardContent>Body</CardContent>
 *     <CardFooter>Actions</CardFooter>
 *   </Card>
 *
 * 🤖 @ui-component-architect — Loading: shadcn-radix-ui, tailwind-design-system skills...
 */

export const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-(--color-border-subtle) bg-(--color-card) text-(--color-card-foreground)",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_2px_12px_rgba(0,0,0,0.35)] transition-colors",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-3 p-6", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("font-semibold leading-snug tracking-tight", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-(--color-muted)", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center gap-2 p-6 pt-0", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";
