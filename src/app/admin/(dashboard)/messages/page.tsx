import { prisma } from "@/lib/prisma";
import { OperationalQueue } from "@/components/admin/OperationalQueue";
import type { Prisma } from "@/generated/prisma/client";

export default async function AdminMessagesPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; purpose?: string }> }) {
  const filters = await searchParams;
  const where: Prisma.ContactMessageWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.purpose) where.purpose = filters.purpose;
  if (filters.q) where.OR = ["name", "organization", "phone", "email", "subject"].map((field) => ({ [field]: { contains: filters.q, mode: "insensitive" } })) as Prisma.ContactMessageWhereInput[];
  const [messages, newCount] = await Promise.all([prisma.contactMessage.findMany({ where, orderBy: { createdAt: "desc" }, take: 100 }), prisma.contactMessage.count({ where: { status: "new" } })]);
  return <div className="space-y-6"><header><p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-strong">Communications</p><div className="mt-2 flex flex-wrap items-center gap-3"><h1 className="font-display text-3xl font-bold text-institutional">Contact Inquiry Inbox</h1>{newCount > 0 && <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">{newCount} new</span>}</div><p className="mt-2 text-slate-600">Route, assign, review, and close public website inquiries.</p></header>
    <form className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_180px_220px_auto]"><input name="q" defaultValue={filters.q} placeholder="Search sender, organization, phone, email or subject" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" /><select name="status" defaultValue={filters.status} className="rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="">All statuses</option>{["new","in-review","responded","closed"].map((v) => <option key={v} value={v}>{v}</option>)}</select><input name="purpose" defaultValue={filters.purpose} placeholder="Purpose" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" /><button className="rounded-lg bg-institutional px-4 py-2 text-sm font-semibold text-white">Filter</button></form>
    <OperationalQueue kind="message" statuses={["new","in-review","responded","closed"]} emptyText="No inquiries match these filters." rows={messages.map((message) => ({ id: message.id, title: `${message.name} — ${message.subject}`, subtitle: [message.organization, message.purpose, message.email, message.phone].filter(Boolean).join(" · "), detail: message.message, status: message.status, assignedTo: message.assignedTo, receivedAt: message.createdAt }))} />
  </div>;
}
