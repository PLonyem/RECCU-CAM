
import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { PageIntro } from "@/components/layout/PageIntro";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = { title: "News", description: "Verified RECCU-CAM news and institutional updates." };
export default function NewsPage() {
  return <><PageIntro eyebrow="Newsroom" title="Updates with accountable sources." description="Only approved RECCU-CAM announcements and source-verified stories will be published here." /><Section><Container><div className="rounded-3xl border border-dashed border-primary-200 bg-primary-50 p-12 text-center"><Newspaper className="mx-auto h-10 w-10 text-primary-500" /><h2 className="mt-5 font-display text-2xl font-bold text-primary-900">No verified stories published yet</h2><p className="mx-auto mt-3 max-w-xl text-gray-600">Unverified legacy articles were intentionally not relabelled as RECCU-CAM news. Approved stories can be added through the preserved admin workflow.</p></div></Container></Section></>;
}
