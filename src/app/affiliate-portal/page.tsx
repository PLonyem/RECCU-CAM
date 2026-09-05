import Link from "next/link";
import { Bell, BookOpenCheck, FileCheck2, FileText, GraduationCap, HandCoins, Headphones } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getAffiliateSession } from "@/lib/auth/affiliate-context";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export default async function AffiliatePortalOverview() {
  const session = await getAffiliateSession();
  if (!session) return null;
  const now = new Date();
  const [affiliate, complianceCount, circulars, trainingCount, supportCount, documentCount, bankingCount] = await Promise.all([
    prisma.affiliate.findUnique({ where: { id: session.affiliateId }, select: { name: true, code: true, profileStatus: true } }),
    prisma.complianceRecord.count({ where: { published: true, status: { not: "completed" }, OR: [{ affiliateId: null }, { affiliateId: session.affiliateId }] } }),
    prisma.announcement.count({ where: { isPublished: true, OR: [{ expiryDate: null }, { expiryDate: { gt: now } }] } }),
    prisma.trainingProgram.count({ where: { published: true, OR: [{ startDate: null }, { startDate: { gte: now } }] } }),
    prisma.supportTicket.count({ where: { affiliateId: session.affiliateId, status: { in: ["open", "in-progress"] } } }),
    prisma.resource.count({ where: { published: true, isActive: true, accessLevel: { in: ["PUBLIC", "AFFILIATE_ONLY"] } } }),
    prisma.affiliateBankingInquiry.count({ where: { affiliateId: session.affiliateId, status: { not: "closed" } } }),
  ]);
  if (!affiliate) return null;
  const cards = [
    ["Compliance Status", complianceCount, "Open items", "/affiliate-portal/compliance", FileCheck2],
    ["Recent Circulars", circulars, "Available circulars", "/affiliate-portal/circulars", BookOpenCheck],
    ["Upcoming Training", trainingCount, "Published programs", "/affiliate-portal/vtime", GraduationCap],
    ["Open Support Requests", supportCount, "Active tickets", "/affiliate-portal/support", Headphones],
    ["Recent Documents", documentCount, "Accessible resources", "/affiliate-portal/documents", FileText],
    ["Affiliate Banking Requests", bankingCount, "Open inquiries", "/affiliate-portal/affiliate-banking", HandCoins],
  ] as const;
  return <div className="space-y-8">
    <header><div className="flex flex-wrap items-center gap-3"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-strong">Affiliate Portal</p><Badge>{affiliate.code}</Badge></div><h1 className="mt-3 font-display text-3xl font-bold text-institutional">Welcome back, {affiliate.name}</h1><p className="mt-2 text-slate-600">Your RECCU-CAM institutional workspace.</p></header>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([title, count, caption, href, Icon]) => <Link key={title} href={href}><Card className="h-full p-5 transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md"><div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-50 text-forest"><Icon className="h-5 w-5" /></span><span className="font-display text-3xl font-bold text-institutional">{count}</span></div><h2 className="mt-5 font-semibold text-slate-900">{title}</h2><p className="mt-1 text-sm text-slate-500">{caption}</p></Card></Link>)}</div>
    <Card className="border-l-4 border-l-gold p-6"><div className="flex gap-3"><Bell className="mt-0.5 h-5 w-5 shrink-0 text-gold-strong" /><div><h2 className="font-semibold text-institutional">Verified institutional information</h2><p className="mt-1 text-sm leading-6 text-slate-600">Profile edits are submitted as review requests. Verified public information changes only after RECCU-CAM staff approval.</p></div></div></Card>
  </div>;
}
