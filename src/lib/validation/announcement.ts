import { z } from "zod";

export const announcementDetailSchema = z.object({
  label: z.string().trim().min(1, "Label is required"),
  value: z.string().trim().min(1, "Value is required"),
});

export const announcementSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters"),
  opening: z.string().trim().min(10, "Opening message must be at least 10 characters"),
  details: z.array(announcementDetailSchema).default([]),
  category: z.string().min(1).default("Circular"),
  priority: z.string().min(1).default("normal"),
  targetChapter: z.string().trim().nullable().optional(),
  isPublished: z.boolean().default(false),
  expiryDate: z.string().nullable().optional(),
});

export const updateAnnouncementSchema = announcementSchema.partial();

export type AnnouncementDetail = z.infer<typeof announcementDetailSchema>;
