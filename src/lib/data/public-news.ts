import "server-only";

import { prisma } from "@/lib/prisma";
import { readPublicData } from "@/lib/public-data";
import { mapPublicNewsArticle } from "@/lib/data/public-content-mappers";

export async function getPublicNewsArticles() {
  const records = await readPublicData(
    "published news",
    () => prisma.newsArticle.findMany({
      where: { published: true, publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
    }),
    [],
  );

  return records.map(mapPublicNewsArticle).filter((record) => record !== null);
}

export async function getPublicNewsArticleBySlug(slug: string) {
  const record = await readPublicData(
    "published news article",
    () => prisma.newsArticle.findFirst({
      where: { slug, published: true, publishedAt: { not: null } },
    }),
    null,
  );

  return record ? mapPublicNewsArticle(record) : null;
}
