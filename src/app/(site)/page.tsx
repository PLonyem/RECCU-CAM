import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { HomeHero } from "@/components/home/HomeHero";
import { VerificationNote } from "@/components/layout/VerificationNote";
import { buttonVariants } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { institution } from "@/config/institution";
import { knowledgePreview, vtimeTopics } from "@/data/homepage";
import trainingImage from "../../../public/images/home/vtime-training.webp";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Building Stronger Credit Unions. Building Stronger Communities.",
  description: "Learn about RECCU-CAM, access professional learning and source-labelled institutional resources, and follow approved public updates.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <HomeHero />

      <Section tone="surface" spacing="compact" className="border-b border-border">
        <Container>
          <VerificationNote>
            <strong>Verified institutional reference:</strong> Cameroon&apos;s Ministry of Finance lists {institution.legalName} in {institution.location.city} under approval order {institution.approval.order}, dated 5 April 2018. No unconfirmed operational totals, rates, financial figures, or leadership claims are presented here.
          </VerificationNote>
        </Container>
      </Section>

      <Section tone="muted">
        <Container className="grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div className="relative overflow-hidden rounded-panel bg-muted shadow-card">
            <Image
              src={trainingImage}
              alt="Illustrative professional training workshop with Cameroonian cooperative staff"
              sizes="(max-width: 1024px) 100vw, 44vw"
              className="h-auto w-full object-cover"
            />
          </div>
          <div>
            <SectionHeader eyebrow="VTIME" title="Developing the Next Generation of Microfinance Professionals" subtitle="Practical learning pathways connect cooperative principles with the governance, financial, compliance, leadership, and digital capabilities institutions need." />
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {vtimeTopics.map(([topic, Icon]) => (
                <div key={topic} className="rounded-control border border-border bg-surface p-4">
                  <Icon className="h-5 w-5 text-gold-strong" aria-hidden="true" />
                  <p className="mt-3 text-sm font-semibold text-institutional">{topic}</p>
                </div>
              ))}
            </div>
            <Link href="/vtime" className={`${buttonVariants({ variant: "default", size: "lg" })} mt-8`}>
              Explore VTIME <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </Section>

      <Section tone="surface">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-start">
            <div>
              <SectionHeader eyebrow="Knowledge Centre" title="Trusted resources, clearly controlled." subtitle="Each collection is designed around source ownership, effective dates, versions, and visible publication status." />
              <Link href="/knowledge" className={`${buttonVariants({ variant: "default", size: "lg" })} mt-8`}>
                Enter Knowledge Centre <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {knowledgePreview.map((item, index) => (
                <Link key={item.title} href={item.href ?? "/knowledge"} className={`group rounded-card border border-border bg-surface p-5 shadow-card transition-[border-color,box-shadow,transform] duration-base motion-safe:hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-raised ${index === knowledgePreview.length - 1 ? "sm:col-span-2" : ""}`}>
                  <div className="flex items-start gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-control bg-primary-50 text-forest" aria-hidden="true"><item.icon className="h-5 w-5" /></span>
                    <div><h3 className="font-display text-h4 text-institutional">{item.title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p></div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
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
