import { z } from "zod";

export const newsArticleSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).optional(),
  language: z.string().min(1).default("en"),
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  authorName: z.string().min(1),
  authorRole: z.string().nullable().optional(),
  chapter: z.string().nullable().optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  publishedAt: z.string().nullable().optional(),
  heroImageUrl: z.string().nullable().optional(),
  heroImageAlt: z.string().nullable().optional(),
  heroImageCaption: z.string().nullable().optional(),
});

export const updateNewsArticleSchema = newsArticleSchema.partial();
