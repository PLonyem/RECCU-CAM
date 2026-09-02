import type { Metadata } from "next";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  Handshake,
  Landmark,
  Network,
  Scale,
  Send,
  ShieldCheck,
  Sprout,
  Waypoints,
} from "lucide-react";
import { AffiliateBankingInquiryForm } from "@/components/services/AffiliateBankingInquiryForm";
import { PageIntro } from "@/components/layout/PageIntro";
import { VerificationNote } from "@/components/layout/VerificationNote";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { CTASection } from "@/components/ui/CTASection";
import { IconFeature } from "@/components/ui/IconFeature";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Affiliate Banking",
  description: "Learn how RECCU-CAM Affiliate Banking supports institutional resilience, liquidity, and cooperative growth through structured network-based solutions.",
  path: "/services/affiliate-banking",
});

const benefits = [
  {
    icon: Network,
    title: "Network-based support",
    description: "A cooperative framework for discussing institution-level needs within the RECCU-CAM network.",
  },
  {
    icon: Landmark,
    title: "Institutional liquidity",
    description: "A structured pathway for eligible institutions to present and document liquidity-related needs.",
  },
  {
    icon: ShieldCheck,
    title: "Financial resilience",
    description: "Support conversations centred on continuity, prudent planning, and institutional capacity—not guaranteed finance.",
  },
  {
    icon: Sprout,
    title: "Cooperative growth",
    description: "Relationship-led support aligned with responsible institutional development across the network.",
  },
  {
    icon: Waypoints,
    title: "Structured access",
    description: "A clear inquiry and assessment process that connects each request to appropriate review and documentation.",
  },
  {
    icon: Handshake,
    title: "Relationship management",
    description: "An accountable point of engagement for clarifying requirements, documentation, and next steps.",
  },
] as const;

const process = [
  [Send, "Affiliate submits inquiry", "The institution provides initial contact, affiliation, location, and support-category information."],
  [Scale, "Eligibility reviewed", "RECCU-CAM reviews whether the request and institution fall within the applicable service framework."],
  [FileSearch, "Documentation assessed", "Required institutional records and supporting information are identified and assessed."],
  [ClipboardCheck, "Terms determined", "Any applicable structure, rate, conditions, responsibilities, and timelines are determined after review."],
  [CheckCircle2, "Approved support processed", "Only support that receives final approval proceeds through the appropriate controlled workflow."],
] as const;

const faqs = [
  [
    "Does submitting an inquiry guarantee finance?",
    "No. An inquiry starts a review only. It does not guarantee eligibility, funding, approval, pricing, timing, or any other term.",
  ],
  [
    "Are rates published online?",
    "No unverified or general rates are displayed. Any applicable rate is determined by RECCU-CAM after eligibility and documentation review.",
  ],
  [
    "Who is Affiliate Banking for?",
    "It is designed for RECCU-CAM member institutions with an institutional support need. Prospective affiliates may make an inquiry, but affiliation and service eligibility are reviewed separately.",
  ],
  [
    "What happens after the form is submitted?",
    "The information is recorded for review. RECCU-CAM may request clarification or documentation before determining whether and how the inquiry can progress.",
  ],
  [
    "What information should not be submitted?",
    "Never include passwords, PINs, OTPs, account-access details, banking credentials, or instructions to execute a transaction.",
  ],
] as const;

export default function AffiliateBankingPage() {
  return (
    <>
      <PageIntro
        eyebrow="Affiliate Banking"
        title="Financial Strength Within the Cooperative Network"
        description="Affiliate Banking supports RECCU-CAM member institutions through structured network-based financial solutions designed to strengthen institutional resilience and liquidity."
        actions={
          <>
            <Button asChild variant="accent" size="lg">
              <a href="#request-information">Request Information <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a href="#relationship-management">Speak With RECCU-CAM</a>
            </Button>
          </>
        }
      />

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <SectionHeader
              eyebrow="What Affiliate Banking is"
              title="Institutional support shaped around cooperative relationships."
              subtitle="Affiliate Banking provides a structured channel through which eligible member institutions can discuss network-based financial needs, documentation, and potential support arrangements."
            />
            <Card padding="spacious" variant="muted">
              <Badge variant="primary">Institutional service</Badge>
              <p className="mt-5 text-lead text-institutional">
                It is not a public retail banking product, an automatic credit facility, or a promise that finance will be available.
              </p>
              <p className="mt-4 text-body text-muted-foreground">
                Every inquiry is considered within RECCU-CAM’s applicable governance, risk, documentation, and approval requirements.
              </p>
            </Card>
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container>
          <SectionHeader
            eyebrow="Who it is for"
            title="Built for institutional—not personal—financial needs."
            subtitle="The service is intended to support accountable engagement between RECCU-CAM and cooperative financial institutions."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <Card padding="default">
              <Badge variant="success">Member institutions</Badge>
              <h3 className="mt-5 font-display text-h4 text-institutional">Current affiliates</h3>
              <p className="mt-3 text-body text-muted-foreground">Affiliated institutions seeking to discuss a documented liquidity, resilience, or structured network-support need.</p>
            </Card>
            <Card padding="default">
              <Badge variant="warning">Separate review</Badge>
              <h3 className="mt-5 font-display text-h4 text-institutional">Prospective affiliates</h3>
              <p className="mt-3 text-body text-muted-foreground">Institutions exploring RECCU-CAM may inquire, but affiliation and Affiliate Banking eligibility are distinct decisions.</p>
            </Card>
            <Card id="relationship-management" padding="default" className="scroll-mt-32">
              <Badge variant="accent">Responsible contact</Badge>
              <h3 className="mt-5 font-display text-h4 text-institutional">Authorised representatives</h3>
              <p className="mt-3 text-body text-muted-foreground">Inquiries should be submitted by an accountable institutional contact who can coordinate clarification and documentation.</p>
              <a href="#request-information" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-semibold text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2">Start the conversation <ArrowRight className="h-4 w-4" /></a>
            </Card>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeader
            align="center"
            eyebrow="Benefits"
            title="A disciplined framework for shared financial strength."
            subtitle="Benefits describe the intended support approach and do not represent guaranteed outcomes."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => <IconFeature key={benefit.title} {...benefit} />)}
          </div>
        </Container>
      </Section>

      <Section tone="brand" id="how-it-works">
        <Container>
          <SectionHeader
            eyebrow="How it works"
            title="From inquiry to a controlled decision."
            subtitle="Each stage supports documented assessment and clear institutional responsibility."
            className="[&_h2]:text-white [&_p]:text-primary-100"
          />
          <ol className="mt-10 grid gap-5 lg:grid-cols-5">
            {process.map(([Icon, title, description], index) => (
              <li key={title} className="relative rounded-card border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-control bg-gold text-institutional"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  <span className="font-display text-h3 text-white/20">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-5 font-display text-h4 text-white">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-primary-100">{description}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section spacing="compact">
        <Container>
          <VerificationNote>
            <strong>Eligibility disclaimer:</strong> Final eligibility, documentation, rates and approval conditions are determined by RECCU-CAM.
          </VerificationNote>
        </Container>
      </Section>

      <Section id="request-information" className="scroll-mt-28" tone="muted">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
            <div>
              <SectionHeader
                eyebrow="Information request"
                title="Begin an institutional conversation."
                subtitle="Provide enough context for RECCU-CAM to understand the request and identify appropriate next steps."
              />
              <div className="mt-6 rounded-card border border-border bg-surface p-5 text-sm text-muted-foreground">
                <p className="font-semibold text-institutional">Before submitting</p>
                <ul className="mt-3 space-y-2">
                  <li>Use an institutional contact address where possible.</li>
                  <li>Describe the need without sending confidential account data.</li>
                  <li>Submission does not create an agreement or approval.</li>
                </ul>
              </div>
            </div>
            <Card padding="spacious">
              <AffiliateBankingInquiryForm />
            </Card>
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="max-w-4xl">
          <SectionHeader align="center" eyebrow="FAQs" title="Clear answers before you inquire." />
          <div className="mt-10 space-y-3">
            {faqs.map(([question, answer]) => (
              <details key={question} className="group rounded-card border border-border bg-surface p-5 shadow-sm open:border-primary-200">
                <summary className="cursor-pointer list-none rounded-sm font-display text-h4 text-institutional focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2">
                  <span className="flex items-center justify-between gap-4">
                    {question}
                    <span aria-hidden="true" className="text-gold-strong transition-transform duration-fast group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-4 max-w-reading text-body text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>
        </Container>
      </Section>

      <CTASection
        eyebrow="Institutional resilience"
        title="Explore support through the cooperative network."
        description="Share your institution’s context so RECCU-CAM can determine whether an Affiliate Banking conversation should progress."
        actions={
          <Button asChild variant="accent" size="lg">
            <a href="#request-information">Request Information <ArrowRight className="h-4 w-4" /></a>
          </Button>
        }
      />
    </>
  );
}
