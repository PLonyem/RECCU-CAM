import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Building2, CalendarDays, ClipboardList, FilePenLine, Headphones, Mail } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";

function StatCard({ label, value, detail, icon: Icon, href }: { label: string; value: number; detail: string; icon: LucideIcon; href: string }) {
  return <Link href={href}><Card className="h-full p-5 transition hover:border-primary-200 hover:shadow-md"><div className="flex items-start justify-between gap-4"><span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-50 text-forest"><Icon className="h-5 w-5" /></span><span className="font-display text-3xl font-bold text-institutional">{value}</span></div><h2 className="mt-5 font-semibold text-slate-900">{label}</h2><p className="mt-1 text-sm text-slate-500">{detail}</p></Card></Link>;
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const [newMessages, activeAffiliates, pendingAffiliations, upcomingTraining, draftNews, draftPages, openSupport] = await Promise.all([
    prisma.contactMessage.count({ where: { status: "new" } }), prisma.affiliate.count({ where: { isActive: true } }), prisma.affiliationInquiry.count({ where: { status: { in: ["new", "under-review"] } } }), prisma.trainingProgram.count({ where: { published: true, OR: [{ startDate: null }, { startDate: { gte: now } }] } }), prisma.newsArticle.count({ where: { published: false } }), prisma.pageContent.count({ where: { status: "draft" } }), prisma.supportTicket.count({ where: { status: { in: ["open", "in-progress"] } } }),
  ]);
  const cards = [["New Contact Messages", newMessages, "Awaiting review", Mail, "/admin/messages"], ["Active Affiliates", activeAffiliates, "Verified operational records", Building2, "/admin/affiliates"], ["Pending Affiliation Requests", pendingAffiliations, "New or under review", ClipboardList, "/admin/affiliation-requests"], ["Upcoming Training", upcomingTraining, "Published VTIME programs", CalendarDays, "/admin/vtime"], ["Draft Publications", draftNews + draftPages, "News and page drafts", FilePenLine, "/admin/content"], ["Open Support Requests", openSupport, "Open or in progress", Headphones, "/admin/support"]] as const;
  return <div className="space-y-8"><header><p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-strong">Operations control center</p><h1 className="mt-2 font-display text-3xl font-bold text-institutional">RECCU-CAM Administration</h1><p className="mt-2 text-slate-600">Manage the digital presence, institutional resources, and affiliate network.</p></header><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([label, value, detail, icon, href]) => <StatCard key={label} label={label} value={value} detail={detail} icon={icon} href={href} />)}</div><Card className="border-l-4 border-l-gold p-6"><h2 className="font-semibold text-institutional">Live operational data</h2><p className="mt-2 text-sm leading-6 text-slate-600">All figures above are calculated from stored records. No financial balances, regulatory deadlines, or unverified institutional statistics are fabricated.</p></Card></div>;
}
