import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Suspense } from "react";
import { PageIntro } from "@/components/layout/PageIntro";
import { VerificationNote } from "@/components/layout/VerificationNote";
import { ProgramsExplorer } from "@/components/vtime/ProgramsExplorer";
import { Button, Card, Container, LoadingSkeleton, Section, SectionHeader } from "@/components/ui";
import { createPageMetadata } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { readPublicData } from "@/lib/public-data";

export const metadata: Metadata = createPageMetadata({
  title: "VTIME Programs",
  description: "Review VTIME training program outlines, audiences, objectives, and core modules.",
  path: "/vtime/programs",
});

export default async function ProgramsPage() {
  const publishedPrograms = await readPublicData(
    "published VTIME programs",
    () =>
      prisma.trainingProgram.findMany({
        where: { published: true },
        orderBy: [{ startDate: "asc" }, { title: "asc" }],
      }),
    [],
  );
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
      {publishedPrograms.length > 0 && <Section tone="muted"><Container><SectionHeader eyebrow="Published schedule" title="Confirmed VTIME opportunities." subtitle="Dates and delivery details below were published by authorized RECCU-CAM staff." /><div className="mt-8 grid gap-5 lg:grid-cols-2">{publishedPrograms.map((program) => <Card key={program.id} padding="default"><div className="flex flex-wrap gap-2 text-xs font-semibold uppercase text-forest"><span>{program.category}</span><span>·</span><span>{program.registrationStatus.replaceAll("-", " ")}</span></div><h3 className="mt-3 font-display text-xl font-semibold text-institutional">{program.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{program.summary}</p><p className="mt-4 text-sm font-medium text-institutional">{program.startDate ? program.startDate.toLocaleDateString("en-GB") : "Date to be confirmed"}{program.venue ? ` · ${program.venue}` : ""}</p><Link href={`/vtime/registration?program=${program.slug}`} className="mt-4 inline-flex font-semibold text-forest hover:underline">Registration details</Link></Card>)}</div></Container></Section>}
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
