import { AffiliateDirectorySkeleton } from "@/components/network/AffiliateDirectorySkeleton";
import { PageIntro } from "@/components/layout/PageIntro";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export default function AffiliatesLoading() {
  return (
    <>
      <PageIntro
        eyebrow="Affiliate directory"
        title="Our Network"
        description="Explore cooperative financial institutions affiliated with the RECCU-CAM network."
      />
      <Section>
        <Container><AffiliateDirectorySkeleton /></Container>
      </Section>
    </>
  );
}
