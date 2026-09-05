import { z } from "zod";
import { safePublicUrlSchema } from "@/lib/validation/url";

export const resourceSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(240),
  description: z.string().trim().max(4000).nullable().optional(),
  category: z.string().trim().min(1, "Category is required").max(100),
  fileType: z.string().trim().max(100).nullable().optional(),
  fileSize: z.number().int().nonnegative().nullable().optional(),
  fileUrl: safePublicUrlSchema.nullable().optional(),
  issuingAuthority: z.string().trim().max(200).nullable().optional(),
  publicationDate: z.coerce.date().nullable().optional(),
  accessLevel: z.enum(["PUBLIC", "AFFILIATE_ONLY", "STAFF_ONLY"]).default("PUBLIC"),
  published: z.boolean().default(false),
  downloadCount: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
});

export const updateResourceSchema = resourceSchema.partial();
