import { z } from "zod";

const optionalText = (maximum: number, label: string) =>
  z.string().trim().max(maximum, `${label} must be ${maximum} characters or fewer.`);

const requiredForPublish = (schema: z.ZodString, label: string) =>
  schema.min(1, `${label} is required before publishing.`);

const sectionFields = {
  whoTitle: optionalText(180, "Who We Are title"),
  whoDescription: optionalText(2500, "Who We Are description"),
  missionTitle: optionalText(180, "Mission title"),
  missionBody: optionalText(2500, "Mission body"),
  visionTitle: optionalText(180, "Vision title"),
  visionBody: optionalText(2500, "Vision body"),
  leaderName: optionalText(160, "Leader name"),
  leaderRole: optionalText(160, "Leader role"),
  leaderMessage: optionalText(2500, "Leadership message"),
  contactTitle: optionalText(180, "Contact CTA title"),
  contactDescription: optionalText(1000, "Contact CTA description"),
  contactButtonText: optionalText(60, "Contact button text"),
  values: z.array(z.object({
    title: optionalText(100, "Value title"),
    description: optionalText(500, "Value description"),
  })).max(5),
};

export const homepageSectionsDraftSchema = z.object(sectionFields);

export const homepageSectionsPublishSchema = z.object({
  ...sectionFields,
  whoTitle: requiredForPublish(sectionFields.whoTitle, "Who We Are title"),
  whoDescription: requiredForPublish(sectionFields.whoDescription, "Who We Are description"),
  missionTitle: requiredForPublish(sectionFields.missionTitle, "Mission title"),
  missionBody: requiredForPublish(sectionFields.missionBody, "Mission body"),
  visionTitle: requiredForPublish(sectionFields.visionTitle, "Vision title"),
  visionBody: requiredForPublish(sectionFields.visionBody, "Vision body"),
  contactTitle: requiredForPublish(sectionFields.contactTitle, "Contact CTA title"),
  contactDescription: requiredForPublish(sectionFields.contactDescription, "Contact CTA description"),
  contactButtonText: requiredForPublish(sectionFields.contactButtonText, "Contact button text"),
}).superRefine((data, context) => {
  const hasLeadership = Boolean(data.leaderName || data.leaderRole || data.leaderMessage);
  if (hasLeadership && !data.leaderName) context.addIssue({ code: "custom", path: ["leaderName"], message: "Leader name is required when leadership content is provided." });
  if (hasLeadership && !data.leaderMessage) context.addIssue({ code: "custom", path: ["leaderMessage"], message: "Leadership message is required when leadership content is provided." });
  data.values.forEach((value, index) => {
    if (value.title && !value.description) context.addIssue({ code: "custom", path: [`value${index + 1}Description`], message: "Value description is required when its title is provided." });
    if (!value.title && value.description) context.addIssue({ code: "custom", path: [`value${index + 1}Title`], message: "Value title is required when its description is provided." });
  });
});

export type HomepageSectionsInput = z.infer<typeof homepageSectionsDraftSchema>;

export function homepageSectionsFromFormData(formData: FormData): HomepageSectionsInput {
  const value = (name: string) => String(formData.get(name) ?? "");
  return {
    whoTitle: value("whoTitle"),
    whoDescription: value("whoDescription"),
    missionTitle: value("missionTitle"),
    missionBody: value("missionBody"),
    visionTitle: value("visionTitle"),
    visionBody: value("visionBody"),
    leaderName: value("leaderName"),
    leaderRole: value("leaderRole"),
    leaderMessage: value("leaderMessage"),
    contactTitle: value("contactTitle"),
    contactDescription: value("contactDescription"),
    contactButtonText: value("contactButtonText"),
    values: Array.from({ length: 5 }, (_, index) => ({
      title: value(`value${index + 1}Title`),
      description: value(`value${index + 1}Description`),
    })),
  };
}

const optionalEmail = z.union([z.literal(""), z.string().trim().max(254).email("Enter a valid email address.")]);
const optionalUrl = z.union([z.literal(""), z.string().trim().max(2048).url("Enter a valid URL.")]);

export function homepageSectionStatus(mode: "draft" | "publish") {
  return mode === "publish" ? "published" : "draft";
}

export const organizationSettingsSchema = z.object({
  siteName: z.string().trim().min(2, "Organization name is required.").max(100),
  fullName: z.string().trim().min(4, "Legal name is required.").max(240),
  address: z.string().trim().min(2, "Head office is required.").max(240),
  addressSecondary: optionalText(240, "Additional address"),
  phone: optionalText(60, "Phone"),
  email: optionalEmail,
  officeHours: optionalText(240, "Office hours"),
  facebookUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  twitterUrl: optionalUrl,
});

export type OrganizationSettingsInput = z.infer<typeof organizationSettingsSchema>;
