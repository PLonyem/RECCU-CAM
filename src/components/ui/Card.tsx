import { type HTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva("rounded-card border", {
  variants: {
    variant: {
      default: "border-border bg-surface shadow-card",
      muted: "border-transparent bg-muted shadow-none",
      outlined: "border-border bg-transparent shadow-none",
      elevated: "border-transparent bg-surface shadow-raised",
    },
    padding: {
      none: "p-0",
      default: "p-card",
      compact: "p-4",
      spacious: "p-8",
    },
  },
  defaultVariants: { variant: "default", padding: "none" },
});

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding, variant, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ padding, variant }), className)} {...props} />
  ),
);
Card.displayName = "Card";

export { cardVariants };
