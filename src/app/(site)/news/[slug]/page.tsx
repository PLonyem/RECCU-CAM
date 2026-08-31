import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { newsArticles as mockArticles } from "@/lib/mock-data";
import { ArticleDetailClient } from "./ArticleDetailClient";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export interface ArticleDetail {
  id: string;
  title: string;
  slug: string;
  language: string;
  category: string;
  excerpt: string;
  content: string;
  authorName: string;
  authorRole: string | null;
  chapter: string | null;
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  publishedAt: string;
  published: boolean;
}

// Articles can be published, edited, or unpublished by an admin at any
// time, so this route must always hit the database fresh rather than
// serve a cached shell — static generation here would risk showing stale
// or (worse) unpublished content, or wrongly caching one slug's 404 shell
// for every other unmatched slug.
export const dynamic = "force-dynamic";

// Only the DB call itself is guarded here — this never calls notFound(),
// so the exception Next.js relies on for the not-found boundary can't get
// accidentally swallowed by this function's own error handling.
async function getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  try {
    const article = await prisma.newsArticle.findUnique({ where: { slug } });
    if (!article) return null;

    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      language: article.language,
      category: article.category,
      excerpt: article.excerpt,
      content: article.content,
      authorName: article.authorName,
      authorRole: article.authorRole,
      chapter: article.chapter,
      heroImageUrl: article.heroImageUrl,
      heroImageAlt: article.heroImageAlt,
      publishedAt: (article.publishedAt ?? article.createdAt).toISOString(),
      published: article.published,
    };
  } catch (error) {
    console.error(
      "Database unavailable, falling back to mock news data:",
      error
    );
    const mock = mockArticles.find((a) => a.slug === slug);
    if (!mock) return null;

    return {
      id: mock.id,
      title: mock.title,
      slug: mock.slug,
      language: mock.language,
      category: mock.category,
      excerpt: mock.excerpt,
      content: mock.content,
      authorName: mock.author.name,
      authorRole: mock.author.role,
      chapter: mock.chapter ?? null,
      heroImageUrl: mock.heroImage.url || null,
      heroImageAlt: mock.heroImage.alt || null,
      publishedAt: mock.publishedAt,
      published: true,
    };
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article || !article.published) {
    return { title: "Article Not Found — CamCCUL" };
  }

  return {
    title: `${article.title} — CamCCUL`,
    description: article.excerpt,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article || !article.published) {
    notFound();
  }

  return <ArticleDetailClient article={article} />;
}
