import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageIntro } from "@/components/layout/PageIntro";
import { TrainingCalendar } from "@/components/vtime/TrainingCalendar";
import { Button, Container, Section } from "@/components/ui";
import { publishedTrainingEvents } from "@/data/training-programs";

export const metadata: Metadata = {
  title: "VTIME Training Calendar",
  description: "Navigate confirmed VTIME training cohorts by month or list view.",
};

export default function CalendarPage() {
  return (
    <>
      <PageIntro
        eyebrow="VTIME training calendar"
        title="Plan with dates you can rely on."
        description="Navigate confirmed cohorts by month or list view. Dates appear only after their complete delivery details are verified."
        actions={
          <Button asChild size="lg" variant="accent">
            <Link href="/vtime/programs">
              Browse Programs <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        }
      />
      <Section>
        <Container>
          <TrainingCalendar events={publishedTrainingEvents} />
        </Container>
      </Section>
    </>
  );
}
