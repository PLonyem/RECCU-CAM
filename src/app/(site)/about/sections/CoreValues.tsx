"use client";

import { ShieldCheck, Users, Lightbulb, Zap } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Card } from "@/components/ui/Card";
import { FadeUp } from "@/components/ui/FadeUp";

// SECTION 6 — Core values row. Pale blue tint. The four named values get
// their own band — names only, no invented descriptions.
export function CoreValues() {
  const { t } = useLanguage();

  const values = [
    { icon: ShieldCheck, labelKey: "about_v2_value_integrity" as const },
    { icon: Users, labelKey: "about_v2_value_community" as const },
    { icon: Lightbulb, labelKey: "about_v2_value_innovation" as const },
    { icon: Zap, labelKey: "about_v2_value_empowerment" as const },
  ];

  return (
    <section className="bg-primary-500/6 py-16 md:py-[120px]">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <FadeUp key={value.labelKey} index={index}>
              <Card className="h-full p-6 md:p-8 border-primary-100 shadow-none text-center">
                <value.icon
                  className="h-7 w-7 text-primary-500 mx-auto"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <p className="mt-4 font-display font-semibold text-primary-900">
                  {t(value.labelKey)}
                </p>
              </Card>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
