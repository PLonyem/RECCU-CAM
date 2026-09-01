import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileCheck2, LockKeyhole, Network, Repeat2 } from "lucide-react";
import { PageIntro } from "@/components/layout/PageIntro";
import { VerificationNote } from "@/components/layout/VerificationNote";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const metadata: Metadata = { title: "Affiliate Banking", description: "Explore the RECCU-CAM Affiliate Banking service blueprint for shared network operations." };
const capabilities = [
  [Repeat2, "Shared transaction coordination", "A future operating layer for clearly governed inter-affiliate settlement and reconciliation workflows."],
  [FileCheck2, "Consistent reporting", "Standardised submissions, clear validation states, and traceable follow-up across participating institutions."],
  [Network, "Network operations", "A shared view of service requests, operational notices, and accountable hand-offs."],
  [LockKeyhole, "Role-based access", "Protected workflows that preserve institution boundaries while enabling authorised coordination."],
] as const;
export default function AffiliateBankingPage() {
  return <><PageIntro eyebrow="Shared services" title="Affiliate Banking, designed as network infrastructure." description="A service blueprint for coordinated operations across affiliated institutions—not a public retail bank or a promise of currently available products." /><Section><Container><VerificationNote>Preview status: operational scope, participating institutions, transaction rules, fees, launch date, and service-level commitments have not been confirmed for publication.</VerificationNote><div className="mt-12 grid gap-10 lg:grid-cols-[.75fr_1.25fr]"><SectionHeader eyebrow="Service blueprint" title="A disciplined path from fragmented tasks to shared capability." subtitle="The experience is organised around governance first: define authority, data, controls, and accountability before activating financial workflows." /><div className="grid gap-5 sm:grid-cols-2">{capabilities.map(([Icon,title,text]) => <article key={title} className="rounded-3xl border border-gray-200 p-6"><span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-50 text-primary-700"><Icon className="h-5 w-5" /></span><h2 className="mt-5 font-bold text-primary-900">{title}</h2><p className="mt-2 text-sm leading-6 text-gray-600">{text}</p></article>)}</div></div></Container></Section><Section className="bg-primary-900 text-white"><Container className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-accent-300">Readiness before rollout</p><h2 className="mt-4 font-display text-3xl font-bold">Policy, controls, data ownership, and support must be confirmed first.</h2><p className="mt-4 max-w-2xl text-primary-100">The current platform presents the service architecture without fabricating a launch or inviting transactions before those safeguards exist.</p></div><Link href="/contact" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent-400 px-6 font-bold text-primary-900">Contact status <ArrowRight className="h-4 w-4" /></Link></Container></Section></>;
}
