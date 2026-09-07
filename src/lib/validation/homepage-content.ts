import { z } from "zod";
import { httpsUrlSchema, internalPathSchema } from "@/lib/validation/url";

export const HOMEPAGE_CONTENT_LIMITS = {
  heroBadge: 40,
  heroTitle: 120,
  heroSubtitle: 240,
  buttonText: 40,
  buttonLink: 2048,
  statistic: 30,
  heroImages: 5,
} as const;

const trimmedText = (maximum: number, message: string) =>
  z.string().trim().max(maximum, message);

const hexColor = z
  .string()
  .trim()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Enter a hex color like #0A2647.");

const homepageFieldsSchema = z.object({
  heroBadge: trimmedText(
    HOMEPAGE_CONTENT_LIMITS.heroBadge,
    `Badge text must be ${HOMEPAGE_CONTENT_LIMITS.heroBadge} characters or fewer.`,
  ),
  heroTitle: trimmedText(
    HOMEPAGE_CONTENT_LIMITS.heroTitle,
    `Headline must be ${HOMEPAGE_CONTENT_LIMITS.heroTitle} characters or fewer.`,
  ),
  heroSubtitle: trimmedText(
    HOMEPAGE_CONTENT_LIMITS.heroSubtitle,
    `Subtitle must be ${HOMEPAGE_CONTENT_LIMITS.heroSubtitle} characters or fewer.`,
  ),
  primaryButtonText: trimmedText(
    HOMEPAGE_CONTENT_LIMITS.buttonText,
    `Primary button text must be ${HOMEPAGE_CONTENT_LIMITS.buttonText} characters or fewer.`,
  ),
  primaryButtonLink: z.union([
    z.literal(""),
    internalPathSchema,
  ]),
  secondaryButtonText: trimmedText(
    HOMEPAGE_CONTENT_LIMITS.buttonText,
    `Secondary button text must be ${HOMEPAGE_CONTENT_LIMITS.buttonText} characters or fewer.`,
  ),
  secondaryButtonLink: z.union([
    z.literal(""),
    internalPathSchema,
  ]),
  heroImages: z
    .array(httpsUrlSchema)
    .max(HOMEPAGE_CONTENT_LIMITS.heroImages, `Add no more than ${HOMEPAGE_CONTENT_LIMITS.heroImages} images.`),
  statsAffiliates: z.number().int("Affiliates count must be a whole number.").min(0, "Affiliates count cannot be negative."),
  statsMembers: trimmedText(
    HOMEPAGE_CONTENT_LIMITS.statistic,
    `Members count must be ${HOMEPAGE_CONTENT_LIMITS.statistic} characters or fewer.`,
  ),
  statsAssets: trimmedText(
    HOMEPAGE_CONTENT_LIMITS.statistic,
    `Assets count must be ${HOMEPAGE_CONTENT_LIMITS.statistic} characters or fewer.`,
  ),
  showOverlay: z.boolean(),
  overlayColor: hexColor,
  overlayOpacity: z.number().int().min(0).max(100),
  backgroundColor: hexColor,
  gradientDirection: z.enum(["to-r", "to-b", "to-br", "to-bl"]),
  textAlignment: z.enum(["left", "center", "right"]),
  buttonStyle: z.enum(["solid", "outline", "ghost"]),
  showHero: z.boolean(),
  showStats: z.boolean(),
  showMission: z.boolean(),
  showServices: z.boolean(),
  showReach: z.boolean(),
  showNews: z.boolean(),
});

function addPairedCtaIssues(
  data: { primaryButtonText: string; primaryButtonLink: string; secondaryButtonText: string; secondaryButtonLink: string },
  context: z.RefinementCtx,
) {
  for (const [textKey, linkKey, label] of [
    ["primaryButtonText", "primaryButtonLink", "Primary CTA"],
    ["secondaryButtonText", "secondaryButtonLink", "Secondary CTA"],
  ] as const) {
    if (data[textKey] && !data[linkKey]) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: [linkKey], message: `${label} link is required when its label is provided.` });
    }
    if (!data[textKey] && data[linkKey]) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: [textKey], message: `${label} label is required when its link is provided.` });
    }
  }
}

export const homepageDraftSchema = homepageFieldsSchema.partial();

export const homepagePublishSchema = homepageFieldsSchema.superRefine((data, context) => {
  if (data.showHero) {
    for (const [field, message] of [
      ["heroBadge", "Badge text is required before publishing."],
      ["heroTitle", "Headline is required before publishing."],
      ["heroSubtitle", "Subtitle is required before publishing."],
    ] as const) {
      if (!data[field]) context.addIssue({ code: z.ZodIssueCode.custom, path: [field], message });
    }
    addPairedCtaIssues(data, context);
  }

  if (data.showStats && !data.statsMembers) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["statsMembers"], message: "Members count is required when statistics are shown." });
  }
});

export function validateHomepageContent(input: unknown, intent: "draft" | "publish") {
  return intent === "draft" ? homepageDraftSchema.safeParse(input) : homepagePublishSchema.safeParse(input);
}

export type HomepageContentInput = z.infer<typeof homepageFieldsSchema>;
export type HomepageDraftInput = z.infer<typeof homepageDraftSchema>;
