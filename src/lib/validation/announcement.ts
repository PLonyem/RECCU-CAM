import { z } from "zod";

export const announcementDetailSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(100),
  value: z.string().trim().min(1, "Value is required").max(500),
});

const announcementFields = {
  title: z.string().trim().min(1, "Title is required.").max(180, "Title must be 180 characters or fewer."),
  opening: z.string().trim().max(4000, "Opening message must be 4000 characters or fewer."),
  titleFr: z.string().trim().max(180, "French title must be 180 characters or fewer.").optional().default(""),
  openingFr: z.string().trim().max(4000, "French opening message must be 4000 characters or fewer.").optional().default(""),
  details: z.array(announcementDetailSchema).max(20).default([]),
  category: z.string().trim().min(1).max(80).default("Circular"),
  priority: z.string().trim().min(1).max(20).default("normal"),
  targetChapter: z.string().trim().max(160).nullable().optional(),
  audience: z.enum(["PUBLIC", "ALL_AFFILIATES", "SPECIFIC_AFFILIATE", "STAFF"]).default("PUBLIC"),
  affiliateId: z.string().trim().nullable().optional(),
  startDate: z.string().nullable().optional(),
  isPublished: z.boolean().default(false),
  expiryDate: z.string().nullable().optional(),
};

export const announcementDraftSchema = z.object(announcementFields);

export const announcementSchema = z.object(announcementFields).superRefine((data, context) => {
  if (data.title.length < 5) context.addIssue({ code: "custom", path: ["title"], message: "Title must be at least 5 characters before publishing." });
  if (data.opening.length < 10) context.addIssue({ code: "custom", path: ["opening"], message: "Opening message must be at least 10 characters before publishing." });
  if (data.audience === "SPECIFIC_AFFILIATE" && !data.affiliateId) context.addIssue({ code: "custom", path: ["affiliateId"], message: "Choose an affiliate for this audience." });
});

export const updateAnnouncementSchema = announcementDraftSchema.partial();

export type AnnouncementDetail = z.infer<typeof announcementDetailSchema>;
