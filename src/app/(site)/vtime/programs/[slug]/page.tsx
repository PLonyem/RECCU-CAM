import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  MonitorSmartphone,
  UserRound,
  Users,
} from "lucide-react";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/layout/PageIntro";
import {
  Badge,
  Button,
  Card,
  Container,
  CTASection,
  EmptyState,
  Section,
  SectionHeader,
} from "@/components/ui";
import {
  formatTrainingDateRange,
  getTrainingCategory,
  getTrainingProgramBySlug,
  registrationStatusLabels,
  trainingFormatLabels,
  trainingLevelLabels,
  trainingPrograms,
} from "@/data/training-programs";

interface ProgramDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return trainingPrograms.map((program) => ({ slug: program.slug }));
}

export async function generateMetadata({ params }: ProgramDetailPageProps): Promise<Metadata> {
  const program = getTrainingProgramBySlug((await params).slug);
  if (!program) return {};
  return {
    title: `${program.title} | VTIME`,
    description: program.summary,
  };
}

export default async function ProgramDetailPage({ params }: ProgramDetailPageProps) {
  const program = getTrainingProgramBySlug((await params).slug);
  if (!program) notFound();
  const category = getTrainingCategory(program.category);

  return (
    <>
      <PageIntro
        eyebrow={category?.title ?? "VTIME program"}
        title={program.title}
        description={program.summary}
        actions={
          <>
            <Button asChild size="lg" variant="accent">
              <Link href={`/vtime/registration?program=${program.slug}`}>
                Register interest <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/5 text-white hover:border-white/60 hover:bg-white/10"
            >
              <Link href="/vtime/programs">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All programs
              </Link>
            </Button>
          </>
        }
      />

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <SectionHeader
                eyebrow="Overview"
                title="What this program develops."
                subtitle={program.summary}
              />
              <div className="mt-8 flex flex-wrap gap-2">
                {category && <Badge variant="primary">{category.title}</Badge>}
                <Badge>{trainingLevelLabels[program.level]}</Badge>
                <Badge variant={program.registrationStatus === "registration-open" ? "success" : "warning"}>
                  {registrationStatusLabels[program.registrationStatus]}
                </Badge>
              </div>

              <section className="mt-12" aria-labelledby="objectives-heading">
                <h2 id="objectives-heading" className="font-display text-h3 text-institutional">Objectives</h2>
                <ul className="mt-6 space-y-4">
                  {program.objectives.map((objective) => (
                    <li key={objective} className="flex gap-3 text-body text-foreground">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-forest" aria-hidden="true" />
                      {objective}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mt-12" aria-labelledby="modules-heading">
                <h2 id="modules-heading" className="font-display text-h3 text-institutional">Modules</h2>
                <ol className="mt-6 grid gap-4 sm:grid-cols-2">
                  {program.modules.map((module, index) => (
                    <li key={module} className="rounded-card border border-border bg-surface p-5 shadow-card">
                      <span className="text-meta uppercase text-gold-strong">Module {index + 1}</span>
                      <p className="mt-2 font-semibold text-institutional">{module}</p>
                    </li>
                  ))}
                </ol>
              </section>
            </div>

            <aside className="space-y-6" aria-label="Program details">
              <Card padding="default">
                <h2 className="font-display text-h4 text-institutional">Program details</h2>
                <dl className="mt-6 space-y-5">
                  <DetailFact icon={Users} label="Audience" value={program.audience.join(", ")} />
                  <DetailFact
                    icon={MonitorSmartphone}
                    label="Format"
                    value={program.format ? trainingFormatLabels[program.format] : "To be confirmed"}
                  />
                  <DetailFact icon={Clock3} label="Duration" value={program.duration ?? "To be confirmed"} />
                  <DetailFact
                    icon={CalendarDays}
                    label="Schedule"
                    value={formatTrainingDateRange(program.startDate, program.endDate)}
                  />
                  <DetailFact icon={MapPin} label="Venue" value={program.location ?? "To be confirmed"} />
                  {program.facilitator && (
                    <DetailFact icon={UserRound} label="Facilitator" value={program.facilitator} />
                  )}
                </dl>
              </Card>

              <Card padding="default" variant="muted">
                <h2 className="font-display text-h4 text-institutional">Requirements</h2>
                {program.requirements.length > 0 ? (
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-foreground">
                    {program.requirements.map((requirement) => (
                      <li key={requirement}>{requirement}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    No entry requirements have been published for this program.
                  </p>
                )}
              </Card>
            </aside>
          </div>
        </Container>
      </Section>

      {program.startDate === null && (
        <Section tone="muted">
          <Container>
            <EmptyState
              icon={CalendarDays}
              title="Delivery schedule pending"
              description="This program outline is available for planning, but its date, facilitator, format, duration, venue, and capacity have not yet been confirmed."
              action={
                <Button asChild variant="secondary">
                  <Link href="/vtime/calendar">View training calendar</Link>
                </Button>
              }
            />
          </Container>
        </Section>
      )}

      <CTASection
        eyebrow="VTIME registration"
        title="Tell us you are interested in this program."
        description="Submit your participant details for follow-up. Registration does not reserve a place until RECCU-CAM confirms the cohort and participation terms."
        actions={
          <Button asChild size="lg" variant="accent">
            <Link href={`/vtime/registration?program=${program.slug}`}>
              Register interest <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        }
      />
    </>
  );
}

interface DetailFactProps {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}

function DetailFact({ icon: Icon, label, value }: DetailFactProps) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-forest" aria-hidden="true" />
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
        <dd className="mt-1 text-sm leading-6 text-foreground">{value}</dd>
      </div>
    </div>
  );
}
