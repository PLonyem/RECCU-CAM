"use client";

import { useLanguage } from "@/context/LanguageContext";
import { FadeUp } from "@/components/ui/FadeUp";
import { ImageSlot } from "./ImageSlot";

// SECTION 3 — Vision. White, asymmetric 45/55 split, image on the left.
// A flat blue block sits offset behind the image so it reads as placed,
// not pasted — the one decorative device used consistently across the
// page (mirrored in Legacy).
export function Vision() {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-16 md:py-[120px]">
      <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-12 md:gap-16 items-center">
        <FadeUp className="relative">
          <div
            className="hidden md:block absolute -bottom-6 -right-6 w-full h-full rounded-3xl bg-primary-500/15"
            aria-hidden="true"
          />
          {/* IMAGE SLOT — swap for a real photograph of CamCCUL staff or a
              member credit union at work; pass src/alt to ImageSlot. */}
          <ImageSlot
            label="CamCCUL staff serving members — photograph coming soon"
            className="relative aspect-[4/5]"
          />
        </FadeUp>

        <FadeUp index={1}>
          <p className="text-[13px] uppercase tracking-[0.12em] text-primary-600 font-semibold">
            {t("about_v2_vision_eyebrow")}
          </p>
          <h2 className="mt-3 text-[28px] md:text-[40px] font-display font-bold leading-tight text-primary-900">
            {t("about_v2_vision_heading")}
          </h2>
          <p className="mt-6 text-[18px] md:text-[20px] leading-[1.5] text-primary-800">
            {t("about_v2_vision_lead")}
          </p>
          <p className="mt-4 text-[16px] md:text-[17px] leading-[1.65] text-primary-700">
            {t("about_v2_vision_body1")}
          </p>
          <p className="mt-4 text-[16px] md:text-[17px] leading-[1.65] text-primary-700">
            {t("about_v2_vision_body2")}
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
