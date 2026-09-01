import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-pill border px-3 py-1 text-meta uppercase tracking-wider",
  {
    variants: {
      variant: {
        default: "border-border bg-muted text-muted-foreground",
        primary: "border-primary-200 bg-primary-50 text-primary-800",
        accent: "border-accent-200 bg-gold-subtle text-gold-strong",
        success: "border-success/20 bg-success-subtle text-success",
        warning: "border-warning/20 bg-warning-subtle text-warning",
        error: "border-error/20 bg-error-subtle text-error",
        danger: "border-error/20 bg-error-subtle text-error",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
