import { z } from "zod";
import { safePublicUrlSchema } from "@/lib/validation/url";

export const resourceSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(240),
  description: z.string().trim().max(4000).nullable().optional(),
  category: z.string().trim().min(1, "Category is required").max(100),
  fileType: z.string().trim().max(100).nullable().optional(),
  fileSize: z.number().int().nonnegative().nullable().optional(),
  fileUrl: safePublicUrlSchema.nullable().optional(),
  downloadCount: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
});

export const updateResourceSchema = resourceSchema.partial();
