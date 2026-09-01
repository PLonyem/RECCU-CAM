import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { PageIntro } from "@/components/layout/PageIntro";
import { Button, Container, EmptyState, Section } from "@/components/ui";
import { publishedTrainingEvents } from "@/data/training-programs";

export const metadata: Metadata = {
  title: "VTIME Training Calendar",
  description: "View confirmed VTIME training cohorts and registration availability.",
};

export default function CalendarPage() {
  return (
    <>
      <PageIntro
        eyebrow="VTIME training calendar"
        title="Dates appear only when they are ready to rely on."
        description="Confirmed cohorts will include their dates, format, location, facilitator, capacity, and registration status."
      />
      <Section>
        <Container>
          {publishedTrainingEvents.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No verified training dates published"
              description="The calendar is intentionally empty until RECCU-CAM confirms the complete delivery information for a cohort."
              action={
                <Button asChild variant="secondary">
                  <Link href="/vtime/programs">Browse program outlines</Link>
                </Button>
              }
            />
          ) : null}
        </Container>
      </Section>
    </>
  );
}
