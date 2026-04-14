import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/cn";

/**
 * Button variants — CVA definition using brand tokens from globals.css @theme block.
 *
 * Token references use Tailwind v4 CSS variable shorthand: bg-(--var-name).
 * Focus ring is handled globally by `:focus-visible` in globals.css.
 *
 * 🤖 @ui-component-architect + @design-system-architect
 *    Loading: shadcn-radix-ui, tailwind-design-system skills...
 */
const buttonVariants = cva(
  // Base — layout, typography, transitions, a11y
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors select-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        /** Nexus blue→violet gradient — primary CTA */
        default:
          "nexus-gradient text-(--color-midnight) font-semibold shadow-sm hover:opacity-90",
        /** Elevated surface with border — secondary action */
        secondary:
          "bg-(--color-surface-raised) text-(--color-foreground) border border-(--color-border) hover:border-(--color-nexus-blue) hover:text-(--color-nexus-blue)",
        /** Bordered, transparent fill — tertiary / alternate */
        outline:
          "border border-(--color-border) bg-transparent text-(--color-foreground) hover:bg-(--color-surface) hover:border-(--color-nexus-blue)",
        /** No background — nav / inline actions */
        ghost:
          "text-(--color-muted) hover:bg-(--color-surface-raised) hover:text-(--color-foreground)",
        /** Danger confirmation */
        destructive:
          "bg-(--color-crimson) text-white shadow-sm hover:opacity-90",
        /** Inline link-style — no background, no padding */
        link: "text-(--color-nexus-blue) underline-offset-4 hover:underline h-auto px-0 py-0",
      },
      size: {
        sm:   "h-8 rounded-md px-4 text-xs",
        md:   "h-10 px-5 py-2.5",
        lg:   "h-11 px-8 text-base",
        icon: "h-10 w-10 shrink-0",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Render as the child element using Radix Slot (polymorphic).
   * Useful to wrap a Link component with Button styling:
   *   <Button asChild><Link to="/docs">Go to docs</Link></Button>
   */
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
