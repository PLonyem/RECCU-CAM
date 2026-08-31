"use client";

import { useRouter } from "next/navigation";
import {
  ArticleForm,
  buildArticlePayload,
  type ArticleFormValues,
} from "@/components/admin/ArticleForm";

export default function NewArticlePage() {
  const router = useRouter();

  async function handleCreate(values: ArticleFormValues, published: boolean) {
    const res = await fetch("/api/admin/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildArticlePayload(values, published)),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return body?.error ?? "Something went wrong. Please try again.";
    }

    router.push("/admin/news?created=1");
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">New Article</h1>
      <ArticleForm onSubmit={handleCreate} />
    </div>
  );
}
