"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { slugify } from "@/lib/slug";
import { CATEGORIES, CHAPTERS } from "@/data/admin-options";
import { httpsUrlSchema } from "@/lib/validation/url";

export const FORM_CATEGORIES = CATEGORIES.filter((c) =>
  (
    ["network-news", "projects", "training-events", "insights"] as string[]
  ).includes(c.value)
);

export const articleFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(240, "Title must be 240 characters or fewer"),
  slug: z.string().trim().min(1, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only").max(240),
  language: z.enum(["en", "fr"]),
  category: z.string().max(100),
  tags: z.string(),
  chapter: z.string(),
  excerpt: z.string().max(1000),
  content: z.string().max(100_000),
  authorName: z.string().max(160),
  authorRole: z.string().max(160),
  featured: z.boolean(),
  published: z.boolean(),
  heroImageUrl: z.union([z.literal(""), httpsUrlSchema]),
  heroImageAlt: z.string().max(300),
  heroImageCaption: z.string().max(500),
});

const articlePublishFormSchema = articleFormSchema.superRefine((data, context) => {
  for (const [name, label] of [["category", "Category"], ["excerpt", "Excerpt"], ["content", "Content"], ["authorName", "Author name"]] as const) {
    if (!data[name].trim()) context.addIssue({ code: "custom", path: [name], message: `${label} is required before publishing.` });
  }
  const words = data.excerpt.trim().split(/\s+/).filter(Boolean).length;
  if (data.excerpt.trim() && (words < 25 || words > 40)) context.addIssue({ code: "custom", path: ["excerpt"], message: "Excerpt must be between 25 and 40 words." });
});

export type ArticleFormValues = z.infer<typeof articleFormSchema>;

const emptyDefaults: ArticleFormValues = {
  title: "",
  slug: "",
  language: "en",
  category: "",
  tags: "",
  chapter: "",
  excerpt: "",
  content: "",
  authorName: "",
  authorRole: "",
  featured: false,
  published: false,
  heroImageUrl: "",
  heroImageAlt: "",
  heroImageCaption: "",
};

export function buildArticlePayload(
  values: ArticleFormValues,
  published: boolean
) {
  return {
    title: values.title,
    slug: values.slug,
    language: values.language,
    category: values.category,
    tags: values.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    excerpt: values.excerpt,
    content: values.content,
    authorName: values.authorName,
    authorRole: values.authorRole || null,
    chapter: values.chapter || null,
    featured: values.featured,
    published,
    heroImageUrl: values.heroImageUrl || null,
    heroImageAlt: values.heroImageAlt || null,
    heroImageCaption: values.heroImageCaption || null,
  };
}

interface ArticleFormProps {
  defaultValues?: Partial<ArticleFormValues>;
  /** Return an error message on failure; return nothing (or navigate) on success. */
  onSubmit: (
    values: ArticleFormValues,
    published: boolean
  ) => Promise<ArticleSubmitError | void>;
}

export interface ArticleSubmitError {
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export function ArticleForm({ defaultValues, onSubmit }: ArticleFormProps) {
  const [slugEdited, setSlugEdited] = useState(Boolean(defaultValues?.slug));
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<
    "publish" | "draft" | null
  >(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: { ...emptyDefaults, ...defaultValues },
  });

  const titleField = register("title");
  const slugField = register("slug");
  const excerpt = useWatch({ control, name: "excerpt" }) ?? "";
  const published = useWatch({ control, name: "published" }) ?? false;
  const excerptWordCount = excerpt.trim().split(/\s+/).filter(Boolean)
    .length;
  const isSubmitting = pendingAction !== null;

  async function handleFormSubmit(
    values: ArticleFormValues,
    published: boolean
  ) {
    setSubmitError(null);
    clearErrors();
    setPendingAction(published ? "publish" : "draft");
    const error = await onSubmit(values, published);
    setPendingAction(null);
    if (error) {
      setSubmitError(error.message);
      for (const [name, messages] of Object.entries(error.fieldErrors ?? {})) {
        if (name in emptyDefaults && messages[0]) setError(name as keyof ArticleFormValues, { type: "server", message: messages[0] });
      }
    }
  }

  const onPublish = handleSubmit((values) => {
    const parsed = articlePublishFormSchema.safeParse(values);
    if (!parsed.success) {
      clearErrors();
      for (const [name, messages] of Object.entries(parsed.error.flatten().fieldErrors)) {
        if (name in emptyDefaults && messages?.[0]) setError(name as keyof ArticleFormValues, { type: "publish", message: messages[0] });
      }
      return;
    }
    return handleFormSubmit(parsed.data, true);
  });
  const onSaveDraft = handleSubmit((values) =>
    handleFormSubmit(values, false)
  );

  return (
    <>
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 mb-6">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{submitError}</p>
        </div>
      )}

      <Card className="p-6">
        <form noValidate className="space-y-5">
          <div className="space-y-1">
            <label htmlFor="title" className="text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              id="title"
              type="text"
              disabled={isSubmitting}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
              {...titleField}
              onBlur={(e) => {
                titleField.onBlur(e);
                if (!slugEdited) {
                  setValue("slug", slugify(e.target.value));
                }
              }}
            />
            <p className="text-xs text-red-500 min-h-[16px]">
              {errors.title?.message}
            </p>
          </div>

          <div className="space-y-1">
            <label htmlFor="slug" className="text-sm font-medium text-gray-700">
              Slug
            </label>
            <input
              id="slug"
              type="text"
              disabled={isSubmitting}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
              {...slugField}
              onChange={(e) => {
                slugField.onChange(e);
                setSlugEdited(true);
              }}
            />
            <p className="text-xs text-gray-400">
              Auto-filled from the title when you leave that field — edit
              freely, it won&apos;t auto-update again.
            </p>
            <p className="text-xs text-red-500 min-h-[16px]">
              {errors.slug?.message}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label
                htmlFor="language"
                className="text-sm font-medium text-gray-700"
              >
                Language
              </label>
              <select
                id="language"
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
                {...register("language")}
              >
                <option value="en">English</option>
                <option value="fr">French</option>
              </select>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="category"
                className="text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <select
                id="category"
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
                {...register("category")}
              >
                <option value="">Select a category</option>
                {FORM_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label.en}
                  </option>
                ))}
              </select>
              <p className="text-xs text-red-500 min-h-[16px]">
                {errors.category?.message}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label htmlFor="tags" className="text-sm font-medium text-gray-700">
                Tags
              </label>
              <input
                id="tags"
                type="text"
                placeholder="tag1, tag2, tag3"
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
                {...register("tags")}
              />
              <p className="text-xs text-gray-400">Comma-separated</p>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="chapter"
                className="text-sm font-medium text-gray-700"
              >
                Chapter
              </label>
              <select
                id="chapter"
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
                {...register("chapter")}
              >
                <option value="">None</option>
                {CHAPTERS.map((chapter) => (
                  <option key={chapter} value={chapter}>
                    {chapter}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <label
                htmlFor="excerpt"
                className="text-sm font-medium text-gray-700"
              >
                Excerpt
              </label>
              <span className="text-xs text-gray-400">
                {excerptWordCount} / 25–40 words
              </span>
            </div>
            <textarea
              id="excerpt"
              rows={3}
              disabled={isSubmitting}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
              {...register("excerpt")}
            />
            <p className="text-xs text-red-500 min-h-[16px]">
              {errors.excerpt?.message}
            </p>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="content"
              className="text-sm font-medium text-gray-700"
            >
              Content
            </label>
            <textarea
              id="content"
              rows={12}
              placeholder="Write the full article body here. (Plain text for now — a rich text editor will replace this field later.)"
              disabled={isSubmitting}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
              {...register("content")}
            />
            <p className="text-xs text-red-500 min-h-[16px]">
              {errors.content?.message}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label
                htmlFor="authorName"
                className="text-sm font-medium text-gray-700"
              >
                Author Name
              </label>
              <input
                id="authorName"
                type="text"
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
                {...register("authorName")}
              />
              <p className="text-xs text-red-500 min-h-[16px]">
                {errors.authorName?.message}
              </p>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="authorRole"
                className="text-sm font-medium text-gray-700"
              >
                Author Role
              </label>
              <input
                id="authorRole"
                type="text"
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
                {...register("authorRole")}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                disabled={isSubmitting}
                className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                {...register("featured")}
              />
              Featured
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                disabled={isSubmitting}
                className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                {...register("published")}
              />
              {published ? "Publish immediately" : "Save as draft"}
            </label>
          </div>

          <div className="border-t border-gray-200 pt-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-1 sm:col-span-3">
              <label
                htmlFor="heroImageUrl"
                className="text-sm font-medium text-gray-700"
              >
                Hero Image URL
              </label>
              <input
                id="heroImageUrl"
                type="text"
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
                {...register("heroImageUrl")}
              />
              <p className="text-xs text-red-500 min-h-[16px]">{errors.heroImageUrl?.message}</p>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label
                htmlFor="heroImageAlt"
                className="text-sm font-medium text-gray-700"
              >
                Hero Image Alt Text
              </label>
              <input
                id="heroImageAlt"
                type="text"
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
                {...register("heroImageAlt")}
              />
              <p className="text-xs text-red-500 min-h-[16px]">{errors.heroImageAlt?.message}</p>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="heroImageCaption"
                className="text-sm font-medium text-gray-700"
              >
                Hero Image Caption
              </label>
              <input
                id="heroImageCaption"
                type="text"
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
                {...register("heroImageCaption")}
              />
              <p className="text-xs text-red-500 min-h-[16px]">{errors.heroImageCaption?.message}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="button" disabled={isSubmitting} onClick={onPublish}>
              {pendingAction === "publish" ? "Publishing..." : "Publish"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={onSaveDraft}
            >
              {pendingAction === "draft" ? "Saving..." : "Save as Draft"}
            </Button>
            <Link
              href="/admin/news"
              className={buttonVariants({ variant: "ghost" })}
            >
              Cancel
            </Link>
          </div>
        </form>
      </Card>
    </>
  );
}
