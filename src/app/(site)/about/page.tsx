import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { affiliates as mockAffiliates } from "@/lib/mock-data";
import { AboutPageClient } from "./AboutPageClient";

async function getAffiliateCount(): Promise<number> {
  try {
    return await prisma.affiliate.count({ where: { isActive: true } });
  } catch (error) {
    console.error(
      "Database unavailable, falling back to mock affiliate count:",
      error
    );
    return mockAffiliates.filter((a) => a.isActive).length;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "About — CamCCUL",
    description:
      "Empowering Financial Growth and Community Development — CamCCUL is the Cameroon Cooperative Credit Union League, driving financial growth and community prosperity through dedicated services to affiliated credit unions across Cameroon.",
  };
}

export default async function AboutPage() {
  const affiliateCount = await getAffiliateCount();

  return <AboutPageClient affiliateCount={affiliateCount} />;
}
