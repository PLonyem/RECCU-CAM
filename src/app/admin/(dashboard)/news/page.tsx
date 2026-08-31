"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Pencil, Trash2, Search, CheckCircle2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Badge, type BadgeProps } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { CATEGORIES } from "@/lib/mock-data";
import { useLanguage } from "@/context/LanguageContext";

interface NewsArticleRow {
  id: string;
  title: string;
  category: string;
  language: string;
  published: boolean;
  authorName: string;
  publishedAt: string | null;
  createdAt: string;
}

interface ListResponse {
  articles: NewsArticleRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const LIMIT = 10;

const categoryBadgeVariants: NonNullable<BadgeProps["variant"]>[] = [
  "primary",
  "accent",
  "warning",
  "danger",
  "default",
];

function categoryVariant(
  category: string
): NonNullable<BadgeProps["variant"]> {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) % categoryBadgeVariants.length;
  }
  return categoryBadgeVariants[hash];
}

function categoryLabel(category: string): string {
  return CATEGORIES.find((c) => c.value === category)?.label.en ?? category;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminNewsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const showCreatedToast = searchParams.get("created") === "1";

  useEffect(() => {
    if (!showCreatedToast) return;
    const timer = setTimeout(() => router.replace("/admin/news"), 3000);
    return () => clearTimeout(timer);
  }, [showCreatedToast, router]);

  const [articles, setArticles] = useState<NewsArticleRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [language, setLanguage] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<NewsArticleRow | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 whenever the filters change, and flag a reload whenever
  // the effective request (page + filters + manual refresh) changes.
  // Adjusted during render (React's documented pattern for this) rather
  // than in an effect, so it doesn't trigger a second, cascading render.
  const filterKey = `${debouncedSearch}|${category}|${status}|${language}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const requestKey = `${filterKey}|${page}|${refreshToken}`;
  const [prevRequestKey, setPrevRequestKey] = useState(requestKey);
  if (requestKey !== prevRequestKey) {
    setPrevRequestKey(requestKey);
    setIsLoading(true);
  }

  useEffect(() => {
    let ignore = false;
    const params = new URLSearchParams({
      page: String(page),
      limit: String(LIMIT),
    });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (category) params.set("category", category);
    if (status) params.set("status", status);
    if (language) params.set("language", language);

    fetch(`/api/admin/news?${params.toString()}`)
      .then((res) => res.json())
      .then((data: ListResponse) => {
        if (ignore) return;
        setArticles(data.articles);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [page, debouncedSearch, category, status, language, refreshToken]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await fetch(`/api/admin/news/${deleteTarget.id}`, { method: "DELETE" });
    setIsDeleting(false);
    setDeleteTarget(null);
    setRefreshToken((t) => t + 1);
  }

  return (
    <div className="space-y-6">
      {showCreatedToast && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Article saved successfully.
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t("admin.newsManager")}</h1>
        <Link
          href="/admin/news/new"
          className={buttonVariants({ variant: "default" })}
        >
          <Plus className="h-4 w-4" />
          {t("admin.newArticle")}
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label.en}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
        >
          <option value="">All Status</option>
          <option value="published">{t("admin.published")}</option>
          <option value="draft">{t("admin.draft")}</option>
        </select>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
        >
          <option value="">All Languages</option>
          <option value="en">English</option>
          <option value="fr">French</option>
        </select>
      </div>

      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
          {t("loading_text")}
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
          No articles found
        </div>
      ) : (
        <>
          {/* Desktop: table */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left font-medium text-gray-500 px-4 py-3">
                      {t("admin.articleTitle")}
                    </th>
                    <th className="text-left font-medium text-gray-500 px-4 py-3">
                      {t("admin.category")}
                    </th>
                    <th className="text-left font-medium text-gray-500 px-4 py-3">
                      {t("admin.language")}
                    </th>
                    <th className="text-left font-medium text-gray-500 px-4 py-3">
                      {t("admin.status")}
                    </th>
                    <th className="text-left font-medium text-gray-500 px-4 py-3">
                      {t("admin.author")}
                    </th>
                    <th className="text-left font-medium text-gray-500 px-4 py-3">
                      {t("admin.date")}
                    </th>
                    <th className="text-right font-medium text-gray-500 px-4 py-3">
                      {t("admin.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 max-w-xs">
                        <p className="font-bold text-gray-900 truncate">
                          {article.title}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={categoryVariant(article.category)}>
                          {categoryLabel(article.category)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="default">
                          {article.language.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={article.published ? "success" : "default"}>
                          {article.published ? t("admin.published") : t("admin.draft")}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {article.authorName}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(article.publishedAt ?? article.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/news/${article.id}/edit`}
                            className="text-gray-400 hover:text-primary-600 transition-colors"
                            aria-label={t("admin.edit")}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(article)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            aria-label={t("admin.delete")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile: stacked cards */}
          <div className="md:hidden space-y-3">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white border border-gray-200 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-bold text-gray-900">{article.title}</p>
                  <div className="flex items-center gap-3 shrink-0">
                    <Link
                      href={`/admin/news/${article.id}/edit`}
                      className="text-gray-400 hover:text-primary-600 transition-colors"
                      aria-label={t("admin.edit")}
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(article)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      aria-label={t("admin.delete")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={categoryVariant(article.category)}>
                    {categoryLabel(article.category)}
                  </Badge>
                  <Badge variant="default">{article.language.toUpperCase()}</Badge>
                  <Badge variant={article.published ? "success" : "default"}>
                    {article.published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{article.authorName}</span>
                  <span>{formatDate(article.publishedAt ?? article.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {total} article{total === 1 ? "" : "s"} — page {page} of{" "}
            {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              {t("news_previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              {t("news_next")}
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete article?"
        description={`This will permanently delete "${deleteTarget?.title ?? ""}". This action cannot be undone.`}
        isConfirming={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
