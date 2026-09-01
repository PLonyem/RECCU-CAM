import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: LucideIcon;
  className?: string;
}

export function EmptyState({ action, className, description, icon: Icon = Inbox, title }: EmptyStateProps) {
  return (
    <div className={cn("rounded-card border border-dashed border-border bg-muted/60 px-card py-12 text-center", className)}>
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-pill bg-surface text-forest shadow-sm" aria-hidden="true">
        <Icon className="h-5 w-5" />
      </span>
      <h2 className="mt-5 font-display text-h4 text-institutional">{title}</h2>
      <p className="mx-auto mt-2 max-w-reading text-body text-muted-foreground">{description}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
