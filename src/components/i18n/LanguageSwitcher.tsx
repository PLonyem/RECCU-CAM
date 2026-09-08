"use client";

import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ inverse = false, className }: { inverse?: boolean; className?: string }) {
  const { language, setLanguage, t } = useLanguage();

  function select(next: "en" | "fr") {
    if (next !== language) setLanguage(next);
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
          onClick={() => select(locale)}
          aria-pressed={language === locale}
          aria-label={locale === "en" ? "Switch to English" : "Passer au français"}
          className={cn(
            "min-h-8 rounded-md px-2.5 text-xs font-bold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest",
            language === locale
              ? "bg-institutional text-white"
              : inverse ? "text-white hover:bg-white/10" : "text-institutional hover:bg-primary-50",
          )}
        >
          {locale.toUpperCase()}
        </button>
        ))}
      </div>
    </div>
  );
}
