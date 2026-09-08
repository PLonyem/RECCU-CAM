import { z } from "zod";
import { httpsUrlSchema } from "@/lib/validation/url";

const newsArticleFields = {
  title: z.string().trim().min(1, "Title is required.").max(240, "Title must be 240 characters or fewer."),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only.").max(240).optional(),
  language: z.string().trim().min(1).max(10).default("en"),
  category: z.string().trim().max(100),
  tags: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
  excerpt: z.string().trim().max(1000),
  content: z.string().trim().max(100_000),
  authorName: z.string().trim().max(160),
  authorRole: z.string().trim().max(160).nullable().optional(),
  chapter: z.string().trim().max(160).nullable().optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  publishedAt: z.string().nullable().optional(),
  heroImageUrl: httpsUrlSchema.nullable().optional(),
  heroImageAlt: z.string().trim().max(300).nullable().optional(),
  heroImageCaption: z.string().trim().max(500).nullable().optional(),
  translations: z.object({ fr: z.object({
    title: z.string().trim().max(240).optional(),
    excerpt: z.string().trim().max(1000).optional(),
    content: z.string().trim().max(100_000).optional(),
  }).optional() }).default({}),
};

export const newsArticleDraftSchema = z.object(newsArticleFields);

export const newsArticleSchema = z.object(newsArticleFields).superRefine((data, context) => {
  for (const [field, label] of [["category", "Category"], ["excerpt", "Excerpt"], ["content", "Content"], ["authorName", "Author name"]] as const) {
    if (!data[field]) context.addIssue({ code: "custom", path: [field], message: `${label} is required before publishing.` });
  }
  const words = data.excerpt.split(/\s+/).filter(Boolean).length;
  if (data.excerpt && (words < 25 || words > 40)) {
    context.addIssue({ code: "custom", path: ["excerpt"], message: "Excerpt must be between 25 and 40 words." });
  }
});

export const updateNewsArticleSchema = newsArticleDraftSchema.partial();
