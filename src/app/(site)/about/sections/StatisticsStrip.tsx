"use client";

import { useLanguage } from "@/context/LanguageContext";
import { regions } from "@/lib/mock-data";
import { type TranslationKey } from "@/lib/i18n";
import { FadeUp } from "@/components/ui/FadeUp";

const yearsOfService = new Date().getFullYear() - 1968;

interface StatisticsStripProps {
  affiliateCount: number;
}

// SECTION 2 — Statistics strip. The brief asked for a 4th figure ("number
// of area offices") that doesn't exist anywhere in the app — confirmed
// with the user, who chose to use the landing page's real 3rd stat (years
// of service) rather than have a fabricated number here. Three real,
// live/computed figures, not four.
export function StatisticsStrip({ affiliateCount }: StatisticsStripProps) {
  const { t } = useLanguage();

  const stats: { value: string; labelKey: TranslationKey }[] = [
    { value: `${affiliateCount}+`, labelKey: "home_glance_affiliates_label" },
    { value: `${regions.length}`, labelKey: "home_glance_regions_label" },
    { value: `${yearsOfService}`, labelKey: "home_glance_years_label" },
  ];

  return (
    <section className="bg-primary-500/6 py-16 md:py-[120px]">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <FadeUp key={stat.labelKey} index={index} className="text-center md:text-left">
              <p className="text-[40px] md:text-[56px] font-display font-bold leading-none text-primary-500">
                {stat.value}
              </p>
              <p className="mt-3 text-[13px] uppercase tracking-[0.12em] text-primary-700">
                {t(stat.labelKey)}
              </p>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
