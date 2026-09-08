import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { createTrainingProgram, updateTrainingProgram } from "@/app/admin/(dashboard)/operations/actions";
import { getTranslationDraft } from "@/lib/localized-content";

export default async function VtimeAdminPage() {
  const programs = await prisma.trainingProgram.findMany({
    include: {
      _count: { select: { registrations: true } },
      registrations: { orderBy: { createdAt: "desc" }, take: 100 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-7">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-strong">Training administration</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-institutional">VTIME</h1>
        <p className="mt-2 text-slate-600">Publish verified programmes and monitor registrations.</p>
      </header>
      <Card className="p-6">
        <h2 className="font-semibold text-institutional">Create training programme</h2>
        <form action={createTrainingProgram} className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 grid gap-4 rounded-lg border border-primary-100 p-4 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-600">English ✓<input required name="title" placeholder="Programme title" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label className="text-xs font-semibold text-slate-600">French — Missing<input name="titleFr" placeholder="Programme title in French" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label className="text-xs font-semibold text-slate-600 sm:col-span-1">English summary<textarea required name="summary" placeholder="Programme summary" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label className="text-xs font-semibold text-slate-600 sm:col-span-1">French summary<textarea name="summaryFr" placeholder="Programme summary in French" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
          </div>
          <input required name="category" placeholder="Category" className="rounded-lg border border-slate-300 px-3 py-2" />
          <input required name="level" placeholder="Level" className="rounded-lg border border-slate-300 px-3 py-2" />
          <select name="format" className="rounded-lg border border-slate-300 px-3 py-2">
            <option value="">Format pending</option>
            <option value="in-person">In person</option>
            <option value="online">Online</option>
            <option value="hybrid">Hybrid</option>
          </select>
          <input name="venue" placeholder="Venue" className="rounded-lg border border-slate-300 px-3 py-2" />
          <input name="capacity" type="number" min="1" placeholder="Capacity" className="rounded-lg border border-slate-300 px-3 py-2" />
          <select name="publicationStatus" defaultValue="draft" aria-label="Publication status" className="rounded-lg border border-slate-300 px-3 py-2">
            <option value="draft">Save as draft</option>
            <option value="published">Publish now</option>
          </select>
          <label className="text-xs font-semibold text-slate-600">
            Start date
            <input name="startDate" type="date" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            End date
            <input name="endDate" type="date" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <button className="rounded-lg bg-institutional px-4 py-2 font-semibold text-white sm:col-span-2">Save programme</button>
        </form>
      </Card>
      <section>
        <h2 className="mb-3 font-semibold text-institutional">Programmes</h2>
        {programs.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {programs.map((program) => {
              const french = getTranslationDraft(program.translations);
              const titleFr = typeof french.title === "string" ? french.title : "";
              const summaryFr = typeof french.summary === "string" ? french.summary : "";
              return (
              <Card key={program.id} className="p-5">
                <div className="flex justify-between gap-3">
                  <h3 className="font-semibold text-slate-900">{program.title}</h3>
                  <Badge>{program.published ? "Published" : "Draft"}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-600">{program.summary}</p>
                <p className="mt-4 text-xs text-slate-500">{program._count.registrations} registrations · {program.registrationStatus}</p>
                <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
                  {program.published && <Link href={`/vtime/programs/${program.slug}`} className="text-forest hover:underline">Public preview</Link>}
                </div>
                <details className="mt-5 border-t border-slate-100 pt-4">
                  <summary className="cursor-pointer text-sm font-semibold text-institutional">Edit publication and schedule</summary>
                  <form action={updateTrainingProgram} className="mt-4 grid gap-3 sm:grid-cols-2">
                    <input type="hidden" name="id" value={program.id} />
                    <label className="text-xs font-semibold text-slate-600">English ✓<input required name="title" defaultValue={program.title} aria-label="Programme title" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
                    <label className="text-xs font-semibold text-slate-600">{titleFr && summaryFr ? "French ✓" : "French — Missing"}<input name="titleFr" defaultValue={titleFr} aria-label="Programme title in French" placeholder="Programme title in French" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
                    <input required name="category" defaultValue={program.category} aria-label="Category" className="rounded-lg border border-slate-300 px-3 py-2" />
                    <textarea required name="summary" defaultValue={program.summary} aria-label="Programme summary in English" className="rounded-lg border border-slate-300 px-3 py-2" />
                    <textarea name="summaryFr" defaultValue={summaryFr} aria-label="Programme summary in French" placeholder="Programme summary in French" className="rounded-lg border border-slate-300 px-3 py-2" />
                    <input required name="level" defaultValue={program.level} aria-label="Level" className="rounded-lg border border-slate-300 px-3 py-2" />
                    <select name="format" defaultValue={program.format ?? ""} aria-label="Format" className="rounded-lg border border-slate-300 px-3 py-2"><option value="">Format pending</option><option value="in-person">In person</option><option value="online">Online</option><option value="hybrid">Hybrid</option></select>
                    <input name="venue" defaultValue={program.venue ?? ""} aria-label="Venue" placeholder="Venue" className="rounded-lg border border-slate-300 px-3 py-2" />
                    <input name="capacity" defaultValue={program.capacity ?? ""} type="number" min="1" aria-label="Capacity" placeholder="Capacity" className="rounded-lg border border-slate-300 px-3 py-2" />
                    <label className="text-xs font-semibold text-slate-600">Start date<input name="startDate" defaultValue={program.startDate?.toISOString().slice(0, 10) ?? ""} type="date" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
                    <label className="text-xs font-semibold text-slate-600">End date<input name="endDate" defaultValue={program.endDate?.toISOString().slice(0, 10) ?? ""} type="date" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
                    <select name="publicationStatus" defaultValue={!program.published && program.registrationStatus === "archived" ? "archived" : !program.published ? "draft" : program.registrationStatus === "registration-closed" ? "closed" : "published"} aria-label="Publication status" className="rounded-lg border border-slate-300 px-3 py-2 sm:col-span-2"><option value="draft">Draft / unpublished</option><option value="published">Published / registration open</option><option value="closed">Published / registration closed</option><option value="archived">Archived</option></select>
                    <button className="rounded-lg bg-institutional px-4 py-2 font-semibold text-white sm:col-span-2">Update programme</button>
                  </form>
                </details>
                <details className="mt-4 border-t border-slate-100 pt-4">
                  <summary className="cursor-pointer text-sm font-semibold text-institutional">Registrations ({program._count.registrations})</summary>
                  {program.registrations.length > 0 ? (
                    <div className="mt-3 space-y-3">
                      {program.registrations.map((registration) => (
                        <div key={registration.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                          <p className="font-semibold text-slate-900">{registration.participantName} · {registration.institution}</p>
                          <p className="mt-1 text-slate-600">{registration.role} · {registration.email} · {registration.phone}</p>
                          <p className="mt-1 text-xs text-slate-500">{registration.status} · {registration.createdAt.toLocaleString("en-GB")}</p>
                        </div>
                      ))}
                    </div>
                  ) : <p className="mt-3 text-sm text-slate-500">No registrations yet.</p>}
                </details>
              </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center text-sm text-slate-500">No VTIME programmes yet.</Card>
        )}
      </section>
    </div>
  );
}
