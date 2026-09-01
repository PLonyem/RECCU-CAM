import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardCheck,
  Coins,
  FileText,
  GraduationCap,
  Handshake,
  Headphones,
  Landmark,
  Laptop,
  Library,
  Network,
  Presentation,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { PageIntro } from "@/components/layout/PageIntro";
import { TrainingProgramCard } from "@/components/vtime/TrainingProgramCard";
import {
  Button,
  Card,
  Container,
  CTASection,
  EmptyState,
  IconFeature,
  Section,
  SectionHeader,
} from "@/components/ui";
import {
  featuredTrainingPrograms,
  publishedTrainingEvents,
  trainingCategories,
  type TrainingCategorySlug,
} from "@/data/training-programs";

export const metadata: Metadata = {
  title: "VTIME",
  description:
    "Explore VTIME training foundations for microfinance professionals, cooperative leaders, entrepreneurs, and institutional teams.",
};

const categoryIcons: Record<TrainingCategorySlug, LucideIcon> = {
  "governance-leadership": Landmark,
  "microfinance-accounting": Coins,
  "credit-loan-management": ChartNoAxesCombined,
  "internal-control": ClipboardCheck,
  compliance: BadgeCheck,
  "risk-management": ShieldCheck,
  entrepreneurship: BriefcaseBusiness,
  "digital-financial-services": Laptop,
  "customer-service": Headphones,
  "cooperative-management": Network,
};

const audiences = [
  {
    icon: Building2,
    title: "Microfinance professionals",
    description: "Teams building practical capability across finance, credit, operations, control, and service.",
  },
  {
    icon: Users,
    title: "Cooperative leaders",
    description: "Board, committee, and management leaders strengthening stewardship and institutional direction.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Entrepreneurs",
    description: "Enterprise builders developing financial capability and sustainable management practices.",
  },
  {
    icon: Handshake,
    title: "Institutional teams",
    description: "Cross-functional groups aligning knowledge, systems, and responsibilities across an institution.",
  },
];

const learningApproach = [
  {
    number: "01",
    title: "Practice before abstraction",
    description: "Programs connect learning to the decisions, controls, and conversations participants handle at work.",
  },
  {
    number: "02",
    title: "Institution-aware learning",
    description: "Content is organised around cooperative and microfinance responsibilities, not generic business theory.",
  },
  {
    number: "03",
    title: "Application and reflection",
    description: "Objectives and modules make the expected learning pathway visible before a cohort is scheduled.",
  },
  {
    number: "04",
    title: "Verified delivery details",
    description: "Dates, facilitators, locations, format, and capacity are published only after confirmation.",
  },
];

export default function VtimePage() {
  return (
    <>
      <PageIntro
        eyebrow="VTIME"
        title="Developing Professionals. Strengthening Institutions."
        description="Practical training for microfinance professionals, cooperative leaders, entrepreneurs and institutional teams."
        actions={
          <>
            <Button asChild size="lg" variant="accent">
              <Link href="/vtime/programs">
                Browse Programs <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
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
          </>
        }
      />

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <SectionHeader
              eyebrow="About VTIME"
              title="Learning built around institutional realities."
              subtitle="VTIME—the Vocational Training Institute for Microfinance Institutions and Entrepreneurship—is RECCU-CAM's platform for practical professional and institutional development."
            />
            <Card variant="muted" padding="spacious" className="relative overflow-hidden">
              <div aria-hidden="true" className="absolute -right-10 -top-10 h-32 w-32 rounded-pill bg-gold/15" />
              <GraduationCap className="h-8 w-8 text-forest" aria-hidden="true" />
              <h2 className="mt-6 font-display text-h3 text-institutional">From knowledge to stronger practice</h2>
              <p className="mt-4 text-body text-muted-foreground">
                The platform creates a clear path from training needs to structured program outlines, verified schedules,
                practical resources, and registration guidance.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <BookOpenCheck className="h-4 w-4 text-forest" aria-hidden="true" /> Role-relevant curriculum
                </p>
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <BadgeCheck className="h-4 w-4 text-forest" aria-hidden="true" /> Verified scheduling
                </p>
              </div>
            </Card>
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container>
          <SectionHeader
            eyebrow="Training categories"
            title="Capability for every part of the institution."
            subtitle="Explore ten learning areas designed around the work of cooperative financial institutions, their leaders, and the communities they serve."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {trainingCategories.map((category) => {
              const Icon = categoryIcons[category.slug];
              return (
                <Card key={category.id} padding="default" className="h-full">
                  <span className="grid h-10 w-10 place-items-center rounded-control bg-primary-50 text-forest" aria-hidden="true">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-institutional">{category.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{category.summary}</p>
                </Card>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeader
              eyebrow="Featured programs"
              title="Start with a clear learning pathway."
              subtitle="These curriculum previews show intended audience, objectives, and modules. They are not scheduled training offers."
            />
            <Button asChild variant="secondary" className="self-start sm:self-auto">
              <Link href="/vtime/programs">
                View all programs <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {featuredTrainingPrograms.map((program) => (
              <TrainingProgramCard key={program.id} program={program} />
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="brand">
        <Container>
          <SectionHeader
            eyebrow="Who training is for"
            title="Learning that meets people in their roles."
            subtitle="VTIME is designed for professionals and teams seeking practical capability that can strengthen day-to-day work and institutional performance."
            className="[&_h2]:text-white [&_p]:text-primary-100"
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {audiences.map((audience) => (
              <IconFeature
                key={audience.title}
                icon={audience.icon}
                title={audience.title}
                description={audience.description}
                className="border-white/10 bg-white/[0.06] shadow-none [&_h3]:text-white [&_p]:text-primary-100 [&_span]:bg-white/10 [&_span]:text-accent-300"
              />
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
            <SectionHeader
              eyebrow="Learning approach"
              title="Structured for useful application."
              subtitle="A transparent training foundation helps participants and institutions understand what a program is intended to develop before delivery details are confirmed."
            />
            <ol className="grid gap-4 sm:grid-cols-2">
              {learningApproach.map((item) => (
                <li key={item.number} className="rounded-card border border-border bg-surface p-card shadow-card">
                  <span className="font-display text-h4 text-gold-strong" aria-hidden="true">{item.number}</span>
                  <h3 className="mt-4 font-display text-h4 text-institutional">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container>
          <SectionHeader
            eyebrow="Upcoming training"
            title="Plan with dates you can rely on."
            subtitle="Only confirmed training cohorts appear in the VTIME calendar."
          />
          <div className="mt-8">
            {publishedTrainingEvents.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No verified training dates published"
                description="Dates, facilitators, locations, delivery format, and capacity will appear after RECCU-CAM confirms them."
                action={
                  <Button asChild variant="secondary">
                    <Link href="/vtime/calendar">View training calendar</Link>
                  </Button>
                }
              />
            ) : null}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeader
            eyebrow="Resources"
            title="Continue learning beyond the program."
            subtitle="Use VTIME and RECCU-CAM resources to prepare, revisit core concepts, and connect learning with institutional practice."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <ResourceCard
              icon={Library}
              title="VTIME resources"
              description="Access learning materials and supporting resources as they are approved for publication."
              href="/vtime/resources"
              linkLabel="Explore VTIME resources"
            />
            <ResourceCard
              icon={FileText}
              title="Knowledge Centre"
              description="Find regulatory resources, circulars, publications, and compliance guidance."
              href="/knowledge"
              linkLabel="Enter Knowledge Centre"
            />
            <ResourceCard
              icon={Presentation}
              title="Program catalogue"
              description="Review program objectives, intended audiences, and curriculum modules in one place."
              href="/vtime/programs"
              linkLabel="Browse program outlines"
            />
          </div>
        </Container>
      </Section>

      <CTASection
        eyebrow="VTIME registration"
        title="Build the next capability your institution needs."
        description="Review the program catalogue, then use the registration guidance when a verified cohort is available."
        actions={
          <>
            <Button asChild variant="accent" size="lg">
              <Link href="/vtime/registration">
                Registration guidance <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/30 bg-white/5 text-white hover:border-white/60 hover:bg-white/10"
            >
              <Link href="/vtime/programs">Browse Programs</Link>
            </Button>
          </>
        }
      />
    </>
  );
}

interface ResourceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}

function ResourceCard({ description, href, icon: Icon, linkLabel, title }: ResourceCardProps) {
  return (
    <Card padding="default" className="flex h-full flex-col">
      <span className="grid h-11 w-11 place-items-center rounded-control bg-primary-50 text-forest" aria-hidden="true">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-5 font-display text-h4 text-institutional">{title}</h3>
      <p className="mt-2 text-body text-muted-foreground">{description}</p>
      <Link
        href={href}
        className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-forest underline-offset-4 hover:text-institutional hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
      >
        {linkLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </Card>
  );
}
