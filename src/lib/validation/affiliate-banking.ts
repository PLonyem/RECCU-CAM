import { z } from "zod";
import { honeypotField } from "@/lib/validation/form-security";

export const affiliateStatusOptions = [
  { value: "current-affiliate", label: "Current RECCU-CAM affiliate" },
  { value: "prospective-affiliate", label: "Prospective affiliate" },
  { value: "unsure", label: "Not sure" },
] as const;

export const supportCategoryOptions = [
  { value: "institutional-liquidity", label: "Institutional liquidity" },
  { value: "financial-resilience", label: "Financial resilience" },
  { value: "structured-network-support", label: "Structured network support" },
  { value: "relationship-management", label: "Relationship management" },
  { value: "other", label: "Other institutional need" },
] as const;

const credentialPattern = /\b(password|passcode|pin|one[- ]?time password|otp|banking credential|login credential)\b/i;

export const affiliateBankingInquirySchema = z.object({
  companyWebsite: honeypotField,
  institution: z.string().trim().min(2, "Enter the institution name.").max(160),
  affiliateStatus: z.enum(affiliateStatusOptions.map((option) => option.value) as [
    (typeof affiliateStatusOptions)[number]["value"],
    ...(typeof affiliateStatusOptions)[number]["value"][],
  ]),
  contactPerson: z.string().trim().min(2, "Enter the contact person’s name.").max(120),
  role: z.string().trim().min(2, "Enter the contact person’s role.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  phone: z.string().trim().min(6, "Enter a valid phone number.").max(30),
  city: z.string().trim().min(2, "Enter the institution’s city.").max(100),
  supportCategory: z.enum(supportCategoryOptions.map((option) => option.value) as [
    (typeof supportCategoryOptions)[number]["value"],
    ...(typeof supportCategoryOptions)[number]["value"][],
  ]),
  message: z
    .string()
    .trim()
    .min(20, "Provide at least 20 characters about the institutional need.")
    .max(2000, "Keep the message under 2,000 characters.")
    .refine(
      (value) => !credentialPattern.test(value),
      "Remove passwords, PINs, OTPs, or banking credentials before submitting.",
    ),
});

export type AffiliateBankingInquiry = z.infer<typeof affiliateBankingInquirySchema>;

export function getAffiliateStatusLabel(value: AffiliateBankingInquiry["affiliateStatus"]) {
  return affiliateStatusOptions.find((option) => option.value === value)?.label ?? value;
}

export function getSupportCategoryLabel(value: AffiliateBankingInquiry["supportCategory"]) {
  return supportCategoryOptions.find((option) => option.value === value)?.label ?? value;
}
