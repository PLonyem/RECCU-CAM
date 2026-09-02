
import type { Metadata } from "next";
import { BadgeCheck, MailWarning, MapPin } from "lucide-react";
import { PageIntro } from "@/components/layout/PageIntro";
import { VerificationNote } from "@/components/layout/VerificationNote";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { institution } from "@/config/institution";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Contact",
  description: "Verified contact information and publication status for RECCU-CAM.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageIntro eyebrow="Contact" title="Connect through verified channels." description="We publish contact details only after they have been confirmed by RECCU-CAM and assigned an accountable owner." />
      <Section>
        <Container className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-primary-100 bg-primary-50 p-8">
            <MapPin aria-hidden="true" className="h-7 w-7 text-gold-strong" />
            <h2 className="mt-5 font-display text-2xl font-bold text-primary-900">Headquarters location</h2>
            <p className="mt-3 text-foreground">{institution.location.city}, {institution.location.region}, {institution.location.country}</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">A precise visiting address is omitted until RECCU-CAM confirms it for public use.</p>
          </article>
          <article className="rounded-panel border border-border bg-surface p-8">
            <div className="flex items-center justify-between gap-4">
              <MailWarning aria-hidden="true" className="h-7 w-7 text-gold-strong" />
              <Badge variant="warning"><BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> Verification pending</Badge>
            </div>
            <h2 className="mt-5 font-display text-2xl font-bold text-primary-900">Direct contact</h2>
            <p className="mt-3 text-foreground">Official telephone and email details are pending confirmation.</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">The public contact form remains unavailable until its responsible recipient and data-retention process are verified. No message is silently discarded.</p>
          </article>
          <div className="lg:col-span-2"><VerificationNote>This publication status prevents messages from being routed to unverified addresses or invented RECCU-CAM inboxes.</VerificationNote></div>
        </Container>
      </Section>
    </>
  );
}
