import type { Metadata } from "next";
import {
  ArrowRight,
  Building2,
  Clock3,
  MailQuestion,
  MapPin,
  Route,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { ContactInquiryForm } from "@/components/contact/ContactInquiryForm";
import { PageIntro } from "@/components/layout/PageIntro";
import { buttonVariants } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { institution } from "@/config/institution";
import { createPageMetadata } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { readPublicData } from "@/lib/public-data";

export const metadata: Metadata = createPageMetadata({
  title: "Contact | Get in Touch",
  description:
    "Contact RECCU-CAM for institutional inquiries, affiliate support, training, partnerships, compliance matters and general information.",
  path: "/contact",
});

const contactGuidance = [
  [
    "Choose the closest purpose",
    "Select the category that best reflects your inquiry. Choose General Inquiry if you are unsure.",
  ],
  [
    "Provide useful context",
    "Include the institution involved, the support you need, and any relevant non-confidential background.",
  ],
  [
    "Keep account details private",
    "Never submit passwords, PINs, OTPs, banking credentials, or confidential account information.",
  ],
] as const;

export default async function ContactPage() {
  const settings = await readPublicData(
    "contact settings",
    () => prisma.siteSettings.findUnique({ where: { id: "default" } }),
    null,
  );
  return (
    <>
      <PageIntro
        eyebrow="Institutional contact"
        title="Get in Touch With RECCU-CAM"
        description="Whether you are an affiliate institution, prospective partner, microfinance professional, or member of the public, our team is available to direct your inquiry to the appropriate department."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Contact", href: "/contact" },
        ]}
      />

      <Section tone="muted">
        <Container className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)] lg:items-start lg:gap-10">
          <div className="rounded-panel border border-border bg-surface p-6 shadow-card sm:p-8 lg:p-10">
            <div className="mb-8 max-w-2xl border-b border-border pb-7">
              <p className="text-meta uppercase text-gold-strong">Contact form</p>
              <h2 className="mt-3 font-display text-h3 text-institutional">Direct your inquiry</h2>
              <p className="mt-3 text-body text-muted-foreground">
                Provide the details below so your message can be reviewed and routed appropriately.
              </p>
            </div>
            <ContactInquiryForm />
          </div>

          <aside className="space-y-5 lg:sticky lg:top-28" aria-label="Contact information">
            <section className="rounded-panel bg-institutional p-6 text-white shadow-raised sm:p-7">
              <Route className="h-7 w-7 text-accent-300" aria-hidden="true" />
              <h2 className="mt-5 font-display text-h4 text-white">Routing guidance</h2>
              <p className="mt-3 text-sm leading-6 text-primary-100">
                For faster assistance, select the purpose of your inquiry so your message can be directed to the appropriate team.
              </p>
            </section>

            <section className="rounded-panel border border-border bg-surface p-6 shadow-card sm:p-7">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-control bg-primary-50 text-forest">
                  <Building2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="font-display text-h4 text-institutional">Institutional information</h2>
              </div>
              <dl className="mt-6 divide-y divide-border border-y border-border">
                <div className="py-5">
                  <dt className="flex items-center gap-2 text-sm font-semibold text-institutional">
                    <MapPin className="h-4 w-4 text-gold-strong" aria-hidden="true" /> Head Office
                  </dt>
                  <dd className="mt-2 text-sm leading-6 text-muted-foreground">
                    {settings?.address || `${institution.location.city}, ${institution.location.region}, ${institution.location.country}`}
                  </dd>
                  <dd className="mt-1 text-xs leading-5 text-muted-foreground">
                    {settings?.addressSecondary || "Additional visiting details are published only after institutional verification."}
                  </dd>
                </div>
                <div className="py-5">
                  <dt className="flex items-center gap-2 text-sm font-semibold text-institutional">
                    <MailQuestion className="h-4 w-4 text-gold-strong" aria-hidden="true" /> Phone and Email
                  </dt>
                  <dd className="mt-2 text-sm leading-6 text-muted-foreground">
                    {settings?.phone || settings?.email ? [settings.phone, settings.email].filter(Boolean).join(" · ") : "Official public phone and email details are pending confirmation. Use this form for current inquiries."}
                  </dd>
                </div>
                <div className="py-5">
                  <dt className="flex items-center gap-2 text-sm font-semibold text-institutional">
                    <Clock3 className="h-4 w-4 text-gold-strong" aria-hidden="true" /> Availability
                  </dt>
                  <dd className="mt-2 text-sm leading-6 text-muted-foreground">
                    {settings?.officeHours || "The form accepts inquiries at any time. Confirmed office hours and visiting arrangements are not yet published."}
                  </dd>
                </div>
              </dl>
            </section>
          </aside>
        </Container>
      </Section>

      <Section tone="surface">
        <Container>
          <div className="max-w-2xl">
            <p className="text-meta uppercase text-gold-strong">Before you submit</p>
            <h2 className="mt-3 font-display text-h2 text-institutional">Help us understand where your inquiry belongs.</h2>
            <p className="mt-5 text-body text-muted-foreground">
              A clear subject and concise context make institutional routing more effective.
            </p>
          </div>
          <div className="mt-10 grid border-y border-border md:grid-cols-3">
            {contactGuidance.map(([title, description], index) => (
              <article
                key={title}
                className="border-b border-border py-7 last:border-b-0 md:border-b-0 md:border-r md:px-7 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
              >
                <p className="text-meta text-gold-strong" aria-hidden="true">0{index + 1}</p>
                <h3 className="mt-3 font-display text-h4 text-institutional">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="brand" className="overflow-hidden">
        <Container>
          <div className="relative grid gap-8 rounded-panel border border-white/10 bg-institutional p-8 shadow-raised sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <ShieldCheck className="absolute -right-8 -top-10 h-44 w-44 text-white/[0.04]" aria-hidden="true" />
            <div className="relative max-w-2xl">
              <p className="text-meta uppercase text-accent-300">Institutional reassurance</p>
              <h2 className="mt-3 font-display text-h3 text-white">Your information is used to review and respond to your inquiry.</h2>
              <p className="mt-4 text-body text-primary-100">
                Submissions are validated securely and retained in the protected RECCU-CAM message workflow for authorized review.
              </p>
            </div>
            <Link href="#contact-form" className={buttonVariants({ variant: "accent", size: "lg", className: "relative" })}>
              Start an Inquiry <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
