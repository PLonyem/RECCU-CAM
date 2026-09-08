import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAffiliateSession } from "@/lib/auth/affiliate-context";
import { PortalShell } from "@/components/portal/PortalShell";
import { getServerTranslator } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const { tText } = await getServerTranslator();
  return { title: tText("Affiliate Portal"), robots: { index: false, follow: false, noarchive: true } };
}

export default async function AffiliatePortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getAffiliateSession();
  if (!session) redirect("/sign-in");
  const affiliate = await prisma.affiliate.findUnique({ where: { id: session.affiliateId }, select: { name: true } });
  if (!affiliate) redirect("/sign-in");
  return <PortalShell institutionName={affiliate.name}>{children}</PortalShell>;
}
