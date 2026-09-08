"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";
import { institution } from "@/config/institution";
import heroImage from "../../../public/images/home/cooperative-network-hero.webp";
import { cn, heroGradientAngle, heroOverlayGradient } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { localizeHomepageContent } from "@/lib/localized-content";

export interface HomeHeroContent {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  heroImages: unknown;
  overlayColor: string;
  overlayOpacity: number;
  backgroundColor: string;
  gradientDirection: string;
  textAlignment: string;
  buttonStyle: string;
  showOverlay: boolean;
  translations: unknown;
}

export function HomeHero({ content }: { content?: HomeHeroContent | null }) {
  const { language, tText } = useLanguage();
  const localized = content ? localizeHomepageContent(content, language) : null;
  const images = Array.isArray(localized?.heroImages) ? localized.heroImages.filter((value): value is string => typeof value === "string") : [];
  const align = localized?.textAlignment === "center" ? "mx-auto text-center" : localized?.textAlignment === "right" ? "ml-auto text-right" : "";
  return (
    <section className="relative isolate min-h-[42rem] overflow-hidden bg-institutional text-white sm:min-h-[46rem] lg:min-h-[48rem]" style={{ backgroundColor: localized?.backgroundColor }}>
      <Image
        src={images[0] ?? heroImage}
        alt={images[0] ? "" : tText("Illustrative scene of Cameroonian cooperative professionals reviewing documents together")}
        fill
        preload
        sizes="100vw"
        className="-z-20 object-cover object-[62%_center]"
      />
      {localized?.showOverlay !== false && <div className="absolute inset-0 -z-10" style={{ background: heroOverlayGradient(localized?.overlayColor ?? "#0D3D2E", localized?.overlayOpacity ?? 68, heroGradientAngle(localized?.gradientDirection ?? "to-r"), 35, 82) }} />}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-institutional/80 via-transparent to-institutional/20 lg:hidden" />

      <Container className="flex min-h-[42rem] items-center py-16 sm:min-h-[46rem] lg:min-h-[48rem] lg:py-24">
        <div className={cn("max-w-[52rem]", align)}>
          <p className="inline-flex items-center gap-2 rounded-pill border border-white/20 bg-institutional/50 px-4 py-2 text-meta uppercase text-accent-200 backdrop-blur-sm">
            <BadgeCheck className="h-4 w-4" aria-hidden="true" /> {tText(localized?.heroBadge ?? institution.displayName)}
          </p>
          <h1 className="mt-7 whitespace-pre-line font-display text-h1 text-white sm:text-display">
            {localized?.heroTitle ? tText(localized.heroTitle) : <>{tText("Building Stronger Credit Unions.")} <span className="text-accent-300">{tText("Building Stronger Communities.")}</span></>}
          </h1>
          <p className="mt-7 max-w-[45rem] text-lead text-primary-50 sm:text-xl sm:leading-9">
            {tText(localized?.heroSubtitle ?? "RECCU-CAM strengthens cooperative financial institutions through institutional support, responsible governance, professional development and shared growth.")}
          </p>
          <div className={cn("mt-9 flex flex-col gap-3 sm:flex-row", localized?.textAlignment === "center" && "justify-center", localized?.textAlignment === "right" && "justify-end")}>
            {(!localized || (localized.primaryButtonText && localized.primaryButtonLink)) && <Link href={localized?.primaryButtonLink ?? "/about"} className={buttonVariants({ variant: "default", size: "lg", className: localized?.buttonStyle === "outline" ? "public-secondary-button" : localized?.buttonStyle === "ghost" ? "public-ghost-button" : "public-primary-button" })}>
              {tText(localized?.primaryButtonText ?? "Learn About RECCU-CAM")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>}
            {(!localized || (localized.secondaryButtonText && localized.secondaryButtonLink)) && <Link href={localized?.secondaryButtonLink ?? "/contact"} className={buttonVariants({ variant: "secondary", size: "lg", className: "public-secondary-button" })}>
              {tText(localized?.secondaryButtonText ?? "Contact RECCU-CAM")}
            </Link>}
          </div>
        </div>
      </Container>
    </section>
  );
}
