import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAffiliateSession } from "@/lib/auth/affiliate-context";
import { PortalShell } from "@/components/portal/PortalShell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Affiliate Portal", robots: { index: false, follow: false, noarchive: true } };

export default async function AffiliatePortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getAffiliateSession();
  if (!session) redirect("/sign-in");
  const affiliate = await prisma.affiliate.findUnique({ where: { id: session.affiliateId }, select: { name: true } });
  if (!affiliate) redirect("/sign-in");
  return <PortalShell institutionName={affiliate.name}>{children}</PortalShell>;
}
