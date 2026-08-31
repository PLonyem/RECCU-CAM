"use client";

import { Fragment, useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { FadeUp } from "@/components/ui/FadeUp";
import { heroOverlayGradient } from "@/lib/utils";
import type { HeroContent } from "./page";

interface HeroOverlay {
  show: boolean;
  color: string;
  opacity: number;
}

interface HomeClientProps {
  showHero: boolean;
  heroOverlay: HeroOverlay;
  heroContent: HeroContent;
}

const GRADIENT_DIRECTION_CSS: Record<HeroContent["gradientDirection"], string> = {
  "to-r": "to right",
  "to-b": "to bottom",
  "to-br": "to bottom right",
  "to-bl": "to bottom left",
};

function useHeroSlideshow(imageCount: number) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (imageCount <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % imageCount);
    }, 10000);
    return () => window.clearInterval(timer);
  }, [imageCount]);

  return index;
}

const RADIUS = "rounded-[14px]";
const TINT_BG = "color-mix(in srgb, #205295 6%, white)";

function useHeroParallax(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function handleScroll() {
      const el = ref.current;
      if (!el) return;
      const y = Math.min(window.scrollY, 400);
      el.style.transform = `translate3d(0, ${y * 0.15}px, 0)`;
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [ref]);
}

export function HomeClient({
  showHero,
  heroOverlay,
  heroContent,
}: HomeClientProps) {
  const { language, t } = useLanguage();
  const photoRef = useRef<HTMLDivElement>(null);
  useHeroParallax(photoRef);

  const hasHeroImage = heroContent.images.length > 0;
  const slideIndex = useHeroSlideshow(heroContent.images.length);
  const heroBadge =
    language === "fr" && heroContent.badge === "Cameroon Cooperative Credit Union League"
      ? t("nav_tagline")
      : heroContent.badge;
  const heroTitle =
    language === "fr" && heroContent.title === "Owned by members. Built for communities."
      ? `${t("home2_hero_heading_line1")}\n${t("home2_hero_heading_line2")}`
      : heroContent.title;
  const heroSubtitle =
    language === "fr" &&
    heroContent.subtitle ===
      "CamCCUL supervises and empowers cooperative credit unions across Cameroon, extending safe, affordable financial services to every region."
      ? t("home2_hero_subtitle")
      : heroContent.subtitle;
  const primaryButtonText =
    language === "fr" && heroContent.primaryButtonText === "Find a credit union near you"
      ? t("home2_hero_cta_primary")
      : heroContent.primaryButtonText;
  const secondaryButtonText =
    language === "fr" && heroContent.secondaryButtonText === "Become an affiliate"
      ? t("home2_hero_cta_secondary")
      : heroContent.secondaryButtonText;
  const titleLines = heroTitle.split("\n").filter((line) => line.trim().length > 0);

  const primaryButtonClass =
    heroContent.buttonStyle === "outline"
      ? "border border-white text-white hover:bg-white/[0.12]"
      : heroContent.buttonStyle === "ghost"
      ? "text-white underline underline-offset-4 hover:text-white/80"
      : "bg-white text-primary-700 shadow-[0_10px_30px_-8px_rgba(32,82,149,0.55)] hover:shadow-[0_14px_36px_-8px_rgba(32,82,149,0.7)]";

  const heroAlignClass =
    heroContent.textAlignment === "center"
      ? "items-center text-center mx-auto"
      : heroContent.textAlignment === "right"
      ? "items-end text-right ml-auto"
      : "items-start text-left";
  const heroButtonsJustifyClass =
    heroContent.textAlignment === "center"
      ? "justify-center"
      : heroContent.textAlignment === "right"
      ? "justify-end"
      : "justify-start";

  const effectiveOverlayOpacity = heroOverlay.show ? heroOverlay.opacity : 0;
  const heroTextShadow: CSSProperties | undefined =
    effectiveOverlayOpacity < 30 ? { textShadow: "0 2px 4px rgba(0,0,0,0.3)" } : undefined;

  const overlayGradientMobile = heroOverlayGradient(heroOverlay.color, effectiveOverlayOpacity, 0, 42, 82);
  const overlayGradientDesktop = heroOverlayGradient(heroOverlay.color, effectiveOverlayOpacity, 100, 30, 65);
  const heroBleedTarget = TINT_BG;

  function handleHeroImageError() {
    window.dispatchEvent(new Event("hero-image-error"));
  }

  return (
    <>
      {showHero && (
      <section
        id="home-hero"
        className="relative isolate flex items-end sm:items-center overflow-hidden -mt-16"
        style={{ minHeight: "92svh" }}
      >
        {hasHeroImage ? (
          <div ref={photoRef} className="hero-parallax-photo absolute inset-0 will-change-transform">
            <Image
              key={heroContent.images[slideIndex]}
              src={heroContent.images[slideIndex]}
              alt={t("home2_hero_image_alt")}
              fill
              priority
              quality={75}
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: "center 22%" }}
              onError={handleHeroImageError}
            />
          </div>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(${GRADIENT_DIRECTION_CSS[heroContent.gradientDirection]}, ${heroContent.backgroundColor}, transparent)`,
            }}
            aria-hidden="true"
          />
        )}

        {heroOverlay.show && heroOverlay.opacity > 0 && (
          <>
            <div
              className="absolute inset-0 sm:hidden"
              style={{ background: overlayGradientMobile }}
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 hidden sm:block"
              style={{ background: overlayGradientDesktop }}
              aria-hidden="true"
            />
          </>
        )}

        <div
          className="absolute inset-x-0 bottom-0 h-[22vh] sm:h-[24vh]"
          style={{ background: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, ${heroBleedTarget} 100%)` }}
          aria-hidden="true"
        />

        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-[1200px] mx-auto px-4 py-16 sm:py-24 w-full">
          <div className={`max-w-[620px] flex flex-col ${heroAlignClass}`}>
            <FadeUp hero staggerMs={120} index={0}>
              <p
                className="text-white/70 font-semibold uppercase"
                style={{ fontSize: "13px", letterSpacing: "0.14em", ...heroTextShadow }}
              >
                {heroBadge}
              </p>
            </FadeUp>

            <FadeUp hero staggerMs={120} index={1}>
              <h1
                className="mt-3 font-display font-medium text-white"
                style={{
                  fontSize: "clamp(40px, 5.6vw, 78px)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.05,
                  textWrap: "balance",
                  ...heroTextShadow,
                }}
              >
                {titleLines.map((line, index) => (
                  <Fragment key={index}>
                    {index > 0 && <br />}
                    {line}
                  </Fragment>
                ))}
              </h1>
            </FadeUp>

            <FadeUp hero staggerMs={120} index={2}>
              <p
                className="mt-5 text-white/[0.82] max-w-[34ch]"
                style={{ fontSize: "20px", lineHeight: 1.6, ...heroTextShadow }}
              >
                {heroSubtitle}
              </p>
            </FadeUp>

            <FadeUp hero staggerMs={120} index={3}>
              <div className={`mt-8 flex flex-col sm:flex-row gap-4 ${heroButtonsJustifyClass}`}>
                <Link
                  href={heroContent.primaryButtonLink}
                  className={`inline-flex items-center justify-center ${RADIUS} px-6 py-3 text-sm font-medium transition-shadow w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${primaryButtonClass}`}
                >
                  {primaryButtonText}
                </Link>
                <Link
                  href={heroContent.secondaryButtonLink}
                  className={`inline-flex items-center justify-center ${RADIUS} border border-white/70 text-white px-6 py-3 text-sm font-medium transition-colors w-full sm:w-auto hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent`}
                >
                  {secondaryButtonText}
                </Link>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>
      )}
    </>
  );
}
