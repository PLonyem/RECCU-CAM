"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ inverse = false, className }: { inverse?: boolean; className?: string }) {
  const { language, setLanguage, t, tText } = useLanguage();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function select(next: "en" | "fr") {
    if (next === language || pending) return;
    setPending(true);
    setFailed(false);
    try {
      await setLanguage(next);
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={className}>
      <div
        role="group"
        aria-label={t("language.label")}
        className={cn("inline-flex rounded-lg border p-0.5", inverse ? "border-white/25 bg-white/5" : "border-primary-200 bg-white")}
      >
        {(["en", "fr"] as const).map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => void select(locale)}
          disabled={pending}
          aria-pressed={language === locale}
          aria-label={locale === "en" ? t("language.english") : t("language.french")}
          className={cn(
            "min-h-8 rounded-md px-2.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest disabled:opacity-60",
            language === locale
              ? "bg-institutional text-white"
              : inverse ? "text-white hover:bg-white/10" : "text-institutional hover:bg-primary-50",
          )}
        >
          {locale.toUpperCase()}
        </button>
        ))}
      </div>
      {failed && <span className="sr-only" role="status">{tText("Unable to change language.")}</span>}
    </div>
  );
}
