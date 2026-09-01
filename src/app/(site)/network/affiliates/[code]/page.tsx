import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Building2, MapPin } from "lucide-react";
import { PageIntro } from "@/components/layout/PageIntro";
import { VerificationNote } from "@/components/layout/VerificationNote";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { networkAffiliates } from "@/data/affiliates";

interface Props { params: Promise<{ code: string }> }
export function generateStaticParams() { return networkAffiliates.map((affiliate) => ({ code: affiliate.code.toLowerCase() })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const affiliate = networkAffiliates.find((item) => item.code.toLowerCase() === code.toLowerCase());
  return affiliate ? { title: affiliate.shortName, description: `${affiliate.name}, source-listed in ${affiliate.city}.` } : { title: "Affiliate not found" };
}
export default async function AffiliateProfilePage({ params }: Props) {
  const { code } = await params;
  const affiliate = networkAffiliates.find((item) => item.code.toLowerCase() === code.toLowerCase());
  if (!affiliate) notFound();
  return <><PageIntro eyebrow={`Network profile · ${affiliate.shortName}`} title={affiliate.name} description="A deliberately concise profile containing only source-supported information." /><Section><Container className="max-w-4xl"><Link href="/network/affiliates" className="inline-flex items-center gap-2 text-sm font-bold text-primary-700"><ArrowLeft className="h-4 w-4" /> Back to directory</Link><div className="mt-8 grid gap-5 sm:grid-cols-2"><div className="rounded-3xl border border-gray-200 p-7"><Building2 className="h-6 w-6 text-accent-600" /><p className="mt-5 text-sm text-gray-500">Published name</p><p className="mt-1 font-bold text-primary-900">{affiliate.name}</p></div><div className="rounded-3xl border border-gray-200 p-7"><MapPin className="h-6 w-6 text-accent-600" /><p className="mt-5 text-sm text-gray-500">Published location</p><p className="mt-1 font-bold text-primary-900">{affiliate.city}, {affiliate.region}</p></div></div><div className="mt-6"><VerificationNote>Branch addresses, telephone numbers, email addresses, leadership, products, rates, and financial figures are not published because they were not verified from the cited source.</VerificationNote></div><a href={affiliate.sourceUrl} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 font-bold text-primary-700 underline decoration-accent-400 underline-offset-4">View source <ArrowUpRight className="h-4 w-4" /></a></Container></Section></>;
}
