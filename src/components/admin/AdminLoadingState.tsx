"use client";

import { Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function AdminLoadingState({ label = "Loading records" }: { label?: string }) {
  const { tText } = useLanguage();
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6" role="status" aria-live="polite" aria-label={tText(label)}>
      <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
        <Loader2 className="h-4 w-4 animate-spin text-primary-700" aria-hidden="true" />
        <span>{tText(label)}&hellip;</span>
      </div>
      <div className="mt-5 space-y-3" aria-hidden="true">
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}
