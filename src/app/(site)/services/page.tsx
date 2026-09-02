import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight, BadgeCheck, Layers3, ShieldCheck } from "lucide-react";
import { PageIntro } from "@/components/layout/PageIntro";
import { VerificationNote } from "@/components/layout/VerificationNote";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { CTASection } from "@/components/ui/CTASection";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { serviceAreaList } from "@/data/services";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Institutional Services",
  description: "Explore RECCU-CAM service areas for supervision, internal control, capacity building, Affiliate Banking, digital transformation, and institutional support.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <PageIntro
        eyebrow="Institutional services"
        title="Support Organised Around Stronger Institutions"
        description="Explore RECCU-CAM service areas through one clear institutional pathway, with publication status and available next steps presented responsibly."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
        ]}
        actions={
          <>
            <a href="#service-areas" className={buttonVariants({ variant: "accent", size: "lg" })}>
              Explore Service Areas <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </a>
            <Link
              href="/services/affiliate-banking"
              className={buttonVariants({ variant: "outline", size: "lg", className: "border-white/30 bg-white/5 text-white hover:border-white/60 hover:bg-white/10" })}
            >
              Affiliate Banking <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </>
        }
      />

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <SectionHeader
              eyebrow="Service architecture"
              title="Six areas. One clear point of entry."
              subtitle="The Services page brings institutional support pathways together without repeating full service content across the public website."
            />
            <Card variant="muted" padding="spacious" className="relative overflow-hidden">
              <div aria-hidden="true" className="absolute -right-12 -top-12 h-36 w-36 rounded-pill bg-gold/15" />
              <Layers3 className="h-8 w-8 text-forest" aria-hidden="true" />
              <h2 className="mt-6 font-display text-h3 text-institutional">Clear scope and publication status</h2>
              <p className="mt-4 text-body text-muted-foreground">
                Each service has its own route. Detailed guidance appears where it is available; otherwise, the route clearly identifies what still requires institutional confirmation.
              </p>
              <p className="mt-6 flex items-start gap-2 text-sm font-semibold text-foreground">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-forest" aria-hidden="true" />
                No unverified rates, eligibility promises, delivery dates, or outcomes are presented.
              </p>
            </Card>
          </div>
          <div className="mt-10">
            <VerificationNote>
              Service descriptions explain the intended institutional pathway. Final scope, availability, eligibility, documentation, and engagement terms remain subject to RECCU-CAM confirmation.
            </VerificationNote>
          </div>
        </Container>
      </Section>

      <Section id="service-areas" tone="muted" className="scroll-mt-32">
        <Container>
          <SectionHeader
            eyebrow="Service areas"
            title="Choose the institutional need you want to explore."
            subtitle="Every card leads to a functioning service route with either detailed guidance or an intentional publication-status overview."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {serviceAreaList.map((service, index) => {
              const Icon = service.icon;
              const detailed = service.publicationStatus === "detailed";

              return (
                <Link
                  key={service.href}
                  href={service.href}
                  className="group rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-4"
                >
                  <Card padding="default" className="relative flex h-full flex-col overflow-hidden transition-[border-color,box-shadow,transform] duration-base motion-safe:group-hover:-translate-y-1 group-hover:border-primary-200 group-hover:shadow-raised">
                    <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-forest via-gold to-primary-200 opacity-70" />
                    <div className="flex items-start justify-between gap-4">
                      <span className="grid h-12 w-12 place-items-center rounded-control bg-primary-50 text-forest" aria-hidden="true">
                        <Icon className="h-6 w-6" />
                      </span>
                      <span className="font-display text-h4 text-primary-200" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <Badge variant={detailed ? "success" : "primary"} className="mt-6 self-start">
                      {detailed ? "Detailed guidance" : "Service overview"}
                    </Badge>
                    <h3 className="mt-4 font-display text-h4 text-institutional">{service.title}</h3>
                    <p className="mt-3 text-body text-muted-foreground">{service.description}</p>
                    <span className="mt-auto inline-flex items-center gap-2 pt-7 text-sm font-semibold text-forest">
                      {detailed ? "View service details" : "View service overview"}
                      <ArrowRight className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </Card>
                </Link>
              );
            })}
          </div>
        </Container>
      </Section>

      <CTASection
        eyebrow="Available pathways"
        title="Continue with published institutional guidance."
        description="Review Affiliate Banking details or explore VTIME for structured professional and institutional development pathways."
        actions={
          <>
            <Link href="/services/affiliate-banking" className={buttonVariants({ variant: "accent", size: "lg" })}>
              Explore Affiliate Banking <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/vtime" className={buttonVariants({ variant: "outline", size: "lg", className: "border-white/30 bg-white/5 text-white hover:border-white/60 hover:bg-white/10" })}>
              <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Explore VTIME
            </Link>
          </>
        }
      />
    </>
  );
}
