import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CalendarDays,
  FileClock,
  FileText,
  FolderOpen,
  HardDriveDownload,
  History,
  ShieldCheck,
} from "lucide-react";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/layout/PageIntro";
import {
  Badge,
  Button,
  Card,
  Container,
  EmptyState,
  Section,
  SectionHeader,
} from "@/components/ui";
import {
  formatKnowledgeDate,
  getKnowledgeCategory,
  getPublicKnowledgeDocumentBySlug,
  getRelatedKnowledgeDocuments,
  knowledgeAccessLevelLabels,
  publicKnowledgeDocuments,
} from "@/data/knowledge";
import { createPageMetadata } from "@/lib/seo";

interface KnowledgeDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return publicKnowledgeDocuments.map((document) => ({ slug: document.slug }));
}

export async function generateMetadata({ params }: KnowledgeDetailPageProps): Promise<Metadata> {
  const document = getPublicKnowledgeDocumentBySlug((await params).slug);
  if (!document) return { title: "Resource not found", robots: { index: false, follow: false } };
  return createPageMetadata({
    title: document.title,
    description: document.description,
    path: `/knowledge/${document.slug}`,
  });
}

export default async function KnowledgeDetailPage({ params }: KnowledgeDetailPageProps) {
  const document = getPublicKnowledgeDocumentBySlug((await params).slug);
  if (!document) notFound();
  const category = getKnowledgeCategory(document.category);
  const relatedDocuments = getRelatedKnowledgeDocuments(document);

  return (
    <>
      <PageIntro
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Knowledge Centre", href: "/knowledge" },
          { label: document.title, href: `/knowledge/${document.slug}` },
        ]}
        eyebrow={category?.title ?? "Knowledge Centre"}
        title={document.title}
        description={document.description}
        actions={
          <>
            {document.fileUrl && (
              <Button asChild size="lg" variant="accent">
                <a href={document.fileUrl} target="_blank" rel="noreferrer">
                  Open public source <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
            )}
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/5 text-white hover:border-white/60 hover:bg-white/10"
            >
              <Link href="/knowledge">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Knowledge Centre
              </Link>
            </Button>
          </>
        }
      />

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <article>
              <SectionHeader
                eyebrow="Summary"
                title="About this public resource."
                subtitle={document.description}
              />
              <div className="mt-8 flex flex-wrap gap-2">
                {category && <Badge variant="primary">{category.title}</Badge>}
                <Badge>{document.documentType}</Badge>
                <Badge variant="success">{knowledgeAccessLevelLabels[document.accessLevel]}</Badge>
              </div>

              <section className="mt-12" aria-labelledby="tags-heading">
                <h2 id="tags-heading" className="font-display text-h3 text-institutional">Topics</h2>
                <div className="mt-5 flex flex-wrap gap-2">
                  {document.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
                </div>
              </section>

              <section className="mt-12" aria-labelledby="download-heading">
                <h2 id="download-heading" className="font-display text-h3 text-institutional">Download or access</h2>
                <Card padding="default" variant="muted" className="mt-6">
                  <HardDriveDownload className="h-7 w-7 text-forest" aria-hidden="true" />
                  <h3 className="mt-5 font-display text-h4 text-institutional">
                    {document.documentType === "Web Resource" ? "Public source webpage" : "Public document file"}
                  </h3>
                  <p className="mt-3 text-body text-muted-foreground">
                    {document.documentType === "Web Resource"
                      ? "This record points to the issuing authority's public webpage. RECCU-CAM does not host or relabel the source as its own publication."
                      : "Use the approved source link below to download the published file."}
                  </p>
                  {document.fileUrl ? (
                    <Button asChild className="mt-6">
                      <a href={document.fileUrl} target="_blank" rel="noreferrer">
                        {document.documentType === "Web Resource" ? "Open public source" : "Download document"}
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </Button>
                  ) : (
                    <p className="mt-5 text-sm font-semibold text-warning">No public file has been published.</p>
                  )}
                </Card>
              </section>

              <section className="mt-12" aria-labelledby="version-heading">
                <h2 id="version-heading" className="font-display text-h3 text-institutional">Version and update information</h2>
                <Card padding="default" className="mt-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <MetadataItem icon={History} label="Version" value={document.version ?? "Not published"} />
                    <MetadataItem icon={FileClock} label="Last updated" value={formatKnowledgeDate(document.updatedDate)} />
                  </div>
                  {!document.version && !document.updatedDate && (
                    <p className="mt-5 border-t border-border pt-5 text-sm leading-6 text-muted-foreground">
                      The source does not provide version or update metadata used by this catalogue. None has been inferred.
                    </p>
                  )}
                </Card>
              </section>
            </article>

            <aside className="space-y-6" aria-label="Document metadata">
              <Card padding="default">
                <h2 className="font-display text-h4 text-institutional">Document metadata</h2>
                <div className="mt-6 space-y-5">
                  <MetadataItem icon={Building2} label="Issuing authority" value={document.issuingAuthority ?? "Not published"} />
                  <MetadataItem icon={FolderOpen} label="Category" value={category?.title ?? "Not published"} />
                  <MetadataItem icon={FileText} label="Document type" value={document.documentType} />
                  <MetadataItem icon={CalendarDays} label="Publication date" value={formatKnowledgeDate(document.publicationDate)} />
                  <MetadataItem icon={FileClock} label="Updated date" value={formatKnowledgeDate(document.updatedDate)} />
                  <MetadataItem icon={HardDriveDownload} label="File size" value={document.fileSize ?? "Not published"} />
                  <MetadataItem icon={ShieldCheck} label="Access level" value={knowledgeAccessLevelLabels[document.accessLevel]} />
                </div>
              </Card>
              <Card padding="default" variant="muted">
                <ShieldCheck className="h-6 w-6 text-forest" aria-hidden="true" />
                <h2 className="mt-4 font-display text-h4 text-institutional">Public access</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  This record is explicitly classified for public access. Affiliate-only and staff-only metadata is not exposed on this route.
                </p>
              </Card>
            </aside>
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container>
          <SectionHeader
            eyebrow="Related documents"
            title="Continue with connected resources."
            subtitle="Related results are limited to public documents with shared categories or tags."
          />
          {relatedDocuments.length > 0 ? (
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {relatedDocuments.map((related) => (
                <Card key={related.id} padding="default">
                  <Badge variant="primary">{getKnowledgeCategory(related.category)?.title}</Badge>
                  <h3 className="mt-4 font-display text-h4 text-institutional">{related.title}</h3>
                  <Link href={`/knowledge/${related.slug}`} className="mt-5 inline-flex text-sm font-semibold text-forest hover:underline">
                    View details
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              className="mt-8"
              icon={FileText}
              title="No related public documents yet"
              description="Additional resources will appear only after their source, ownership, access level, and publication status are verified."
              action={
                <Button asChild variant="secondary"><Link href="/knowledge">Browse the public collection</Link></Button>
              }
            />
          )}
        </Container>
      </Section>
    </>
  );
}

interface MetadataItemProps {
  icon: typeof FileText;
  label: string;
  value: string;
}

function MetadataItem({ icon: Icon, label, value }: MetadataItemProps) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-forest" aria-hidden="true" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm leading-6 text-foreground">{value}</p>
      </div>
    </div>
  );
}
