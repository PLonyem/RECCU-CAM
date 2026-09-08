"use client";

import { CircleAlert, RefreshCw } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function AdminDataFailure({
  message = "Unable to load this section. Please retry.",
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  const { tText } = useLanguage();
  return (
    <div className="rounded-xl border border-amber-200 bg-white p-8 text-center" role="alert">
      <CircleAlert className="mx-auto h-8 w-8 text-amber-700" aria-hidden="true" />
      <p className="mt-3 font-semibold text-institutional">{tText("Unable to load this section.")}</p>
      <p className="mt-1 text-sm text-slate-600">{tText(message)}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary-800 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" /> {tText("Retry")}
      </button>
    </div>
  );
}
