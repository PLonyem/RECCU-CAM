import type { Metadata } from "next";
import { CalendarDays, UserRound } from "lucide-react";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/layout/PageIntro";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge, Card, Container, Section } from "@/components/ui";
import {
  formatNewsDate,
  getNewsCategory,
} from "@/data/news";
import { getPublicNewsArticleBySlug } from "@/lib/data/public-news";
import { createNewsArticleMetadata } from "@/lib/seo";
import { createNewsArticleStructuredData } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/news/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPublicNewsArticleBySlug(slug);
  if (!item) return {};

  return createNewsArticleMetadata({
    title: item.title,
    description: item.summary,
    path: `/news/${item.slug}`,
    publishedTime: item.publishedAt,
    modifiedTime: item.updatedAt ?? undefined,
    authors: item.authorName ? [item.authorName] : undefined,
  });
}

export default async function NewsDetailPage({ params }: PageProps<"/news/[slug]">) {
  const { slug } = await params;
  const item = await getPublicNewsArticleBySlug(slug);
  if (!item) notFound();

  const category = getNewsCategory(item.category);

  return (
    <>
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
      <PageIntro
        eyebrow="News"
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
            <Badge variant="primary">{category?.label ?? item.category}</Badge>
            <dl className="mt-6 space-y-5 text-sm">
              <div>
                <dt className="font-semibold text-institutional">Published</dt>
                <dd className="mt-1 inline-flex items-center gap-2 text-muted-foreground"><CalendarDays className="h-4 w-4" aria-hidden="true" />{formatNewsDate(item.publishedAt)}</dd>
              </div>
              {item.authorName && (
                <div>
                  <dt className="font-semibold text-institutional">Author</dt>
                  <dd className="mt-1 inline-flex items-center gap-2 text-muted-foreground"><UserRound className="h-4 w-4" aria-hidden="true" />{item.authorName}</dd>
                </div>
              )}
            </dl>
          </Card>
        </Container>
      </Section>
    </>
  );
}
