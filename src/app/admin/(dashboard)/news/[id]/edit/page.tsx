"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  ArticleForm,
  buildArticlePayload,
  type ArticleFormValues,
} from "@/components/admin/ArticleForm";

interface FetchedArticle {
  id: string;
  title: string;
  slug: string;
  language: string;
  category: string;
  tags: string[];
  excerpt: string;
  content: string;
  authorName: string;
  authorRole: string | null;
  chapter: string | null;
  featured: boolean;
  published: boolean;
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  heroImageCaption: string | null;
}

function toFormValues(article: FetchedArticle): Partial<ArticleFormValues> {
  return {
    title: article.title,
    slug: article.slug,
    language: article.language === "fr" ? "fr" : "en",
    category: article.category,
    tags: article.tags.join(", "),
    chapter: article.chapter ?? "",
    excerpt: article.excerpt,
    content: article.content,
    authorName: article.authorName,
    authorRole: article.authorRole ?? "",
    featured: article.featured,
    published: article.published,
    heroImageUrl: article.heroImageUrl ?? "",
    heroImageAlt: article.heroImageAlt ?? "",
    heroImageCaption: article.heroImageCaption ?? "",
  };
}

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const articleId = params.id;

  const [article, setArticle] = useState<FetchedArticle | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let ignore = false;

    fetch(`/api/admin/news/${articleId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Article not found");
        return res.json();
      })
      .then((data: FetchedArticle) => {
        if (!ignore) setArticle(data);
      })
      .catch(() => {
        if (!ignore) setLoadError("Couldn't load this article.");
      });

    return () => {
      ignore = true;
    };
  }, [articleId]);

  async function handleUpdate(values: ArticleFormValues, published: boolean) {
    const res = await fetch(`/api/admin/news/${articleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildArticlePayload(values, published)),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return body?.error ?? "Something went wrong. Please try again.";
    }

    router.push("/admin/news?created=1");
  }

  async function handleDelete() {
    setIsDeleting(true);
    await fetch(`/api/admin/news/${articleId}`, { method: "DELETE" });
    setIsDeleting(false);
    setIsDeleteOpen(false);
    router.push("/admin/news");
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Edit Article</h1>
        {article && (
          <Button
            type="button"
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        )}
      </div>

      {loadError && <p className="text-sm text-red-600">{loadError}</p>}

      {!article && !loadError && (
        <p className="text-sm text-gray-400">Loading article...</p>
      )}

      {article && (
        <ArticleForm
          defaultValues={toFormValues(article)}
          onSubmit={handleUpdate}
        />
      )}

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete article?"
        description={`This will permanently delete "${article?.title ?? ""}". This action cannot be undone.`}
        isConfirming={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
