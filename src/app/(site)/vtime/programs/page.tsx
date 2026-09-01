import type { Metadata } from "next";
import { PageIntro } from "@/components/layout/PageIntro";
import { VerificationNote } from "@/components/layout/VerificationNote";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { trainingPrograms } from "@/data/training-programs";

export const metadata: Metadata = { title: "VTIME programmes" };
export default function ProgramsPage() { return <><PageIntro eyebrow="VTIME catalogue" title="Learning pathways with a clear purpose." description="Programme previews help institutions plan capability needs without presenting unconfirmed delivery commitments." /><Section><Container><VerificationNote>These are programme concepts, not scheduled offers. Publication of a registration action requires a confirmed owner, cohort, delivery mode, date, venue, facilitator, and price where applicable.</VerificationNote><div className="mt-8 space-y-5">{trainingPrograms.map((program,index) => <article key={program.slug} className="grid gap-6 rounded-3xl border border-gray-200 p-7 md:grid-cols-[auto_1fr_.65fr]"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-800 font-display font-bold text-white">{String(index+1).padStart(2,"0")}</span><div><h2 className="font-display text-2xl font-bold text-primary-900">{program.title}</h2><p className="mt-3 leading-7 text-gray-600">{program.summary}</p></div><div><p className="text-xs font-bold uppercase tracking-wider text-accent-700">Audience</p><p className="mt-2 text-sm text-gray-700">{program.audience}</p><p className="mt-4 text-xs font-bold uppercase tracking-wider text-accent-700">Delivery</p><p className="mt-2 text-sm text-gray-700">{program.format}</p></div></article>)}</div></Container></Section></>; }
