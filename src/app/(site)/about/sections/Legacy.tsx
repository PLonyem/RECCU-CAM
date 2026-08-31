"use client";

import { useLanguage } from "@/context/LanguageContext";
import { milestones } from "@/lib/mock-data";
import { localize } from "@/lib/i18n";
import { isPlaceholder } from "@/lib/utils";
import { FadeUp } from "@/components/ui/FadeUp";
import { ImageSlot } from "./ImageSlot";

// Flip this to true once CamCCUL supplies a real founding year and
// milestone list (src/lib/mock-data.ts `milestones`) — currently every
// entry is still seed placeholder copy, so the timeline stays hidden
// rather than showing invented dates. Real milestones can be added to
// mock-data.ts without any other code change: this component reads that
// same array and will render automatically once it flips on.
const SHOW_TIMELINE = false;

function Timeline() {
  const { language } = useLanguage();
  const realMilestones = milestones.filter(
    (m) => !isPlaceholder(m.title.en) && !isPlaceholder(m.description.en)
  );
  if (realMilestones.length === 0) return null;

  return (
    <ol className="mt-8 space-y-6 border-l-2 border-primary-200 pl-6">
      {realMilestones.map((milestone) => (
        <li key={milestone.year}>
          <p className="text-sm font-semibold text-primary-500">{milestone.year}</p>
          <p className="font-display font-semibold text-primary-900 mt-1">
            {localize(milestone.title, language)}
          </p>
          <p className="text-[16px] leading-[1.65] text-primary-700 mt-1">
            {localize(milestone.description, language)}
          </p>
        </li>
      ))}
    </ol>
  );
}

// SECTION 4 — Legacy. Pale blue tint, mirrors Vision (text left, image
// right this time) so the page alternates rather than repeats.
export function Legacy() {
  const { t } = useLanguage();

  return (
    <section className="bg-primary-500/6 py-16 md:py-[120px]">
      <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-12 md:gap-16 items-center">
        <FadeUp className="md:order-1">
          <p className="text-[13px] uppercase tracking-[0.12em] text-primary-600 font-semibold">
            {t("about_v2_legacy_eyebrow")}
          </p>
          <h2 className="mt-3 text-[28px] md:text-[40px] font-display font-bold leading-tight text-primary-900">
            {t("about_v2_legacy_heading")}
          </h2>
          <p className="mt-6 text-[16px] md:text-[17px] leading-[1.65] text-primary-700">
            {t("about_v2_legacy_body")}
          </p>

          {/* TIMELINE SLOT — built, hidden until real milestones exist. */}
          {SHOW_TIMELINE && <Timeline />}
        </FadeUp>

        <FadeUp index={1} className="relative md:order-2">
          <div
            className="hidden md:block absolute -bottom-6 -left-6 w-full h-full rounded-3xl bg-primary-500/15"
            aria-hidden="true"
          />
          {/* IMAGE SLOT — swap for a real photograph of a CamCCUL office
              or an affiliate credit union branch; pass src/alt to ImageSlot. */}
          <ImageSlot
            label="A CamCCUL affiliate credit union branch — photograph coming soon"
            className="relative aspect-[4/5]"
          />
        </FadeUp>
      </div>
    </section>
  );
}
