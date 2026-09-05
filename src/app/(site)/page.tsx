import type { Metadata } from "next";
import { ArrowUpRight, Check, Quote } from "lucide-react";
import Link from "next/link";
import { HomeHero } from "@/components/home/HomeHero";
import { buttonVariants } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CTASection } from "@/components/ui/CTASection";
import { Section } from "@/components/ui/Section";
import { institution } from "@/config/institution";
import { createPageMetadata } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { parseHomepageSections } from "@/data/homepage-cms";
import { readPublicData } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Building Stronger Credit Unions. Building Stronger Communities.",
  description: "Meet RECCU-CAM, an apex cooperative financial network supporting stronger institutions, responsible governance, and sustainable growth in Cameroon.",
  path: "/",
});

const purposeThemes = [
  ["Stronger institutions", "Institutional strength creates the foundation for continuity, public confidence, and responsible growth."],
  ["Responsible governance", "Clear oversight and accountable decision-making protect cooperative purpose over the long term."],
  ["Sustainable cooperative finance", "Professional practice and resilience help institutions remain useful to members and communities."],
] as const;

export default async function HomePage() {
  const now = new Date();
  const [homepageContent, sectionsRecord, notice] = await Promise.all([
    readPublicData(
      "homepage hero",
      () => prisma.homepageContent.findUnique({ where: { id: "default" } }),
      null,
    ),
    readPublicData(
      "homepage sections",
      () =>
        prisma.pageContent.findUnique({
          where: {
            pageKey_locale_status: {
              pageKey: "homepage-sections",
              locale: "en",
              status: "published",
            },
          },
        }),
      null,
    ),
    readPublicData(
      "public notice",
      () =>
        prisma.announcement.findFirst({
          where: {
            isPublished: true,
            audience: "PUBLIC",
            OR: [{ startDate: null }, { startDate: { lte: now } }],
            AND: [{ OR: [{ expiryDate: null }, { expiryDate: { gt: now } }] }],
          },
          orderBy: [{ priority: "desc" }, { publishedAt: "desc" }],
        }),
      null,
    ),
  ]);
  const cms = parseHomepageSections(sectionsRecord?.content);
  return (
    <>
      {homepageContent?.showHero !== false && <HomeHero content={homepageContent} />}

      {notice && <section className="border-b border-amber-200 bg-amber-50 py-4"><Container className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-800">Official notice · {notice.priority}</p><p className="mt-1 font-semibold text-institutional">{notice.title}</p></div><p className="max-w-2xl text-sm text-slate-700">{notice.opening}</p></Container></section>}

      <Section tone="surface" className="overflow-hidden">
        <Container className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div>
            <p className="text-meta uppercase text-gold-strong">Who we are</p>
            <h2 className="mt-4 max-w-md font-display text-h2 text-institutional">
              {cms.whoTitle}
            </h2>
          </div>
          <div className="relative border-l border-primary-200 pl-6 sm:pl-10">
            <span aria-hidden="true" className="absolute -left-px top-0 h-24 w-px bg-gold" />
            <p className="font-display text-2xl leading-9 text-institutional sm:text-3xl sm:leading-10">
              {cms.whoDescription}
            </p>
            <div className="mt-8 grid gap-5 text-body text-muted-foreground sm:grid-cols-2 sm:gap-8">
              <p>
                It promotes institutional strength, responsible practice, and sustainable growth across the cooperative financial sector.
              </p>
              <p>
                Its purpose connects stronger institutions with financial inclusion, cooperative development, and lasting community confidence.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-20">
          <div className="max-w-2xl">
            <p className="text-meta uppercase text-gold-strong">Our purpose</p>
            <h2 className="mt-4 font-display text-h2 text-institutional">
              {cms.missionTitle}
            </h2>
            <Quote className="mt-8 h-8 w-8 text-gold" aria-hidden="true" />
            <p className="mt-5 font-display text-2xl leading-9 text-forest sm:text-3xl sm:leading-10">
              {cms.missionBody}
            </p>
          </div>
          <div className="divide-y divide-border border-y border-border">
            {purposeThemes.map(([title, description], index) => (
              <article key={title} className="grid gap-4 py-7 sm:grid-cols-[3rem_1fr]">
                <span className="font-display text-lg text-gold-strong" aria-hidden="true">0{index + 1}</span>
                <div>
                  <h3 className="font-display text-h4 text-institutional">{title}</h3>
                  <p className="mt-2 text-body text-muted-foreground">{description}</p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="brand" className="overflow-hidden">
        <Container className="relative grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-24">
          <div aria-hidden="true" className="absolute -right-32 -top-40 h-96 w-96 rounded-pill border border-white/10" />
          <div>
            <p className="text-meta uppercase text-accent-300">Why RECCU-CAM exists</p>
            <h2 className="mt-4 max-w-lg font-display text-h2 text-white">
              {cms.visionTitle}
            </h2>
          </div>
          <div className="relative space-y-6 border-l border-white/15 pl-6 text-lg leading-8 text-primary-100 sm:pl-10">
            <span aria-hidden="true" className="absolute -left-px top-0 h-28 w-px bg-gold" />
            <p>
              Cooperative finance begins with local trust. Individual institutions carry that trust every day, while navigating expectations around governance, resilience, professionalism, and responsible growth.
            </p>
            <p>
              An apex organization creates common ground: a place where institutional direction can be reinforced, standards can be elevated, and cooperative purpose can remain central as the financial environment evolves.
            </p>
            <p className="font-display text-xl leading-8 text-white">
              {cms.visionBody}
            </p>
          </div>
        </Container>
      </Section>

      <Section tone="surface">
        <Container>
          <div className="max-w-2xl">
            <p className="text-meta uppercase text-gold-strong">Institutional values</p>
            <h2 className="mt-4 font-display text-h2 text-institutional">
              Principles that keep cooperation meaningful.
            </h2>
            <p className="mt-5 text-body text-muted-foreground">
              These values express the institutional character required for durable cooperative progress.
            </p>
          </div>
          <div className="mt-12 grid border-y border-border sm:grid-cols-2 lg:grid-cols-5">
            {cms.values.map(({ title, description }, index) => (
              <article
                key={title}
                className="border-b border-border py-7 last:border-b-0 sm:px-6 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0 lg:[&:nth-child(odd)]:border-r"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-pill bg-primary-50 text-forest" aria-hidden="true">
                  <Check className="h-4 w-4" />
                </span>
                <p className="mt-5 text-meta text-gold-strong" aria-hidden="true">0{index + 1}</p>
                <h3 className="mt-2 font-display text-xl text-institutional">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {cms.leaderName && cms.leaderMessage && <Section tone="surface">
        <Container className="grid gap-8 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20">
          <div><p className="text-meta uppercase text-gold-strong">Leadership message</p><h2 className="mt-4 font-display text-h2 text-institutional">A word from our leadership.</h2></div>
          <blockquote className="border-l border-gold pl-6 sm:pl-10"><Quote className="h-8 w-8 text-gold" /><p className="mt-5 font-display text-2xl leading-9 text-institutional">{cms.leaderMessage}</p><footer className="mt-6 text-sm"><strong className="block text-institutional">{cms.leaderName}</strong><span className="text-muted-foreground">{cms.leaderRole}</span></footer></blockquote>
        </Container>
      </Section>}

      <Section tone="muted">
        <Container className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
          <div>
            <p className="text-meta uppercase text-gold-strong">Verified institutional context</p>
            <h2 className="mt-4 font-display text-h2 text-institutional">
              An identity grounded in a public record.
            </h2>
            <p className="mt-6 max-w-reading text-body text-muted-foreground">
              The Ministry of Finance public listing records RECCU-CAM&apos;s legal identity, Bamenda location, and approval reference. Information that has not been confirmed is intentionally left unpublished.
            </p>
          </div>
          <div className="rounded-panel border border-primary-100 bg-surface p-6 shadow-card sm:p-8">
            <dl className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-meta uppercase text-muted-foreground">Legal name</dt>
                <dd className="mt-2 font-display text-xl text-institutional">{institution.legalName}</dd>
              </div>
              <div>
                <dt className="text-meta uppercase text-muted-foreground">Recorded location</dt>
                <dd className="mt-2 font-semibold text-institutional">{institution.location.city}, {institution.location.country}</dd>
              </div>
              <div>
                <dt className="text-meta uppercase text-muted-foreground">Approval reference</dt>
                <dd className="mt-2 font-semibold text-institutional">{institution.approval.order}</dd>
              </div>
            </dl>
            <a
              href={institution.approval.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-forest underline decoration-gold underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
            >
              View the official MINFI reference <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </Container>
      </Section>

      {homepageContent?.showServices !== false && <CTASection
        eyebrow="Contact RECCU-CAM"
        title={cms.contactTitle}
        description={cms.contactDescription}
        actions={
          <>
            <Link href="/contact" className={buttonVariants({ variant: "accent", size: "lg" })}>
              {cms.contactButtonText}
            </Link>
            <Link href="/about" className={buttonVariants({ variant: "secondary", size: "lg", className: "border-white/30 bg-white/10 text-white hover:border-white/60 hover:bg-white/15" })}>
              Learn More About Us
            </Link>
          </>
        }
      />}
    </>
  );
}
