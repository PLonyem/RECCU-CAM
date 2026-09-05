import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { createSiteStructuredData } from "@/lib/structured-data";
import { prisma } from "@/lib/prisma";
import { readPublicData } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await readPublicData(
    "site settings",
    () => prisma.siteSettings.findUnique({ where: { id: "default" } }),
    null,
  );
  return (
    <div className="min-h-full flex flex-col flex-1">
      <JsonLd data={createSiteStructuredData()} />
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[100] -translate-y-20 rounded-control bg-institutional px-4 py-2 text-sm font-semibold text-white shadow-raised transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-gold"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">{children}</main>
      <Footer settings={settings} />
    </div>
  );
}
