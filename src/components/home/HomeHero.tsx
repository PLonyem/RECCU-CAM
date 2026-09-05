import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";
import { institution } from "@/config/institution";
import heroImage from "../../../public/images/home/cooperative-network-hero.webp";
import { cn, heroOverlayGradient } from "@/lib/utils";

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
  textAlignment: string;
  showOverlay: boolean;
}

export function HomeHero({ content }: { content?: HomeHeroContent | null }) {
  const images = Array.isArray(content?.heroImages) ? content.heroImages.filter((value): value is string => typeof value === "string") : [];
  const align = content?.textAlignment === "center" ? "mx-auto text-center" : content?.textAlignment === "right" ? "ml-auto text-right" : "";
  return (
    <section className="relative isolate min-h-[42rem] overflow-hidden bg-institutional text-white sm:min-h-[46rem] lg:min-h-[48rem]" style={{ backgroundColor: content?.backgroundColor }}>
      <Image
        src={images[0] ?? heroImage}
        alt={images[0] ? "" : "Illustrative scene of Cameroonian cooperative professionals reviewing documents together"}
        fill
        preload
        sizes="100vw"
        className="-z-20 object-cover object-[62%_center]"
      />
      {content?.showOverlay !== false && <div className="absolute inset-0 -z-10" style={{ background: heroOverlayGradient(content?.overlayColor ?? "#102a43", content?.overlayOpacity ?? 78, content?.textAlignment === "right" ? 270 : 90, 35, 82) }} />}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-institutional/80 via-transparent to-institutional/20 lg:hidden" />

      <Container className="flex min-h-[42rem] items-center py-16 sm:min-h-[46rem] lg:min-h-[48rem] lg:py-24">
        <div className={cn("max-w-[52rem]", align)}>
          <p className="inline-flex items-center gap-2 rounded-pill border border-white/20 bg-institutional/50 px-4 py-2 text-meta uppercase text-accent-200 backdrop-blur-sm">
            <BadgeCheck className="h-4 w-4" aria-hidden="true" /> {content?.heroBadge ?? institution.displayName}
          </p>
          <h1 className="mt-7 font-display text-h1 text-white sm:text-display">
            {content?.heroTitle ?? <>Building Stronger Credit Unions. <span className="text-accent-300">Building Stronger Communities.</span></>}
          </h1>
          <p className="mt-7 max-w-[45rem] text-lead text-primary-50 sm:text-xl sm:leading-9">
            {content?.heroSubtitle ?? "RECCU-CAM strengthens cooperative financial institutions through institutional support, responsible governance, professional development and shared growth."}
          </p>
          <div className={cn("mt-9 flex flex-col gap-3 sm:flex-row", content?.textAlignment === "center" && "justify-center", content?.textAlignment === "right" && "justify-end")}>
            <Link href={content?.primaryButtonLink ?? "/about"} className={buttonVariants({ variant: "accent", size: "lg" })}>
              {content?.primaryButtonText ?? "Learn About RECCU-CAM"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href={content?.secondaryButtonLink ?? "/contact"} className={buttonVariants({ variant: "secondary", size: "lg", className: "border-white/40 bg-white/10 text-white hover:border-white/70 hover:bg-white/15" })}>
              {content?.secondaryButtonText ?? "Contact RECCU-CAM"}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
