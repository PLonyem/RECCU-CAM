"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

interface ImageSlotProps {
  /**
   * Describes the intended photograph (e.g. "CamCCUL headquarters in
   * Bamenda") — doubles as the aria-label while this slot is a
   * placeholder, so screen readers get context even before a real
   * photograph exists.
   */
  label: string;
  className?: string;
  /** Once CamCCUL supplies a real photograph, pass its path here — the
   * placeholder disappears automatically and nothing else in the layout
   * needs to change. */
  src?: string;
  alt?: string;
}

// SWAPPABLE IMAGE SLOT — no stock photography stands in for CamCCUL's own
// photos here. Until `src` is provided, this renders an honest flat-blue
// placeholder instead.
export function ImageSlot({ label, className, src, alt }: ImageSlotProps) {
  const { t } = useLanguage();

  if (src) {
    return (
      <div className={cn("relative overflow-hidden rounded-3xl", className)}>
        <Image
          src={src}
          alt={alt ?? label}
          fill
          loading="lazy"
          className="object-cover"
          sizes="(min-width: 768px) 50vw, 100vw"
        />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "relative overflow-hidden rounded-3xl bg-primary-500 flex flex-col items-center justify-center gap-2",
        className
      )}
    >
      <span className="font-display text-2xl md:text-3xl font-bold tracking-wide text-white">
        CamCCUL
      </span>
      <span className="text-xs text-primary-100">{t("about_v2_image_placeholder")}</span>
    </div>
  );
}
