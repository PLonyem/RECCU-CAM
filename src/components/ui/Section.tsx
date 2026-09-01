import { type HTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const sectionVariants = cva("relative", {
  variants: {
    spacing: {
      none: "py-0",
      compact: "py-section-sm",
      default: "py-section",
      spacious: "py-section-lg",
    },
    tone: {
      default: "bg-transparent",
      surface: "bg-surface",
      muted: "bg-muted",
      brand: "bg-brand text-white",
    },
  },
  defaultVariants: { spacing: "default", tone: "default" },
});

export interface SectionProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {}

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ className, spacing, tone, ...props }, ref) => (
    <section ref={ref} className={cn(sectionVariants({ spacing, tone }), className)} {...props} />
  ),
);
Section.displayName = "Section";

export { sectionVariants };
