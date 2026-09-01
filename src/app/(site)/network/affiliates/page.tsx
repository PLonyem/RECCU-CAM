import type { Metadata } from "next";
import { AffiliateDirectory } from "@/components/network/AffiliateDirectory";
import { PageIntro } from "@/components/layout/PageIntro";
import { VerificationNote } from "@/components/layout/VerificationNote";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { networkAffiliates } from "@/data/affiliates";

export const metadata: Metadata = { title: "Affiliate directory", description: "Explore the source-labelled starter directory of institutions listed under the RECCU-CAM network." };
export default function AffiliatesPage() {
  return <><PageIntro eyebrow="Network" title="A directory built on traceable information." description="Explore institutions found under the RECCU-CAM network in the cited MINFI list. This starter directory is not presented as a current membership total." /><Section><Container><VerificationNote>Directory names and locations are transcribed from the Ministry of Finance list as at 31 December 2021. Confirm current status and contact details directly before making financial or travel decisions.</VerificationNote><div className="mt-8"><AffiliateDirectory affiliates={networkAffiliates} /></div></Container></Section></>;
}
