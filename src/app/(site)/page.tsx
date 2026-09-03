import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { HomeHero } from "@/components/home/HomeHero";
import { VerificationNote } from "@/components/layout/VerificationNote";
import { buttonVariants } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { institution } from "@/config/institution";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Building Stronger Credit Unions. Building Stronger Communities.",
  description: "Learn about RECCU-CAM and follow approved public updates from the cooperative financial network.",
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

      <Section tone="muted">
        <Container>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeader eyebrow="News & Events" title="Verified updates, published with care." subtitle="Approved RECCU-CAM stories and announcements appear in the newsroom after editorial review." />
            <Link href="/news" className={buttonVariants({ variant: "secondary" })}>Visit Newsroom <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
          <div className="mt-10 rounded-panel border border-dashed border-primary-200 bg-primary-50 p-8 text-center sm:p-10">
            <Newspaper className="mx-auto h-9 w-9 text-forest" aria-hidden="true" />
            <h3 className="mt-5 font-display text-h4 text-institutional">No verified stories are currently published.</h3>
            <p className="mx-auto mt-3 max-w-reading text-body text-muted-foreground">The newsroom remains ready for approved institutional announcements and source-verified reporting.</p>
          </div>
        </Container>
      </Section>
    </>
  );
}
