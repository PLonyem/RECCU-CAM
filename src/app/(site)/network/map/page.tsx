import type { Metadata } from "next";
import { MapExplorerClient } from "@/components/network/MapExplorerClient";
import { PageIntro } from "@/components/layout/PageIntro";
import { VerificationNote } from "@/components/layout/VerificationNote";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { affiliates, getMappableAffiliates } from "@/data/affiliates";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Interactive Network Map",
  description: "Explore RECCU-CAM network affiliates with verified geographic coordinates on an interactive OpenStreetMap.",
  path: "/network/map",
});

export default function NetworkMapPage() {
  const mappedCount = getMappableAffiliates(affiliates).length;

  return (
    <>
      <PageIntro
        eyebrow="Our network"
        title="Interactive Network Map"
        description="Explore the geographic reach of cooperative financial institutions using verified location data."
      />
      <Section>
        <Container>
          <VerificationNote>
            Only institutions with complete coordinates in the structured affiliate source appear as markers. {mappedCount > 0 ? `${mappedCount} verified ${mappedCount === 1 ? "location is" : "locations are"} currently available.` : "No verified coordinates are currently published."} Missing coordinates are never estimated.
          </VerificationNote>
          <div className="mt-8">
            <MapExplorerClient affiliates={affiliates} />
          </div>
        </Container>
      </Section>
    </>
  );
}
