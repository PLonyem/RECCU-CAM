import { Suspense } from "react";
import type { Metadata } from "next";
import { AffiliateDirectory } from "@/components/network/AffiliateDirectory";
import { AffiliateDirectorySkeleton } from "@/components/network/AffiliateDirectorySkeleton";
import { PageIntro } from "@/components/layout/PageIntro";
import { VerificationNote } from "@/components/layout/VerificationNote";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import {
  AFFILIATE_DATA_NOTICE,
  affiliates,
  deriveAffiliateFilterOptions,
} from "@/data/affiliates";

export const metadata: Metadata = {
  title: "Our Network | Affiliate Directory",
  description: "Explore cooperative financial institutions affiliated with the RECCU-CAM network by name, city, region, type, or service.",
};

const filterOptions = deriveAffiliateFilterOptions(affiliates);

export default function AffiliatesPage() {
  return (
    <>
      <PageIntro
        eyebrow="Affiliate directory"
        title="Our Network"
        description="Explore cooperative financial institutions affiliated with the RECCU-CAM network."
      />
      <Section>
        <Container>
          <VerificationNote>{AFFILIATE_DATA_NOTICE}</VerificationNote>
          <div className="mt-8">
            <Suspense fallback={<AffiliateDirectorySkeleton />}>
              <AffiliateDirectory affiliates={affiliates} filterOptions={filterOptions} />
            </Suspense>
          </div>
        </Container>
      </Section>
    </>
  );
}
