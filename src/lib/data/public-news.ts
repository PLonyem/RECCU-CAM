import "server-only";

import { prisma } from "@/lib/prisma";
import { readPublicData } from "@/lib/public-data";
import { mapPublicNewsArticle } from "@/lib/data/public-content-mappers";
import { getServerLanguage } from "@/lib/i18n-server";
import { localizeNewsArticle } from "@/lib/localized-content";

export async function getPublicNewsArticles() {
  const language = await getServerLanguage();
  const records = await readPublicData(
    "published news",
    () => prisma.newsArticle.findMany({
      where: { published: true, publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
    }),
    [],
  );

  return records.map((record) => mapPublicNewsArticle(localizeNewsArticle(record, language))).filter((record) => record !== null);
}

export async function getPublicNewsArticleBySlug(slug: string) {
  const language = await getServerLanguage();
  const record = await readPublicData(
    "published news article",
    () => prisma.newsArticle.findFirst({
      where: { slug, published: true, publishedAt: { not: null } },
    }),
    null,
  );

  return record ? mapPublicNewsArticle(localizeNewsArticle(record, language)) : null;
}
