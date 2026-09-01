import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Landmark, Newspaper } from "lucide-react";
import { HomeHero } from "@/components/home/HomeHero";
import { NetworkPreview } from "@/components/home/NetworkPreview";
import { AffiliatePreview } from "@/components/home/AffiliatePreview";
import { VerificationNote } from "@/components/layout/VerificationNote";
import { buttonVariants } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { CTASection } from "@/components/ui/CTASection";
import { IconFeature } from "@/components/ui/IconFeature";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { institution } from "@/config/institution";
import {
  editorialPreviews,
  homepageServices,
  institutionalPillars,
  knowledgePreview,
  vtimeTopics,
} from "@/data/homepage";
import trainingImage from "../../../public/images/home/vtime-training.webp";

export default function HomePage() {
  return (
    <>
      <HomeHero />

      <Section tone="surface" spacing="compact" className="border-b border-border">
        <Container>
          <VerificationNote>
            <strong>Verified institutional reference:</strong> Cameroon&apos;s Ministry of Finance lists {institution.legalName} in {institution.location.city} under approval order {institution.approval.order}, dated 5 April 2018. No unconfirmed network totals, rates, financial figures, or leadership claims are presented here.
          </VerificationNote>
        </Container>
      </Section>

      <Section tone="muted">
        <Container>
          <SectionHeader eyebrow="Institutional pillars" title="A stronger foundation for cooperative finance." subtitle="RECCU-CAM brings institutional support, shared capability, and responsible cooperation together around the needs of credit unions and their communities." />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {institutionalPillars.map((pillar) => <IconFeature key={pillar.title} {...pillar} />)}
          </div>
        </Container>
      </Section>

      <Section tone="surface">
        <Container>
          <SectionHeader eyebrow="Services" title="Institutional support across the cooperative lifecycle." subtitle="Explore six connected service areas designed to help affiliate institutions strengthen governance, operations, people, and shared infrastructure." />
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {homepageServices.map((service) => (
              <Link key={service.title} href={service.href ?? "/services"} className="group rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-4">
                <Card padding="default" className="h-full transition-[border-color,box-shadow,transform] duration-base motion-safe:group-hover:-translate-y-1 group-hover:border-primary-200 group-hover:shadow-raised">
                  <span className="grid h-12 w-12 place-items-center rounded-control bg-primary-50 text-forest" aria-hidden="true"><service.icon className="h-6 w-6" /></span>
                  <h3 className="mt-6 font-display text-h4 text-institutional">{service.title}</h3>
                  <p className="mt-3 text-body text-muted-foreground">{service.description}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-forest">Explore service <ArrowRight className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-1" aria-hidden="true" /></span>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container>
          <SectionHeader eyebrow="Network preview" title="See the cooperative network in context." subtitle="A lightweight view of the source-labelled starter directory. The full map provides institution-level context without third-party tracking." />
          <div className="mt-10"><NetworkPreview /></div>
        </Container>
      </Section>

      <Section tone="surface">
        <Container>
          <SectionHeader eyebrow="Affiliate preview" title="Meet institutions in the source-listed directory." subtitle="These entries are transcribed from the cited MINFI list as at 31 December 2021 and are not presented as a complete or current membership count." />
          <div className="mt-10"><AffiliatePreview /></div>
        </Container>
      </Section>

      <Section tone="brand" className="overflow-hidden">
        <Container>
          <div className="relative overflow-hidden rounded-panel border border-white/10 bg-institutional p-8 shadow-raised sm:p-10 lg:p-14">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-pill border border-accent-300/20" aria-hidden="true" />
            <div className="absolute -bottom-36 right-24 h-80 w-80 rounded-pill border border-primary-400/20" aria-hidden="true" />
            <div className="relative grid gap-10 lg:grid-cols-[1fr_.72fr] lg:items-end">
              <div className="max-w-reading">
                <span className="grid h-12 w-12 place-items-center rounded-control bg-white/10 text-accent-300" aria-hidden="true"><Landmark className="h-6 w-6" /></span>
                <p className="mt-6 text-meta uppercase text-accent-300">Affiliate Banking</p>
                <h2 className="mt-3 font-display text-h2 text-white">Financial Strength Within the Network</h2>
                <p className="mt-5 text-lead text-primary-100">Structured network-based support focused on institutional liquidity, financial resilience, cooperative growth, and responsible relationship management—without guaranteed finance or unverified rates.</p>
              </div>
              <div className="lg:text-right">
                <Link href="/services/affiliate-banking" className={buttonVariants({ variant: "accent", size: "lg" })}>
                  Explore Affiliate Banking <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="surface">
        <Container className="grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div className="relative overflow-hidden rounded-panel bg-muted shadow-card">
            <Image
              src={trainingImage}
              alt="Illustrative professional training workshop with Cameroonian cooperative staff"
              sizes="(max-width: 1024px) 100vw, 44vw"
              className="h-auto w-full object-cover"
            />
            <p className="absolute bottom-4 left-4 rounded-pill bg-institutional/80 px-3 py-1.5 text-xs text-primary-100 backdrop-blur-sm">Illustrative training imagery</p>
          </div>
          <div>
            <SectionHeader eyebrow="VTIME" title="Developing the Next Generation of Microfinance Professionals" subtitle="Practical learning pathways connect cooperative principles with the governance, financial, compliance, leadership, and digital capabilities institutions need." />
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {vtimeTopics.map(([topic, Icon]) => (
                <div key={topic} className="rounded-control border border-border bg-muted p-4">
                  <Icon className="h-5 w-5 text-gold-strong" aria-hidden="true" />
                  <p className="mt-3 text-sm font-semibold text-institutional">{topic}</p>
                </div>
              ))}
            </div>
            <Link href="/vtime" className={`${buttonVariants({ variant: "default", size: "lg" })} mt-8`}>
              Explore VTIME <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-start">
            <div>
              <SectionHeader eyebrow="Knowledge Centre" title="Trusted resources, clearly controlled." subtitle="Each collection is designed around source ownership, effective dates, versions, and visible publication status." />
              <Link href="/knowledge" className={`${buttonVariants({ variant: "default", size: "lg" })} mt-8`}>
                Enter Knowledge Centre <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {knowledgePreview.map((item, index) => (
                <Link key={item.title} href={item.href ?? "/knowledge"} className={`group rounded-card border border-border bg-surface p-5 shadow-card transition-[border-color,box-shadow,transform] duration-base motion-safe:hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-raised ${index === knowledgePreview.length - 1 ? "sm:col-span-2" : ""}`}>
                  <div className="flex items-start gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-control bg-primary-50 text-forest" aria-hidden="true"><item.icon className="h-5 w-5" /></span>
                    <div><h3 className="font-display text-h4 text-institutional">{item.title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p></div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="surface">
        <Container>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeader eyebrow="News & Events" title="Editorial ideas, awaiting approval." subtitle="Demo content is shown separately from the verified newsroom and is not presented as published RECCU-CAM news." />
            <Link href="/news" className={buttonVariants({ variant: "secondary" })}>Visit Newsroom <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {editorialPreviews.map((story) => (
              <article key={story.title} className="flex h-full flex-col rounded-card border border-border bg-surface p-6 shadow-card">
                <div className="flex items-center justify-between gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-control bg-gold-subtle text-gold-strong" aria-hidden="true"><Newspaper className="h-5 w-5" /></span>
                  <span className="rounded-pill bg-warning-subtle px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-warning">Editorial preview</span>
                </div>
                <p className="mt-6 text-meta uppercase text-gold-strong">{story.category}</p>
                <h3 className="mt-2 font-display text-h4 text-institutional">{story.title}</h3>
                <p className="mt-3 text-body text-muted-foreground">{story.summary}</p>
                <p className="mt-auto flex items-center gap-2 pt-6 text-xs font-semibold text-muted-foreground"><BadgeCheck className="h-4 w-4" aria-hidden="true" /> Not published news</p>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <CTASection
        eyebrow="Affiliation"
        title="Grow Within a Stronger Cooperative Network"
        description="Begin a structured conversation about institutional alignment, affiliation expectations, and the next verified steps."
        actions={
          <Link href="/network/become-an-affiliate" className={buttonVariants({ variant: "accent", size: "lg" })}>
            Start Affiliation Inquiry <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        }
      />
    </>
  );
}
