
import type { Metadata } from "next";
import { BadgeCheck, Eye, Handshake, Scale, ShieldCheck } from "lucide-react";
import { PageIntro } from "@/components/layout/PageIntro";
import { VerificationNote } from "@/components/layout/VerificationNote";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { institution, verificationNotice } from "@/config/institution";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "About",
  description: `Learn about ${institution.legalName} and the verified foundation of this digital platform.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageIntro eyebrow="About RECCU-CAM" title="A network platform grounded in cooperative purpose." description="RECCU-CAM’s public digital presence is being rebuilt around clear information, shared capability, and responsible publication." />
      <Section>
        <Container className="grid gap-10 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <SectionHeader eyebrow="Institutional identity" title={institution.legalName} subtitle={institution.shortDescription} />
            <div className="mt-8 space-y-5 text-base leading-8 text-muted-foreground">
              <p>The platform serves as a public gateway to network discovery and as a structured foundation for future shared services, training, and knowledge.</p>
              <p>It does not publish legacy operational claims without review. Every institution-specific statement now needs a named source or direct confirmation from RECCU-CAM.</p>
            </div>
          </div>
          <div className="rounded-3xl bg-primary-50 p-7">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-700">Verified reference</p>
            <dl className="mt-6 space-y-5 text-sm">
              <div><dt className="text-muted-foreground">Network</dt><dd className="mt-1 font-bold text-institutional">{institution.displayName}</dd></div>
              <div><dt className="text-muted-foreground">Headquarters location</dt><dd className="mt-1 font-bold text-institutional">{institution.location.city}, {institution.location.country}</dd></div>
              <div><dt className="text-muted-foreground">Approval order</dt><dd className="mt-1 font-bold text-institutional">{institution.approval.order}</dd></div>
              <div><dt className="text-muted-foreground">Approval date</dt><dd className="mt-1 font-bold text-institutional">5 April 2018</dd></div>
            </dl>
            <a href={institution.approval.sourceUrl} target="_blank" rel="noreferrer" className="mt-7 inline-flex font-bold text-primary-700 underline decoration-accent-400 underline-offset-4">View the MINFI source</a>
          </div>
        </Container>
      </Section>
      <Section tone="muted">
        <Container>
          <SectionHeader eyebrow="Design principles" title="How this platform earns trust" />
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              [BadgeCheck, "Source integrity", "Claims are source-labelled or held back until confirmed."],
              [Eye, "Clarity", "Public information is separated from protected operations."],
              [Scale, "Consistency", "Shared patterns reduce ambiguity across network services."],
              [Handshake, "Cooperation", "Experiences are designed for coordinated institutional progress."],
            ].map(([Icon, title, text]) => (
              <article key={title as string} className="rounded-2xl border border-primary-100 bg-white p-6">
                <Icon aria-hidden="true" className="h-6 w-6 text-gold-strong" /><h3 className="mt-5 font-bold text-institutional">{title as string}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text as string}</p>
              </article>
            ))}
          </div>
          <VerificationNote><ShieldCheck className="sr-only" />{verificationNotice}</VerificationNote>
        </Container>
      </Section>
    </>
  );
}
