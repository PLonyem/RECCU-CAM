import { OperationalQueue } from "@/components/admin/OperationalQueue";
import { prisma } from "@/lib/prisma";
import { getServerTranslator } from "@/lib/i18n-server";

export default async function AffiliateBankingPage() {
  const { tText } = await getServerTranslator();
  const rows = await prisma.affiliateBankingInquiry.findMany({ orderBy: { createdAt: "desc" } });
  return <div className="space-y-6"><header><p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-strong">{tText("Institutional services")}</p><h1 className="mt-2 font-display text-3xl font-bold text-institutional">{tText("Affiliate Banking Inquiries")}</h1><p className="mt-2 text-slate-600">{tText("Manage support inquiries only. This module does not process financial transactions.")}</p></header><OperationalQueue kind="banking" statuses={["new", "in-review", "in-progress", "resolved", "closed"]} emptyText="No Affiliate Banking inquiries yet." rows={rows.map((row) => ({ id: row.id, title: `${row.institution} — ${row.supportCategory}`, subtitle: `${row.reference} · ${row.contactPerson} · ${row.email} · ${row.phone}`, detail: row.message, status: row.status, assignedTo: row.assignedTo, receivedAt: row.createdAt }))} /></div>;
}
