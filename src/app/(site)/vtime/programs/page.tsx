import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Suspense } from "react";
import { PageIntro } from "@/components/layout/PageIntro";
import { VerificationNote } from "@/components/layout/VerificationNote";
import { ProgramsExplorer } from "@/components/vtime/ProgramsExplorer";
import { Button, Card, Container, LoadingSkeleton, Section, SectionHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "VTIME Programs",
  description: "Review VTIME training program outlines, audiences, objectives, and core modules.",
};

export default function ProgramsPage() {
  return (
    <>
      <PageIntro
        eyebrow="VTIME program catalogue"
        title="Learning pathways with a clear purpose."
        description="Review program audiences, objectives, and curriculum modules without relying on unconfirmed delivery commitments."
        actions={
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/30 bg-white/5 text-white hover:border-white/60 hover:bg-white/10"
          >
            <Link href="/vtime/calendar">
              <CalendarDays className="h-4 w-4" aria-hidden="true" /> View Training Calendar
            </Link>
          </Button>
        }
      />
      <Section>
        <Container>
          <VerificationNote>
            These are curriculum previews, not scheduled offers. Dates, facilitators, locations, delivery format,
            duration, capacity, and registration are published only after confirmation.
          </VerificationNote>
          <SectionHeader
            eyebrow="Program outlines"
            title="Explore the current curriculum foundation."
            subtitle="Search and filter by the capability, audience, delivery format, level, or schedule status that matters to you."
            className="mt-12"
          />
          <div className="mt-10">
            <Suspense fallback={<ProgramsExplorerSkeleton />}>
              <ProgramsExplorer />
            </Suspense>
          </div>
        </Container>
      </Section>
    </>
  );
}

function ProgramsExplorerSkeleton() {
  return (
    <div aria-label="Loading program filters">
      <Card padding="default"><LoadingSkeleton lines={4} /></Card>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card padding="default"><LoadingSkeleton lines={6} /></Card>
        <Card padding="default"><LoadingSkeleton lines={6} /></Card>
      </div>
    </div>
  );
}
