import type { Metadata } from "next";
import { HomeHero } from "@/components/home/HomeHero";
import { VerificationNote } from "@/components/layout/VerificationNote";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { institution } from "@/config/institution";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Building Stronger Credit Unions. Building Stronger Communities.",
  description: "Learn about RECCU-CAM's verified identity and institutional foundation in Cameroon.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <HomeHero />

      <Section tone="surface" spacing="compact" className="border-b border-border">
        <Container>
          <VerificationNote>
            <strong>Verified institutional reference:</strong> Cameroon&apos;s Ministry of Finance lists {institution.legalName} in {institution.location.city} under approval order {institution.approval.order}, dated 5 April 2018. No unconfirmed operational totals, financial figures, or leadership claims are presented here.
          </VerificationNote>
        </Container>
      </Section>

    </>
  );
}
