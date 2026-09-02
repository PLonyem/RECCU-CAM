import { AffiliateDirectorySkeleton } from "@/components/network/AffiliateDirectorySkeleton";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export default function AffiliatesLoading() {
  return (
    <>
      <div className="bg-institutional py-section-sm sm:py-section" role="status">
        <Container>
          <span className="sr-only">Loading affiliate directory</span>
          <div className="h-3 w-36 animate-pulse rounded-pill bg-white/15" />
          <div className="mt-5 h-12 max-w-xl animate-pulse rounded-control bg-white/15" />
          <div className="mt-5 h-6 max-w-2xl animate-pulse rounded-control bg-white/15" />
        </Container>
      </div>
      <Section>
        <Container><AffiliateDirectorySkeleton /></Container>
      </Section>
    </>
  );
}
