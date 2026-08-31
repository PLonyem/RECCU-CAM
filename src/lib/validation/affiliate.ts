import { z } from "zod";
import { regions } from "@/lib/mock-data";

export const affiliateSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  region: z
    .string()
    .refine((value) => regions.includes(value), "Invalid region"),
  city: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

// Chapter Profile Form fields — submitted separately from the core
// identity fields above via the admin "Upload Chapter Profiles" tool.
export const chapterProfileFieldsSchema = z.object({
  yearEstablished: z.number().int().min(1900).max(2100).nullable().optional(),
  briefHistory: z.string().nullable().optional(),
  totalMembers: z.number().int().min(0).nullable().optional(),
  branchCount: z.number().int().min(0).nullable().optional(),
  memberCreditUnionCount: z.number().int().min(0).nullable().optional(),
  services: z.array(z.string()).optional(),
  chapterPresident: z.string().nullable().optional(),
  chapterSupervisor: z.string().nullable().optional(),
  boardSize: z.number().int().min(0).nullable().optional(),
  staffCount: z.number().int().min(0).nullable().optional(),
  memberCreditUnions: z
    .array(
      z.object({
        name: z.string().min(1, "Name is required"),
        code: z.string().min(1, "Code is required"),
      })
    )
    .optional(),
});

// Set only by the admin review dashboard (Approve/Reject), never by a
// chapter's own submission — kept separate from chapterProfileFieldsSchema
// so a review action never counts as "touching" the profile content and
// bumping profileUpdatedAt.
export const chapterReviewSchema = z.object({
  profileStatus: z.enum(["pending", "approved", "rejected"]).optional(),
  profileReviewNote: z.string().nullable().optional(),
});

export const updateAffiliateSchema = affiliateSchema
  .partial()
  .merge(chapterProfileFieldsSchema)
  .merge(chapterReviewSchema);

export const chapterProfileFieldKeys = Object.keys(
  chapterProfileFieldsSchema.shape
) as (keyof z.infer<typeof chapterProfileFieldsSchema>)[];
