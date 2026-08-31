"use client";

import { useLanguage } from "@/context/LanguageContext";
import { FadeUp } from "@/components/ui/FadeUp";

// SECTION 1 — Hero. White, no photograph. Confidence comes from scale and
// empty space: a large heading, a short rule, nothing else.
export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-16 md:py-[120px]">
      <div className="max-w-[1200px] mx-auto px-4">
        <FadeUp>
          <p className="text-[13px] uppercase tracking-[0.12em] text-primary-600 font-semibold">
            {t("about_v2_hero_eyebrow")}
          </p>
          <h1 className="mt-4 max-w-full md:max-w-[70%] text-[34px] md:text-[64px] font-medium leading-[1.1] text-primary-900">
            {t("about_v2_hero_heading")}
          </h1>
          <div className="mt-8 h-1 w-20 bg-primary-500" aria-hidden="true" />
        </FadeUp>
      </div>
    </section>
  );
}
