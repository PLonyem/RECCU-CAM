import Link from "next/link";
import { ArrowRight, BadgeCheck, BookOpenCheck, Building2, GraduationCap, MapPinned, Network, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { VerificationNote } from "@/components/layout/VerificationNote";
import { institution } from "@/config/institution";
import { platformServices } from "@/data/services";

export default function HomePage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-primary-900 text-white">
        <div className="absolute inset-0 -z-10 opacity-25 [background-image:radial-gradient(circle_at_15%_25%,#F0C351_0,transparent_24%),radial-gradient(circle_at_85%_20%,#7CBA99_0,transparent_28%),linear-gradient(135deg,transparent_35%,rgba(255,255,255,.08)_35%,rgba(255,255,255,.08)_36%,transparent_36%)]" />
        <Container className="grid min-h-[650px] items-center gap-12 py-20 lg:grid-cols-[1.2fr_.8fr] lg:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-accent-200">
              <Network className="h-4 w-4" /> {institution.displayName}
            </p>
            <h1 className="mt-7 max-w-4xl font-display text-5xl font-bold leading-[1.03] tracking-tight sm:text-6xl lg:text-7xl">
              Cooperation that moves <span className="text-accent-300">communities forward.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-primary-100 sm:text-xl">
              {institution.platformStatement}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/network/affiliates" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent-400 px-6 font-bold text-primary-900 transition hover:bg-accent-300">
                Explore the network <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/vtime" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/30 px-6 font-bold text-white transition hover:bg-white/10">
                Discover VTIME
              </Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-6 rounded-[3rem] border border-white/10" />
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/15 bg-white/10 p-7 shadow-2xl backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-200">A connected platform</p>
              <div className="mt-6 space-y-4">
                {[
                  [MapPinned, "Find and understand the network"],
                  [GraduationCap, "Build capability through VTIME"],
                  [BookOpenCheck, "Access controlled knowledge"],
                  [ShieldCheck, "Support consistent governance"],
                ].map(([Icon, label]) => (
                  <div key={label as string} className="flex items-center gap-4 rounded-2xl bg-white/10 p-4">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-primary-800"><Icon className="h-5 w-5" /></span>
                    <span className="font-semibold text-primary-50">{label as string}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Section className="border-b border-gray-100 bg-white">
        <Container>
          <VerificationNote>
            <strong>Verified institutional reference:</strong> Cameroon’s Ministry of Finance lists {institution.legalName} in {institution.location.city} under approval order {institution.approval.order} dated 5 April 2018. No unconfirmed member totals, financial figures, rates, or leadership details are published here.
          </VerificationNote>
        </Container>
      </Section>

      <Section className="bg-[#F7FAF8]">
        <Container>
          <SectionHeader eyebrow="Platform experiences" title="One network. Clear paths to action." subtitle="Each experience is designed around a specific job: discover the network, coordinate services, grow capability, or find trusted knowledge." />
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {platformServices.map((service) => (
              <Link key={service.href} href={service.href} className="group rounded-3xl border border-primary-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-50 text-primary-700"><service.icon className="h-6 w-6" /></span>
                  {service.status === "preview" && <span className="rounded-full bg-accent-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-700">Preview</span>}
                </div>
                <h2 className="mt-6 font-display text-xl font-bold text-primary-900">{service.title}</h2>
                <p className="mt-3 text-sm leading-6 text-gray-600">{service.description}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary-700">Explore <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-white">
        <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeader eyebrow="Cooperative infrastructure" title="Built for institutions. Useful to people." subtitle="The platform separates public information from protected operational workflows, keeping each audience focused and each responsibility clear." />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                [Building2, "Public discovery", "Institutional, network, learning, and knowledge pages remain open and indexable."],
                [BadgeCheck, "Protected operations", "Affiliate and administrator workflows retain Clerk role checks and server-side authorization."],
              ].map(([Icon, title, text]) => (
                <div key={title as string} className="rounded-2xl border border-gray-200 p-5">
                  <Icon className="h-6 w-6 text-accent-600" />
                  <h3 className="mt-4 font-bold text-primary-900">{title as string}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{text as string}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] bg-primary-50 p-8 sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-700">Start with what you need</p>
            <div className="mt-6 space-y-3">
              {[
                ["I want to find an affiliate", "/network/affiliates"],
                ["I want to explore shared banking services", "/services/affiliate-banking"],
                ["I want to build professional capability", "/vtime"],
                ["I need a verified document or template", "/knowledge"],
              ].map(([label, href]) => (
                <Link key={href} href={href} className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 font-semibold text-primary-900 shadow-sm hover:shadow-md">
                  {label} <ArrowRight className="h-4 w-4 text-accent-600" />
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
