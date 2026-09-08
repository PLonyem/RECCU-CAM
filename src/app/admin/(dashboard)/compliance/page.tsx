import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { createComplianceRecord, updateComplianceRecord } from "@/app/admin/(dashboard)/operations/actions";
import { getTranslationDraft } from "@/lib/localized-content";

export default async function CompliancePage() {
  const [records, affiliates] = await Promise.all([
    prisma.complianceRecord.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.affiliate.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-7">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-strong">Compliance administration</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-institutional">Compliance</h1>
        <p className="mt-2 text-slate-600">Publish editable, verified notices and required submissions. No regulatory deadlines are pre-invented.</p>
      </header>
      <Card className="p-6">
        <h2 className="font-semibold text-institutional">Create compliance item</h2>
        <form action={createComplianceRecord} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-600">English ✓<input required name="title" placeholder="Title" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
          <label className="text-xs font-semibold text-slate-600">Français — Missing<input name="titleFr" placeholder="Titre" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
          <input required name="category" placeholder="Category" className="rounded-lg border border-slate-300 px-3 py-2" />
          <textarea required name="description" placeholder="Verified guidance or submission requirement (English)" className="rounded-lg border border-slate-300 px-3 py-2" />
          <textarea name="descriptionFr" placeholder="Instructions vérifiées ou exigence de soumission (français)" className="rounded-lg border border-slate-300 px-3 py-2" />
          <label className="text-xs font-semibold text-slate-600">Due date (optional)<input name="dueDate" type="date" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
          <select name="audience" className="rounded-lg border border-slate-300 px-3 py-2"><option value="all-affiliates">All affiliates</option><option value="specific-affiliate">Specific affiliate</option></select>
          <select name="affiliateId" className="rounded-lg border border-slate-300 px-3 py-2 sm:col-span-2"><option value="">All affiliates</option>{affiliates.map((affiliate) => <option key={affiliate.id} value={affiliate.id}>{affiliate.name}</option>)}</select>
          <select name="publication" defaultValue="draft" aria-label="Publication status" className="rounded-lg border border-slate-300 px-3 py-2 sm:col-span-2"><option value="draft">Save as draft</option><option value="published">Publish now</option></select>
          <button className="rounded-lg bg-institutional px-4 py-2 font-semibold text-white sm:col-span-2">Save item</button>
        </form>
      </Card>
      {records.length ? (
        <div className="space-y-3">
          {records.map((record) => {
            const french = getTranslationDraft(record.translations);
            const titleFr = typeof french.title === "string" ? french.title : "";
            const descriptionFr = typeof french.description === "string" ? french.description : "";
            return (
            <Card key={record.id} className="p-5">
              <div className="flex flex-wrap justify-between gap-3">
                <div><p className="text-xs font-semibold uppercase tracking-wide text-gold-strong">{record.category}</p><h2 className="mt-1 font-semibold text-slate-900">{record.title}</h2></div>
                <Badge>{record.status}</Badge>
              </div>
              <p className="mt-3 text-sm text-slate-600">{record.description}</p>
              <details className="mt-4 border-t border-slate-100 pt-4">
              <summary className="cursor-pointer text-sm font-semibold text-institutional">Edit content and workflow</summary>
              <form action={updateComplianceRecord} className="mt-4 grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="id" value={record.id} />
                <label className="text-xs font-semibold text-slate-600">English ✓<input required name="title" defaultValue={record.title} aria-label="Title in English" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
                <label className="text-xs font-semibold text-slate-600">{titleFr && descriptionFr ? "Français ✓" : "Français — Missing"}<input name="titleFr" defaultValue={titleFr} aria-label="Titre en français" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
                <input required name="category" defaultValue={record.category} aria-label="Category" className="rounded-lg border border-slate-300 px-3 py-2" />
                <textarea required name="description" defaultValue={record.description} aria-label="Description in English" className="rounded-lg border border-slate-300 px-3 py-2" />
                <textarea name="descriptionFr" defaultValue={descriptionFr} aria-label="Description en français" className="rounded-lg border border-slate-300 px-3 py-2" />
                <label className="text-xs font-semibold text-slate-600">Due date<input name="dueDate" type="date" defaultValue={record.dueDate?.toISOString().slice(0, 10) ?? ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
                <label className="text-xs font-semibold text-slate-600">Audience<select name="audience" defaultValue={record.audience} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"><option value="all-affiliates">All affiliates</option><option value="specific-affiliate">Specific affiliate</option></select></label>
                <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Affiliate<select name="affiliateId" defaultValue={record.affiliateId ?? ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"><option value="">All affiliates</option>{affiliates.map((affiliate) => <option key={affiliate.id} value={affiliate.id}>{affiliate.name}</option>)}</select></label>
                <label className="text-xs font-semibold text-slate-600">Workflow status<select name="status" defaultValue={record.status} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="pending">Pending</option><option value="in-review">In review</option><option value="completed">Completed</option><option value="archived">Archived</option></select></label>
                <label className="text-xs font-semibold text-slate-600">Publication<select name="publication" defaultValue={record.published ? "published" : "draft"} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="draft">Draft</option><option value="published">Published</option></select></label>
                <button className="rounded-lg bg-institutional px-4 py-2 text-sm font-semibold text-white sm:col-span-2">Update item</button>
              </form>
              </details>
            </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center text-sm text-slate-500">No compliance resources yet.</Card>
      )}
    </div>
  );
}
