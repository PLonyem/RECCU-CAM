
import type { Metadata } from "next";
import { MailWarning, MapPin } from "lucide-react";
import { PageIntro } from "@/components/layout/PageIntro";
import { VerificationNote } from "@/components/layout/VerificationNote";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { institution } from "@/config/institution";

export const metadata: Metadata = { title: "Contact", description: "Verified contact information and publication status for RECCU-CAM." };

export default function ContactPage() {
  return (
    <>
      <PageIntro eyebrow="Contact" title="Connect through verified channels." description="We publish contact details only after they have been confirmed by RECCU-CAM and assigned an accountable owner." />
      <Section>
        <Container className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-primary-100 bg-primary-50 p-8">
            <MapPin className="h-7 w-7 text-accent-600" />
            <h2 className="mt-5 font-display text-2xl font-bold text-primary-900">Headquarters location</h2>
            <p className="mt-3 text-gray-700">{institution.location.city}, {institution.location.region}, {institution.location.country}</p>
            <p className="mt-3 text-sm leading-6 text-gray-500">A precise visiting address has not yet been confirmed for publication. Please do not rely on contact details from the former prototype.</p>
          </article>
          <article className="rounded-3xl border border-gray-200 p-8">
            <MailWarning className="h-7 w-7 text-accent-600" />
            <h2 className="mt-5 font-display text-2xl font-bold text-primary-900">Direct contact</h2>
            <p className="mt-3 text-gray-700">Official telephone and email details are pending confirmation.</p>
            <p className="mt-3 text-sm leading-6 text-gray-500">The public contact form remains disabled until its responsible recipient and data-retention process are verified.</p>
          </article>
          <div className="lg:col-span-2"><VerificationNote>This cautious publication state prevents messages from being routed to legacy addresses or to invented RECCU-CAM inboxes.</VerificationNote></div>
        </Container>
      </Section>
    </>
  );
}
