import type { Metadata } from "next";
import { CalendarDays, MapPin, UserRound } from "lucide-react";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/layout/PageIntro";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge, Card, Container, Section } from "@/components/ui";
import {
  formatNewsDate,
  getNewsCategory,
  getPublishedNewsItemBySlug,
  publishedNewsArticles,
  publishedNewsEvents,
} from "@/data/news";
import { createNewsArticleMetadata, createPageMetadata } from "@/lib/seo";
import { createNewsArticleStructuredData } from "@/lib/structured-data";

export function generateStaticParams() {
  return [...publishedNewsArticles, ...publishedNewsEvents].map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps<"/news/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const item = getPublishedNewsItemBySlug(slug);
  if (!item) return {};

  if (item.kind === "article") {
    return createNewsArticleMetadata({
      title: item.title,
      description: item.summary,
      path: `/news/${item.slug}`,
      publishedTime: item.publishedAt,
      modifiedTime: item.updatedAt ?? undefined,
      authors: item.authorName ? [item.authorName] : undefined,
    });
  }

  return createPageMetadata({
    title: item.title,
    description: item.summary,
    path: `/news/${item.slug}`,
  });
}

export default async function NewsDetailPage({ params }: PageProps<"/news/[slug]">) {
  const { slug } = await params;
  const item = getPublishedNewsItemBySlug(slug);
  if (!item) notFound();

  const category = getNewsCategory(item.category);
  const displayDate = item.kind === "article" ? item.publishedAt : item.startDate;

  return (
    <>
      {item.kind === "article" && (
        <JsonLd
          data={createNewsArticleStructuredData({
            headline: item.title,
            description: item.summary,
            path: `/news/${item.slug}`,
            datePublished: item.publishedAt,
            dateModified: item.updatedAt ?? undefined,
            authorName: item.authorName ?? undefined,
          })}
        />
      )}
      <PageIntro
        eyebrow={item.kind === "article" ? "News" : "Event"}
        title={item.title}
        description={item.summary}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "News & Events", href: "/news" },
          { label: item.title, href: `/news/${item.slug}` },
        ]}
      />
      <Section>
        <Container className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
          <article className="max-w-reading">
            <div className="space-y-5 text-body text-foreground">
              {item.body.map((paragraph, index) => <p key={`${item.id}-${index}`}>{paragraph}</p>)}
            </div>
          </article>
          <Card padding="default" aria-label="Publication details">
            <Badge variant={item.kind === "article" ? "primary" : "accent"}>{category?.label ?? item.category}</Badge>
            <dl className="mt-6 space-y-5 text-sm">
              <div>
                <dt className="font-semibold text-institutional">{item.kind === "article" ? "Published" : "Starts"}</dt>
                <dd className="mt-1 inline-flex items-center gap-2 text-muted-foreground"><CalendarDays className="h-4 w-4" aria-hidden="true" />{formatNewsDate(displayDate)}</dd>
              </div>
              {item.kind === "article" && item.authorName && (
                <div>
                  <dt className="font-semibold text-institutional">Author</dt>
                  <dd className="mt-1 inline-flex items-center gap-2 text-muted-foreground"><UserRound className="h-4 w-4" aria-hidden="true" />{item.authorName}</dd>
                </div>
              )}
              {item.kind === "event" && item.location && (
                <div>
                  <dt className="font-semibold text-institutional">Location</dt>
                  <dd className="mt-1 inline-flex items-start gap-2 text-muted-foreground"><MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{item.location}</dd>
                </div>
              )}
            </dl>
          </Card>
        </Container>
      </Section>
    </>
  );
}
