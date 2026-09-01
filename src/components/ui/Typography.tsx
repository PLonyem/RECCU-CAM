import type { ElementType, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const headingStyles = {
  display: "text-display",
  h1: "text-h1",
  h2: "text-h2",
  h3: "text-h3",
  h4: "text-h4",
} as const;

interface HeadingProps extends HTMLAttributes<HTMLElement> {
  as?: "h1" | "h2" | "h3" | "h4";
  variant?: keyof typeof headingStyles;
}

export function Heading({ as: Component = "h2", className, variant = "h2", ...props }: HeadingProps) {
  return (
    <Component
      className={cn("font-display text-institutional", headingStyles[variant], className)}
      {...props}
    />
  );
}

const textStyles = {
  body: "text-body",
  lead: "text-lead",
  meta: "text-meta",
} as const;

interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  variant?: keyof typeof textStyles;
}

export function Text({ as: Component = "p", className, variant = "body", ...props }: TextProps) {
  return (
    <Component className={cn("text-muted-foreground", textStyles[variant], className)} {...props} />
  );
}
