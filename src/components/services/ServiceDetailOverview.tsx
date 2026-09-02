import Link from "next/link";
import { ArrowLeft, ArrowRight, FileCheck2, ShieldCheck } from "lucide-react";
import { PageIntro } from "@/components/layout/PageIntro";
import { VerificationNote } from "@/components/layout/VerificationNote";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { CTASection } from "@/components/ui/CTASection";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { ServiceArea } from "@/data/services";

interface ServiceDetailOverviewProps {
  service: Readonly<ServiceArea>;
}

export function ServiceDetailOverview({ service }: ServiceDetailOverviewProps) {
  const Icon = service.icon;

  return (
    <>
      <PageIntro
        eyebrow="Institutional services"
        title={service.title}
        description={service.description}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: service.title, href: service.href },
        ]}
        actions={
          <>
            <Link href="/services" className={buttonVariants({ variant: "accent", size: "lg" })}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All Services
            </Link>
            {service.relatedHref && service.relatedLabel && (
              <Link
                href={service.relatedHref}
                className={buttonVariants({ variant: "outline", size: "lg", className: "border-white/30 bg-white/5 text-white hover:border-white/60 hover:bg-white/10" })}
              >
                {service.relatedLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </>
        }
      />

      <Section>
        <Container>
          <VerificationNote>
            This page intentionally excludes unconfirmed delivery arrangements, eligibility conditions, fees, timelines, personnel, and service commitments.
          </VerificationNote>
          <div className="mt-10 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <span className="grid h-14 w-14 place-items-center rounded-control bg-primary-50 text-forest" aria-hidden="true">
                <Icon className="h-7 w-7" />
              </span>
              <SectionHeader
                className="mt-6"
                eyebrow="Service overview"
                title="A dedicated pathway, published responsibly."
                subtitle="The service area and its intended institutional focus are visible now. Detailed operating guidance will appear only after RECCU-CAM confirms it for public use."
              />
            </div>
            <Card variant="muted" padding="spacious" className="relative overflow-hidden">
              <div aria-hidden="true" className="absolute -right-12 -top-12 h-36 w-36 rounded-pill bg-gold/15" />
              <Badge variant="warning">Publication status</Badge>
              <h2 className="mt-6 font-display text-h3 text-institutional">Detailed service guidance is not currently published.</h2>
              <p className="mt-4 text-body text-muted-foreground">
                This route remains useful as a clear, permanent destination while institutional scope, responsibilities, documentation, and engagement procedures are reviewed.
              </p>
              <p className="mt-6 flex items-start gap-2 text-sm font-semibold text-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-forest" aria-hidden="true" />
                No form submission or public statement on this page creates eligibility, approval, or a service commitment.
              </p>
            </Card>
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container className="grid gap-5 md:grid-cols-2">
          <Card padding="default">
            <FileCheck2 className="h-6 w-6 text-gold-strong" aria-hidden="true" />
            <h2 className="mt-5 font-display text-h4 text-institutional">What is available</h2>
            <p className="mt-3 text-body text-muted-foreground">A source-conscious description of the service area, a stable route, and links to relevant public resources where they exist.</p>
          </Card>
          <Card padding="default">
            <ShieldCheck className="h-6 w-6 text-gold-strong" aria-hidden="true" />
            <h2 className="mt-5 font-display text-h4 text-institutional">What remains protected</h2>
            <p className="mt-3 text-body text-muted-foreground">Unconfirmed scope, internal procedures, commercial terms, eligibility rules, and named service contacts remain unpublished.</p>
          </Card>
        </Container>
      </Section>

      <CTASection
        eyebrow="Service directory"
        title="Continue through a verified public pathway."
        description="Return to the complete service architecture or use the related public resource linked for this area."
        actions={
          <Link href="/services" className={buttonVariants({ variant: "accent", size: "lg" })}>
            View All Services <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        }
      />
    </>
  );
}
