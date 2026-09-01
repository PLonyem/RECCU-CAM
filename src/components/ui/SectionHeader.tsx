import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  as?: "h1" | "h2" | "h3";
  className?: string;
}

export function SectionHeader({
  align = "left",
  as: Heading = "h2",
  className,
  eyebrow,
  subtitle,
  title,
}: SectionHeaderProps) {
  return (
    <header className={cn(align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className="mb-3 text-meta uppercase text-gold-strong">
          {eyebrow}
        </p>
      )}
      <Heading className="font-display text-h2 text-institutional">{title}</Heading>
      {subtitle && (
        <p className={cn("mt-4 max-w-reading text-body text-muted-foreground", align === "center" && "mx-auto")}>
          {subtitle}
        </p>
      )}
    </header>
  );
}
