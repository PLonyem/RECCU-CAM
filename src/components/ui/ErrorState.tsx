"use client";

import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

interface ErrorStateProps {
  title?: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function ErrorState({ action, className, description, title = "Something went wrong" }: ErrorStateProps) {
  const { tText } = useLanguage();
  return (
    <div role="alert" className={cn("rounded-card border border-error/20 bg-error-subtle p-card", className)}>
      <div className="flex gap-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-error" aria-hidden="true" />
        <div>
          <h2 className="font-display text-h4 text-error">{tText(title)}</h2>
          <p className="mt-1 text-body text-foreground">{tText(description)}</p>
          {action && <div className="mt-5">{action}</div>}
        </div>
      </div>
    </div>
  );
}
