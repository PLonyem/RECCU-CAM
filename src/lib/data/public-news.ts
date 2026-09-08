import "server-only";

import { prisma } from "@/lib/prisma";
import { readPublicData } from "@/lib/public-data";
import { mapPublicNewsArticle } from "@/lib/data/public-content-mappers";
import { getServerLanguage } from "@/lib/i18n-server";
import { getLocalizedFields } from "@/lib/localized-content";

function localizeRecord<T extends { title: string; excerpt: string; content: string; translations: unknown }>(record: T, language: "en" | "fr") {
  return { ...record, ...getLocalizedFields({ title: record.title, excerpt: record.excerpt, content: record.content }, record.translations, language) };
}

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

  return records.map((record) => mapPublicNewsArticle(localizeRecord(record, language))).filter((record) => record !== null);
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

  return record ? mapPublicNewsArticle(localizeRecord(record, language)) : null;
}
