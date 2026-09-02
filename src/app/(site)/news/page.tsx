
import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { PageIntro } from "@/components/layout/PageIntro";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "News and Events",
  description: "Verified RECCU-CAM news, institutional updates, and events.",
  path: "/news",
});
export default function NewsPage() {
  return <><PageIntro eyebrow="Newsroom" title="Updates with accountable sources." description="Only approved RECCU-CAM announcements and source-verified stories will be published here." /><Section><Container><div className="rounded-panel border border-dashed border-primary-200 bg-primary-50 p-12 text-center"><Newspaper aria-hidden="true" className="mx-auto h-10 w-10 text-forest" /><h2 className="mt-5 font-display text-2xl font-bold text-institutional">No verified stories published yet</h2><p className="mx-auto mt-3 max-w-xl text-muted-foreground">Unverified legacy articles were intentionally not relabelled as RECCU-CAM news. Approved stories can be added through the preserved admin workflow.</p></div></Container></Section></>;
}
