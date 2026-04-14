/**
 * UI component library barrel export.
 *
 * Import from here for all base components:
 *   import { Button, Badge, Card, CardHeader, Separator } from "@/components/ui";
 *
 * ADR-003: Radix UI primitives used directly (no shadcn CLI).
 */
export { Button, buttonVariants } from "./button";
export type { ButtonProps } from "./button";

export { Badge, badgeVariants } from "./badge";
export type { BadgeProps } from "./badge";

export { Terminal } from "./Terminal";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./card";

export { Separator } from "./separator";
