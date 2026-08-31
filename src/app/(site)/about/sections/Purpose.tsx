"use client";

import { Target, Compass } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Card } from "@/components/ui/Card";
import { FadeUp } from "@/components/ui/FadeUp";

// SECTION 5 — Purpose. White, two equal-height flat cards with a hairline
// blue border (the shared Card component, stripped of its default grey
// border and shadow to match the page's strict two-colour rule).
export function Purpose() {
  const { t } = useLanguage();

  const cards = [
    {
      icon: Target,
      titleKey: "about_v2_purpose_mission_title" as const,
      bodyKey: "about_v2_purpose_mission_body" as const,
    },
    {
      icon: Compass,
      titleKey: "about_v2_purpose_values_title" as const,
      bodyKey: "about_v2_purpose_values_body" as const,
    },
  ];

  return (
    <section className="bg-white py-16 md:py-[120px]">
      <div className="max-w-[1200px] mx-auto px-4">
        <FadeUp>
          <p className="text-[13px] uppercase tracking-[0.12em] text-primary-600 font-semibold">
            {t("about_v2_purpose_eyebrow")}
          </p>
          <h2 className="mt-3 text-[28px] md:text-[40px] font-display font-bold leading-tight text-primary-900 max-w-3xl">
            {t("about_v2_purpose_heading")}
          </h2>
        </FadeUp>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card, index) => (
            <FadeUp key={card.titleKey} index={index + 1}>
              <Card className="h-full p-8 md:p-10 border-primary-100 shadow-none">
                <card.icon className="h-7 w-7 text-primary-500" strokeWidth={1.5} aria-hidden="true" />
                <h3 className="mt-5 font-display text-xl font-bold text-primary-900">
                  {t(card.titleKey)}
                </h3>
                <p className="mt-3 text-[16px] md:text-[17px] leading-[1.65] text-primary-700">
                  {t(card.bodyKey)}
                </p>
              </Card>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
