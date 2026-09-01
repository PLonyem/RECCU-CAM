import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface IconFeatureProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function IconFeature({ className, description, icon: Icon, title }: IconFeatureProps) {
  return (
    <Card padding="default" className={cn("h-full", className)}>
      <span className="grid h-11 w-11 place-items-center rounded-control bg-primary-50 text-forest" aria-hidden="true">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-5 font-display text-h4 text-institutional">{title}</h3>
      <p className="mt-2 text-body text-muted-foreground">{description}</p>
    </Card>
  );
}
