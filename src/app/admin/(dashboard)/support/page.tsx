import { OperationalQueue } from "@/components/admin/OperationalQueue";
import { prisma } from "@/lib/prisma";
import { getServerTranslator } from "@/lib/i18n-server";

export default async function SupportRequestsPage() {
  const { tText } = await getServerTranslator();
  const rows = await prisma.supportTicket.findMany({ include: { affiliate: { select: { name: true } } }, orderBy: { createdAt: "desc" } });
  return <div className="space-y-6"><header><p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-strong">{tText("Affiliate service desk")}</p><h1 className="mt-2 font-display text-3xl font-bold text-institutional">{tText("Support Requests")}</h1><p className="mt-2 text-slate-600">{tText("Assign, respond to, and close affiliate support tickets.")}</p></header><OperationalQueue kind="support" statuses={["open", "in-progress", "resolved", "closed"]} emptyText="No support requests yet." rows={rows.map((row) => ({ id: row.id, title: row.subject, subtitle: `${row.reference} · ${row.affiliate.name} · ${row.category} · ${row.priority}`, detail: row.message, status: row.status, assignedTo: row.assignedTo, receivedAt: row.createdAt }))} /></div>;
}
