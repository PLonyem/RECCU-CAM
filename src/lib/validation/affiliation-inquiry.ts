import { z } from "zod";
import { honeypotField } from "@/lib/validation/form-security";

const sensitiveDataPattern = /\b(password|passcode|pin|one[- ]?time password|otp|banking credential|login credential)\b/i;

export const affiliationInquirySchema = z.object({
  companyWebsite: honeypotField,
  institution: z.string().trim().min(2, "Enter the institution name.").max(160),
  city: z.string().trim().min(2, "Enter the institution's city.").max(100),
  contactPerson: z.string().trim().min(2, "Enter the contact person's name.").max(120),
  role: z.string().trim().min(2, "Enter the contact person's role.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  phone: z.string().trim().min(6, "Enter a valid phone number.").max(30),
  message: z
    .string()
    .trim()
    .min(20, "Provide at least 20 characters about the institution and its interest.")
    .max(2000, "Keep the message under 2,000 characters.")
    .refine(
      (value) => !sensitiveDataPattern.test(value),
      "Remove passwords, PINs, OTPs, or banking credentials before submitting.",
    ),
});

export type AffiliationInquiry = z.infer<typeof affiliationInquirySchema>;
