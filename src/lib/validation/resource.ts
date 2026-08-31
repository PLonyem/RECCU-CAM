import { z } from "zod";

export const resourceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  category: z.string().min(1, "Category is required"),
  fileType: z.string().nullable().optional(),
  fileSize: z.number().int().nonnegative().nullable().optional(),
  fileUrl: z.string().nullable().optional(),
  downloadCount: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
});

export const updateResourceSchema = resourceSchema.partial();
