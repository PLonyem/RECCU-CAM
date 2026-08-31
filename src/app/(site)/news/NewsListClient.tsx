"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Newspaper } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Badge } from "@/components/ui/Badge";
import { FadeUp } from "@/components/ui/FadeUp";
import { cn } from "@/lib/utils";
import { CATEGORIES, type NewsCategory } from "@/lib/mock-data";
import { useLanguage } from "@/context/LanguageContext";
import { localize } from "@/lib/i18n";

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

const PAGE_SIZE = 5;

export interface NewsListArticle {
  id: string;
  title: string;
  slug: string;
  language: string;
  category: string;
  excerpt: string;
  publishedAt: string;
}

function formatDate(dateStr: string, language: "en" | "fr") {
  return new Date(dateStr).toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function NewsListClient({ articles }: { articles: NewsListArticle[] }) {
  const { t, language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | "All">("All");
  const [currentPage, setCurrentPage] = useState(1);

  const languageArticles = articles.filter((article) => article.language === language);
  const filteredArticles =
    selectedCategory === "All"
      ? languageArticles
      : languageArticles.filter((article) => article.category === selectedCategory);

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / PAGE_SIZE));
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function handleCategoryChange(category: NewsCategory | "All") {
    setSelectedCategory(category);
    setCurrentPage(1);
  }

  return (
    <>
      <PageHero title={t("news_page_title")} subtitle={t("news_page_subtitle")} />

      <div className="sticky top-16 z-20 bg-white border-b border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleCategoryChange("All")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer border-none",
              selectedCategory === "All"
                ? "bg-primary-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {t("news_category_all")}
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category.value}
              type="button"
              onClick={() => handleCategoryChange(category.value)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer border-none",
                selectedCategory === category.value
                  ? "bg-primary-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {localize(category.label, language)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-20">
        <div className="max-w-4xl mx-auto px-4">
          {filteredArticles.length > 0 ? (
            <>
              <div>
                {paginatedArticles.map((article, index) => (
                  <FadeUp key={article.id} index={index}>
                    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(article.publishedAt, language)}
                        </span>
                        <Badge
                          variant={
                            categoryVariant[article.category as NewsCategory] ?? "default"
                          }
                        >
                          {localize(
                            CATEGORIES.find((c) => c.value === article.category)?.label ?? {
                              en: article.category,
                              fr: article.category,
                            },
                            language
                          )}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-semibold text-primary-900 mb-2">
                        <Link
                          href={`/news/${article.slug}`}
                          className="hover:text-accent-600 transition-colors"
                        >
                          {article.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {article.excerpt}
                      </p>
                      <Link
                        href={`/news/${article.slug}`}
                        className="text-sm font-medium text-accent-600 hover:text-accent-700"
                      >
                        {t("news_read_more")}
                      </Link>
                    </div>
                  </FadeUp>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-50 disabled:pointer-events-none transition-colors"
                >
                  {t("news_previous")}
                </button>
                <span className="text-sm text-gray-500">
                  {t("news_page_label")} {currentPage} {t("news_of_label")} {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-50 disabled:pointer-events-none transition-colors"
                >
                  {t("news_next")}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-24">
              <Newspaper className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">{t("news_empty_title")}</p>
              <p className="text-gray-400 text-sm mt-1">
                {t("news_empty_subtitle")}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
