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
  deriveAffiliateFilterOptions,
} from "@/data/affiliates";
import { getPublicAffiliates } from "@/lib/data/public-affiliates";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Our Network | Affiliate Directory",
  description: "Explore cooperative financial institutions affiliated with the RECCU-CAM network by name, city, region, type, or service.",
  path: "/network/affiliates",
});

export const dynamic = "force-dynamic";

export default async function AffiliatesPage() {
  const affiliates = await getPublicAffiliates();
  const filterOptions = deriveAffiliateFilterOptions(affiliates);
  return (
    <>
      <PageIntro
        eyebrow="Affiliate directory"
        title="Our Network"
        description="Explore cooperative financial institutions affiliated with the RECCU-CAM network."
      />
      <Section>
        <Container>
          <VerificationNote>
            {affiliates.length > 0
              ? "This directory shows active affiliate profiles approved by authorized RECCU-CAM staff."
              : AFFILIATE_DATA_NOTICE}
          </VerificationNote>
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
