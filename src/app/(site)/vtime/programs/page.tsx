import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { PageIntro } from "@/components/layout/PageIntro";
import { VerificationNote } from "@/components/layout/VerificationNote";
import { TrainingProgramCard } from "@/components/vtime/TrainingProgramCard";
import { Button, Container, Section, SectionHeader } from "@/components/ui";
import { trainingPrograms } from "@/data/training-programs";

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
            subtitle="Each outline identifies the intended audience and core learning structure. More categories can be developed against the same data model."
            className="mt-12"
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {trainingPrograms.map((program) => (
              <div key={program.id} id={program.slug} className="scroll-mt-32">
                <TrainingProgramCard program={program} showModules />
              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Button asChild>
              <Link href="/vtime/registration">
                View registration guidance <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
