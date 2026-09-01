import type { Metadata } from "next";
import { CalendarCheck2, CreditCard, ShieldCheck } from "lucide-react";
import { Suspense } from "react";
import { PageIntro } from "@/components/layout/PageIntro";
import { TrainingRegistrationForm } from "@/components/vtime/TrainingRegistrationForm";
import { Card, Container, LoadingSkeleton, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "VTIME Training Registration",
  description: "Submit participant details for a VTIME training program.",
};

export default function TrainingRegistrationPage() {
  return (
    <>
      <PageIntro
        eyebrow="VTIME registration"
        title="Start your training registration."
        description="Share participant and institutional details for a VTIME program. RECCU-CAM will confirm scheduling and participation information separately."
      />
      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
            <aside className="space-y-5">
              <Card padding="default" variant="muted">
                <CalendarCheck2 className="h-6 w-6 text-forest" aria-hidden="true" />
                <h2 className="mt-5 font-display text-h4 text-institutional">Before you submit</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Program outlines may be available before a cohort date is confirmed. RECCU-CAM will follow up with verified delivery information.
                </p>
              </Card>
              <Card padding="default">
                <div className="flex gap-3">
                  <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-forest" aria-hidden="true" />
                  <div>
                    <h2 className="font-display text-h4 text-institutional">No online payment</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">This form does not request or process payment details.</p>
                  </div>
                </div>
                <div className="mt-5 flex gap-3 border-t border-border pt-5">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-forest" aria-hidden="true" />
                  <div>
                    <h2 className="font-display text-h4 text-institutional">Safe information</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">Do not include passwords, PINs, OTPs, or banking credentials in your notes.</p>
                  </div>
                </div>
              </Card>
            </aside>
            <Card padding="spacious" className="shadow-raised">
              <Suspense fallback={<LoadingSkeleton lines={7} />}>
                <TrainingRegistrationForm />
              </Suspense>
            </Card>
          </div>
        </Container>
      </Section>
    </>
  );
}
