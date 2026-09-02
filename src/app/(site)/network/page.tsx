import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, Handshake, MapPinned, ShieldCheck } from "lucide-react";
import { AffiliatePreview } from "@/components/home/AffiliatePreview";
import { NetworkPreview } from "@/components/home/NetworkPreview";
import { PageIntro } from "@/components/layout/PageIntro";
import { VerificationNote } from "@/components/layout/VerificationNote";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { CTASection } from "@/components/ui/CTASection";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { institution } from "@/config/institution";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Our Network",
  description: "Explore the RECCU-CAM network overview, source-labelled affiliate directory, verified map locations, and affiliation pathway.",
  path: "/network",
});

const networkPathways = [
  {
    title: "Affiliate Directory",
    description: "Search and filter source-labelled institutional records with unknown details left unpublished.",
    href: "/network/affiliates",
    action: "Browse the directory",
    icon: Building2,
  },
  {
    title: "Interactive Network Map",
    description: "Explore institutions geographically only where complete coordinates have been verified.",
    href: "/network/map",
    action: "Open the network map",
    icon: MapPinned,
  },
  {
    title: "Become an Affiliate",
    description: "Review the public affiliation pathway and begin an inquiry without implying eligibility or approval.",
    href: "/network/become-an-affiliate",
    action: "Review the affiliation pathway",
    icon: Handshake,
  },
] as const;

export default function NetworkPage() {
  return (
    <>
      <PageIntro
        eyebrow="Our Network"
        title="Cooperative Connection, Presented with Clarity"
        description="Use one dedicated space to explore the source-labelled institutional directory, verified map locations, and the public affiliation pathway."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Our Network", href: "/network" },
        ]}
        actions={
          <>
            <Link href="/network/affiliates" className={buttonVariants({ variant: "accent", size: "lg" })}>
              Browse Affiliate Directory <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/network/map" className={buttonVariants({ variant: "outline", size: "lg", className: "border-white/30 bg-white/5 text-white hover:border-white/60 hover:bg-white/10" })}>
              Explore Network Map <MapPinned className="h-4 w-4" aria-hidden="true" />
            </Link>
          </>
        }
      />

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-start">
            <div>
              <SectionHeader
                eyebrow="Network overview"
                title="A responsible gateway to institutional discovery."
                subtitle={`${institution.legalName} is presented through verified institutional references, source-labelled directory records, and clearly separated public pathways.`}
              />
              <p className="mt-6 max-w-reading text-body text-muted-foreground">
                This overview brings directory discovery, geographic exploration, and affiliation information together without converting historical source records into unverified current claims.
              </p>
            </div>
            <Card variant="muted" padding="spacious" className="relative overflow-hidden">
              <div aria-hidden="true" className="absolute -right-12 -top-12 h-36 w-36 rounded-pill bg-gold/15" />
              <Badge variant="accent">Verified institutional context</Badge>
              <dl className="relative mt-6 space-y-5 text-sm">
                <div>
                  <dt className="text-muted-foreground">Institution</dt>
                  <dd className="mt-1 font-semibold text-institutional">{institution.displayName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Headquarters reference</dt>
                  <dd className="mt-1 font-semibold text-institutional">{institution.location.city}, {institution.location.country}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Approval order</dt>
                  <dd className="mt-1 font-semibold text-institutional">{institution.approval.order}</dd>
                </div>
              </dl>
              <a href={institution.approval.sourceUrl} target="_blank" rel="noreferrer" className="relative mt-7 inline-flex items-center gap-2 text-sm font-semibold text-forest underline decoration-gold underline-offset-4">
                View the MINFI source <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </Card>
          </div>
          <div className="mt-10">
            <VerificationNote>
              Directory entries are transcribed from the cited MINFI list as at 31 December 2021. They are not presented as a complete or current membership count, and missing contact or location details are not inferred.
            </VerificationNote>
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container>
          <SectionHeader
            eyebrow="Explore the network"
            title="Choose the pathway that matches your purpose."
            subtitle="Each destination has a clear role, functioning controls, and responsible publication boundaries."
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {networkPathways.map((pathway) => {
              const Icon = pathway.icon;
              return (
                <Link key={pathway.href} href={pathway.href} className="group rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-4">
                  <Card padding="default" className="flex h-full flex-col transition-[border-color,box-shadow,transform] duration-base motion-safe:group-hover:-translate-y-1 group-hover:border-primary-200 group-hover:shadow-raised">
                    <span className="grid h-12 w-12 place-items-center rounded-control bg-primary-50 text-forest" aria-hidden="true">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h2 className="mt-6 font-display text-h4 text-institutional">{pathway.title}</h2>
                    <p className="mt-3 text-body text-muted-foreground">{pathway.description}</p>
                    <span className="mt-auto inline-flex items-center gap-2 pt-7 text-sm font-semibold text-forest">
                      {pathway.action} <ArrowRight className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </Card>
                </Link>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeader
            eyebrow="Directory preview"
            title="Source-listed institutions, shown without invented details."
            subtitle="Use the full directory to search by available institutional and location fields."
          />
          <div className="mt-10"><AffiliatePreview /></div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container>
          <SectionHeader
            eyebrow="Geographic view"
            title="Location data with visible verification boundaries."
            subtitle="The interactive map only plots institutions whose coordinates are complete and verified."
          />
          <div className="mt-10"><NetworkPreview /></div>
        </Container>
      </Section>

      <CTASection
        eyebrow="Affiliation pathway"
        title="Start with clear information and a structured inquiry."
        description="Review the public affiliation guidance and submit an inquiry for institutional follow-up. Submission does not guarantee eligibility or approval."
        actions={
          <Link href="/network/become-an-affiliate" className={buttonVariants({ variant: "accent", size: "lg" })}>
            <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Become an Affiliate
          </Link>
        }
      />
    </>
  );
}
