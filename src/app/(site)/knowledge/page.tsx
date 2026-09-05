import type { Metadata } from "next";
import {
  BadgeCheck,
  BookOpenCheck,
  Building2,
  Calculator,
  ClipboardCheck,
  FileCheck2,
  FileLock2,
  FileText,
  GraduationCap,
  Landmark,
  Library,
  Scale,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { PageIntro } from "@/components/layout/PageIntro";
import { VerificationNote } from "@/components/layout/VerificationNote";
import { KnowledgeExplorer } from "@/components/knowledge/KnowledgeExplorer";
import { Card, Container, LoadingSkeleton, Section, SectionHeader } from "@/components/ui";
import {
  knowledgeCategories,
  type KnowledgeCategorySlug,
} from "@/data/knowledge";
import { createPageMetadata } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { readPublicData } from "@/lib/public-data";

export const metadata: Metadata = createPageMetadata({
  title: "Knowledge and Compliance Centre",
  description:
    "Search source-labelled regulatory guidance, circulars, publications, governance resources, and professional materials for cooperative financial institutions.",
  path: "/knowledge",
});

const categoryIcons: Record<KnowledgeCategorySlug, LucideIcon> = {
  "regulatory-library": Library,
  "cobac-resources": Landmark,
  "cemac-resources": Scale,
  "minfi-notices": Building2,
  "reccu-cam-circulars": FileText,
  governance: BookOpenCheck,
  compliance: BadgeCheck,
  "internal-control": ClipboardCheck,
  "aml-cft": ShieldCheck,
  "credit-management": FileCheck2,
  accounting: Calculator,
  "training-materials": GraduationCap,
  "reports-publications": FileText,
};

export default async function KnowledgePage() {
  const publishedResources = await readPublicData(
    "public knowledge resources",
    () =>
      prisma.resource.findMany({
        where: { published: true, isActive: true, accessLevel: "PUBLIC" },
        orderBy: [{ publicationDate: "desc" }, { updatedAt: "desc" }],
      }),
    [],
  );
  return (
    <>
      <PageIntro
        eyebrow="Knowledge and Compliance Centre"
        title="Knowledge That Strengthens Institutions"
        description="The RECCU-CAM Knowledge Centre brings together regulatory guidance, circulars, publications, governance resources and professional materials for cooperative financial institutions."
      />

      <Section>
        <Container>
          <VerificationNote>
            Public records are source-labelled. Restricted documents are not listed, previewed, or exposed in the public collection.
          </VerificationNote>
          <SectionHeader
            eyebrow="Knowledge categories"
            title="Find resources by institutional need."
            subtitle="Category routes feed directly into the searchable public collection. Empty categories remain visible without implying that unverified documents exist."
            className="mt-12"
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {knowledgeCategories.map((category) => {
              const Icon = categoryIcons[category.slug];
              return (
                <Link
                  key={category.id}
                  href={`/knowledge?category=${category.slug}`}
                  className="group rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
                >
                  <Card padding="default" className="h-full transition-[border-color,box-shadow,transform] group-hover:-translate-y-0.5 group-hover:border-primary-200 group-hover:shadow-raised">
                    <span className="grid h-10 w-10 place-items-center rounded-control bg-primary-50 text-forest" aria-hidden="true">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 font-display text-lg font-semibold text-institutional">{category.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{category.description}</p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section tone="muted" id="document-library">
        <Container>
          <SectionHeader
            eyebrow="Public document library"
            title="Search trusted, source-labelled material."
            subtitle="Use filters and sorting to narrow the public collection. Missing metadata is shown as unpublished rather than inferred."
          />
          <div className="mt-10">
            <Suspense fallback={<KnowledgeExplorerSkeleton />}>
              <KnowledgeExplorer />
            </Suspense>
          </div>
        </Container>
      </Section>

      {publishedResources.length > 0 && <Section tone="surface"><Container><SectionHeader eyebrow="RECCU-CAM publications" title="Recently published resources." subtitle="These records are managed by authorized staff and classified for public access." /><div className="mt-8 grid gap-4 md:grid-cols-2">{publishedResources.map((resource) => <Card key={resource.id} padding="default"><span className="rounded-pill bg-primary-50 px-3 py-1 text-xs font-semibold uppercase text-forest">{resource.category}</span><h3 className="mt-4 font-display text-xl font-semibold text-institutional">{resource.title}</h3>{resource.description && <p className="mt-2 text-sm leading-6 text-muted-foreground">{resource.description}</p>}<p className="mt-3 text-xs text-muted-foreground">{resource.issuingAuthority || "RECCU-CAM"}{resource.publicationDate ? ` · ${resource.publicationDate.toLocaleDateString("en-GB")}` : ""}</p>{resource.fileUrl && <a href={resource.fileUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex font-semibold text-forest underline-offset-4 hover:underline">Open resource</a>}</Card>)}</div></Container></Section>}

      <Section>
        <Container>
          <SectionHeader
            eyebrow="Access architecture"
            title="Clear access levels without simulated authorization."
            subtitle="The model supports three audiences, while this public route exposes only documents explicitly classified as Public."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <AccessCard
              icon={FileText}
              title="Public"
              status="Available here"
              description="Source-labelled records and files approved for unrestricted public access."
            />
            <AccessCard
              icon={FileLock2}
              title="Affiliate Only"
              status="Not exposed"
              description="Requires a future authenticated affiliate workflow and explicit document authorization."
            />
            <AccessCard
              icon={ShieldCheck}
              title="Staff Only"
              status="Not exposed"
              description="Requires a future staff identity, role check, and controlled delivery path."
            />
          </div>
        </Container>
      </Section>
    </>
  );
}

function KnowledgeExplorerSkeleton() {
  return (
    <div aria-label="Loading Knowledge Centre filters">
      <Card padding="default"><LoadingSkeleton lines={5} /></Card>
      <Card padding="default" className="mt-6"><LoadingSkeleton lines={6} /></Card>
    </div>
  );
}

interface AccessCardProps {
  icon: LucideIcon;
  title: string;
  status: string;
  description: string;
}

function AccessCard({ description, icon: Icon, status, title }: AccessCardProps) {
  return (
    <Card padding="default" className="h-full">
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-11 w-11 place-items-center rounded-control bg-primary-50 text-forest" aria-hidden="true">
          <Icon className="h-5 w-5" />
        </span>
        <span className="rounded-pill border border-border bg-muted px-3 py-1 text-meta uppercase text-muted-foreground">{status}</span>
      </div>
      <h3 className="mt-5 font-display text-h4 text-institutional">{title}</h3>
      <p className="mt-2 text-body text-muted-foreground">{description}</p>
    </Card>
  );
}
