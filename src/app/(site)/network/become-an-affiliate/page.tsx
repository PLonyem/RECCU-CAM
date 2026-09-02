import type { Metadata } from "next";
import { ClipboardCheck, FileSearch, ShieldCheck } from "lucide-react";
import { AffiliationInquiryForm } from "@/components/network/AffiliationInquiryForm";
import { PageIntro } from "@/components/layout/PageIntro";
import { Card, Container, Section, SectionHeader } from "@/components/ui";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Become an Affiliate",
  description: "Submit an institutional inquiry about the verified RECCU-CAM affiliation pathway.",
  path: "/network/become-an-affiliate",
});

const inquirySteps = [
  [FileSearch, "Initial review", "RECCU-CAM reviews the institution and the nature of its request."],
  [ClipboardCheck, "Requirements clarified", "Applicable eligibility and documentation guidance is confirmed directly."],
  [ShieldCheck, "Institutional decision", "Any affiliation decision follows RECCU-CAM's verified governance and approval process."],
] as const;

export default function BecomeAnAffiliatePage() {
  return (
    <>
      <PageIntro
        eyebrow="Our Network"
        title="Start an affiliation conversation."
        description="Share your institution's contact details so RECCU-CAM can provide verified guidance on the affiliation pathway."
      />
      <Section>
        <Container>
          <SectionHeader
            eyebrow="Affiliation inquiry"
            title="A careful first step into the cooperative network."
            subtitle="This inquiry records interest only. It does not confirm eligibility, requirements, approval, or membership."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {inquirySteps.map(([Icon, title, description]) => (
              <Card key={title} padding="default">
                <Icon className="h-6 w-6 text-forest" aria-hidden="true" />
                <h2 className="mt-5 font-display text-h4 text-institutional">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
      <Section tone="muted">
        <Container className="max-w-4xl">
          <Card padding="spacious" className="shadow-raised">
            <AffiliationInquiryForm />
          </Card>
        </Container>
      </Section>
    </>
  );
}
