import { prisma } from "@/lib/prisma";
import { newsArticles as mockArticles } from "@/lib/mock-data";
import { NewsListClient, type NewsListArticle } from "./NewsListClient";

async function getPublishedArticles(): Promise<NewsListArticle[]> {
  try {
    const articles = await prisma.newsArticle.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        language: true,
        category: true,
        excerpt: true,
        publishedAt: true,
        createdAt: true,
      },
    });

    return articles.map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      language: article.language,
      category: article.category,
      excerpt: article.excerpt,
      publishedAt: (article.publishedAt ?? article.createdAt).toISOString(),
    }));
  } catch (error) {
    console.error(
      "Database unavailable, falling back to mock news data:",
      error
    );
    return [...mockArticles]
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )
      .map((article) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        language: article.language,
        category: article.category,
        excerpt: article.excerpt,
        publishedAt: article.publishedAt,
      }));
  }
}

export default async function NewsPage() {
  const articles = await getPublishedArticles();
  return <NewsListClient articles={articles} />;
}
