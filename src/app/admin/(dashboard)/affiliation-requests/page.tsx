import { OperationalQueue } from "@/components/admin/OperationalQueue";
import { prisma } from "@/lib/prisma";
import { getServerTranslator } from "@/lib/i18n-server";

export default async function AffiliationRequestsPage() {
  const { tText } = await getServerTranslator();
  const rows = await prisma.affiliationInquiry.findMany({ orderBy: { createdAt: "desc" } });
  return <div className="space-y-6"><header><p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-strong">{tText("Network development")}</p><h1 className="mt-2 font-display text-3xl font-bold text-institutional">{tText("Affiliation Requests")}</h1><p className="mt-2 text-slate-600">{tText("Review institutional expressions of interest. Approval does not automatically create a verified affiliate.")}</p></header><OperationalQueue kind="affiliation" statuses={["new", "under-review", "more-information-required", "approved", "rejected", "closed"]} emptyText="No affiliation requests yet." rows={rows.map((row) => ({ id: row.id, title: row.institution, subtitle: `${row.contactPerson} · ${row.city} · ${row.email} · ${row.phone}`, detail: row.message, status: row.status, assignedTo: row.assignedTo, receivedAt: row.createdAt }))} /></div>;
}
