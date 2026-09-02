import { z } from "zod";
import { regions } from "@/data/admin-options";
import { httpsUrlSchema } from "@/lib/validation/url";

export const affiliateSchema = z.object({
  code: z.string().trim().min(1, "Code is required").max(40),
  name: z.string().trim().min(1, "Name is required").max(200),
  region: z
    .string()
    .refine((value) => regions.includes(value), "Invalid region"),
  city: z.string().trim().max(120).nullable().optional(),
  address: z.string().trim().max(300).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  email: z.string().trim().email().max(254).nullable().optional(),
  website: httpsUrlSchema.nullable().optional(),
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
