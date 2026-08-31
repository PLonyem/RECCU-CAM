import { prisma } from "@/lib/prisma";
import { HomeClient } from "./HomeClient";
import { LoanCalculatorClient } from "./loan-calculator/LoanCalculatorClient";

// Homepage Editor changes must appear immediately rather than waiting for a
// deployment, so the hero configuration is read on every request.
export const dynamic = "force-dynamic";

export interface HeroOverlay {
  show: boolean;
  color: string;
  opacity: number;
}

const DEFAULT_HERO_OVERLAY: HeroOverlay = {
  show: true,
  color: "#000000",
  opacity: 0,
};

export interface HeroContent {
  badge: string;
  title: string;
  subtitle: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  images: string[];
  backgroundColor: string;
  gradientDirection: "to-r" | "to-b" | "to-br" | "to-bl";
  textAlignment: "left" | "center" | "right";
  buttonStyle: "solid" | "outline" | "ghost";
}

const DEFAULT_HERO_CONTENT: HeroContent = {
  badge: "Cameroon Cooperative Credit Union League",
  title: "Owned by members. Built for communities.",
  subtitle:
    "CamCCUL supervises and empowers cooperative credit unions across Cameroon, extending safe, affordable financial services to every region.",
  primaryButtonText: "Find a credit union near you",
  primaryButtonLink: "/affiliates",
  secondaryButtonText: "Become an affiliate",
  secondaryButtonLink: "/contact",
  images: [],
  backgroundColor: "#0A2647",
  gradientDirection: "to-br",
  textAlignment: "left",
  buttonStyle: "solid",
};

interface HomeData {
  showHero: boolean;
  heroOverlay: HeroOverlay;
  heroContent: HeroContent;
}

async function getHomeData(): Promise<HomeData> {
  try {
    const homepageContent = await prisma.homepageContent.findUnique({
      where: { id: "default" },
      select: {
        showHero: true,
        showOverlay: true,
        overlayColor: true,
        overlayOpacity: true,
        heroBadge: true,
        heroTitle: true,
        heroSubtitle: true,
        primaryButtonText: true,
        primaryButtonLink: true,
        secondaryButtonText: true,
        secondaryButtonLink: true,
        heroImages: true,
        backgroundColor: true,
        gradientDirection: true,
        textAlignment: true,
        buttonStyle: true,
      },
    });

    return {
      showHero: homepageContent?.showHero ?? true,
      heroOverlay: homepageContent
        ? {
            show: homepageContent.showOverlay,
            color: homepageContent.overlayColor,
            opacity: homepageContent.overlayOpacity,
          }
        : DEFAULT_HERO_OVERLAY,
      heroContent: homepageContent
        ? {
            badge: homepageContent.heroBadge,
            title: homepageContent.heroTitle,
            subtitle: homepageContent.heroSubtitle,
            primaryButtonText: homepageContent.primaryButtonText,
            primaryButtonLink: homepageContent.primaryButtonLink,
            secondaryButtonText: homepageContent.secondaryButtonText,
            secondaryButtonLink: homepageContent.secondaryButtonLink,
            images: homepageContent.heroImages as string[],
            backgroundColor: homepageContent.backgroundColor,
            gradientDirection:
              homepageContent.gradientDirection as HeroContent["gradientDirection"],
            textAlignment: homepageContent.textAlignment as HeroContent["textAlignment"],
            buttonStyle: homepageContent.buttonStyle as HeroContent["buttonStyle"],
          }
        : DEFAULT_HERO_CONTENT,
    };
  } catch (error) {
    console.error("Database unavailable, falling back to default hero:", error);
    return {
      showHero: true,
      heroOverlay: DEFAULT_HERO_OVERLAY,
      heroContent: DEFAULT_HERO_CONTENT,
    };
  }
}

export default async function Home() {
  const { showHero, heroOverlay, heroContent } = await getHomeData();

  return (
    <>
      <HomeClient
        showHero={showHero}
        heroOverlay={heroOverlay}
        heroContent={heroContent}
      />
      <LoanCalculatorClient />
    </>
  );
}
