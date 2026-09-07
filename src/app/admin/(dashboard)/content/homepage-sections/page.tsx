import { prisma } from "@/lib/prisma";
import { parseHomepageSections } from "@/data/homepage-cms";
import { HomepageSectionsForm } from "@/components/admin/HomepageSectionsForm";

export default async function HomepageSectionsPage() {
  const [draft, published] = await Promise.all([
    prisma.pageContent.findUnique({ where: { pageKey_locale_status: { pageKey: "homepage-sections", locale: "en", status: "draft" } } }),
    prisma.pageContent.findUnique({ where: { pageKey_locale_status: { pageKey: "homepage-sections", locale: "en", status: "published" } } }),
  ]);
  const data = parseHomepageSections(draft?.content ?? published?.content);
  return <div className="space-y-7">
    <header><p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-strong">Structured content editor</p><h1 className="mt-2 font-display text-3xl font-bold text-institutional">Homepage Sections</h1><p className="mt-2 text-slate-600">Edit mission, vision, values, leadership, and the contact call-to-action using validated plain text.</p></header>
    <HomepageSectionsForm data={data} />
  </div>;
}
