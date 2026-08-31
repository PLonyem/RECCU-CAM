"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { ShareArticle } from "@/components/news/ShareArticle";
import { Badge } from "@/components/ui/Badge";
import { FadeUp } from "@/components/ui/FadeUp";
import { useLanguage } from "@/context/LanguageContext";
import { CATEGORIES, type NewsCategory } from "@/lib/mock-data";
import { localize } from "@/lib/i18n";
import type { ArticleDetail } from "./page";

const categoryVariant: Record<
  NewsCategory,
  "default" | "primary" | "accent" | "success" | "warning" | "danger"
> = {
  "network-news": "primary",
  projects: "accent",
  "training-events": "warning",
  insights: "success",
  Circular: "danger",
  Training: "accent",
  COBAC: "primary",
  Announcement: "success",
  Event: "default",
};

function formatDate(dateStr: string, language: "en" | "fr") {
  return new Date(dateStr).toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function ArticleDetailClient({ article }: { article: ArticleDetail }) {
  const { language, t } = useLanguage();
  const categoryLabel = localize(
    CATEGORIES.find((category) => category.value === article.category)?.label ?? {
      en: article.category,
      fr: article.category,
    },
    language,
  );
  const paragraphs = article.content.split("\n\n");

  return (
    <>
      <PageHero
        title={article.title}
        breadcrumb={[
          { label: t("nav_home"), href: "/" },
          { label: t("nav_news"), href: "/news" },
          { label: article.title, href: `/news/${article.slug}` },
        ]}
      />

      <div className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4">
          <FadeUp>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Badge variant={categoryVariant[article.category as NewsCategory] ?? "default"}>
                {categoryLabel}
              </Badge>
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(article.publishedAt, language)}
              </span>
              {article.chapter && (
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <MapPin className="h-3.5 w-3.5" />
                  {article.chapter}
                </span>
              )}
            </div>

            {article.heroImageUrl && (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-8 bg-gray-100">
                <Image
                  src={article.heroImageUrl}
                  alt={article.heroImageAlt ?? ""}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="text-gray-700 leading-relaxed space-y-4">
              {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>

            <div className="flex items-center gap-3 mt-10 pt-6 border-t border-gray-200">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                {article.authorName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{article.authorName}</p>
                <p className="text-xs text-gray-500">{article.authorRole}</p>
              </div>
            </div>

            <ShareArticle title={article.title} slug={article.slug} />

            <div className="mt-8">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("news_back")}
              </Link>
            </div>
          </FadeUp>
        </div>
      </div>
    </>
  );
}
