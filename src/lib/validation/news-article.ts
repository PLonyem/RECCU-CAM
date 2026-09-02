import { z } from "zod";
import { httpsUrlSchema } from "@/lib/validation/url";

export const newsArticleSchema = z.object({
  title: z.string().trim().min(1).max(240),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(240).optional(),
  language: z.string().trim().min(1).max(10).default("en"),
  category: z.string().trim().min(1).max(100),
  tags: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
  excerpt: z.string().trim().min(1).max(1000),
  content: z.string().trim().min(1).max(100_000),
  authorName: z.string().trim().min(1).max(160),
  authorRole: z.string().trim().max(160).nullable().optional(),
  chapter: z.string().trim().max(160).nullable().optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  publishedAt: z.string().nullable().optional(),
  heroImageUrl: httpsUrlSchema.nullable().optional(),
  heroImageAlt: z.string().trim().max(300).nullable().optional(),
  heroImageCaption: z.string().trim().max(500).nullable().optional(),
});

export const updateNewsArticleSchema = newsArticleSchema.partial();
