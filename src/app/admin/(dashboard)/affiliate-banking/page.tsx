import { prisma } from "@/lib/prisma";
import { OperationalQueue } from "@/components/admin/OperationalQueue";

export default async function AffiliateBankingPage() {
  const rows = await prisma.affiliateBankingInquiry.findMany({ orderBy: { createdAt: "desc" } });
  return <div className="space-y-6"><header><p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-strong">Institutional services</p><h1 className="mt-2 font-display text-3xl font-bold text-institutional">Affiliate Banking Inquiries</h1><p className="mt-2 text-slate-600">Manage support inquiries only. This module does not process financial transactions.</p></header><OperationalQueue kind="banking" statuses={["submitted","under-review","more-information-required","approved","declined","closed"]} emptyText="No affiliate banking inquiries have been submitted." rows={rows.map((row) => ({ id: row.id, title: `${row.institution} — ${row.supportCategory}`, subtitle: `${row.reference} · ${row.contactPerson} · ${row.email} · ${row.phone}`, detail: row.message, status: row.status, assignedTo: row.assignedTo, receivedAt: row.createdAt }))} /></div>;
}
