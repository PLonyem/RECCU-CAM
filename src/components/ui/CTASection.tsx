import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

interface CTASectionProps {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
}

export function CTASection({ actions, className, description, eyebrow, title }: CTASectionProps) {
  return (
    <Section tone="brand" className={cn("overflow-hidden", className)}>
      <Container>
        <div className="grid gap-8 rounded-panel border border-white/10 bg-institutional p-8 shadow-raised sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-reading">
            {eyebrow && <p className="text-meta uppercase text-accent-300">{eyebrow}</p>}
            <h2 className="mt-3 font-display text-h2 text-white">{title}</h2>
            <p className="mt-4 text-lead text-primary-100">{description}</p>
          </div>
          {actions && <div className="flex flex-wrap gap-3 lg:justify-end">{actions}</div>}
        </div>
      </Container>
    </Section>
  );
}
