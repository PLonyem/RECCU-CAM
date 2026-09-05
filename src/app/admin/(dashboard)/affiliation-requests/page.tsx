import { prisma } from "@/lib/prisma";
import { OperationalQueue } from "@/components/admin/OperationalQueue";

export default async function AffiliationRequestsPage() {
  const rows = await prisma.affiliationInquiry.findMany({ orderBy: { createdAt: "desc" } });
  return <div className="space-y-6"><header><p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-strong">Network development</p><h1 className="mt-2 font-display text-3xl font-bold text-institutional">Affiliation Requests</h1><p className="mt-2 text-slate-600">Review institutional expressions of interest. Approval does not automatically create a verified affiliate.</p></header><OperationalQueue kind="affiliation" statuses={["new","under-review","more-information-required","approved","declined","closed"]} emptyText="No affiliation requests have been received." rows={rows.map((row) => ({ id: row.id, title: row.institution, subtitle: `${row.contactPerson} · ${row.city} · ${row.email} · ${row.phone}`, detail: row.message, status: row.status, assignedTo: row.assignedTo, receivedAt: row.createdAt }))} /></div>;
}
