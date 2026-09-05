import { z } from "zod";
import {
  excludesSensitiveCredentials,
  honeypotField,
} from "@/lib/validation/form-security";
import { contactPurposeOptions, type ContactPurpose } from "@/data/contact";

const contactPurposeValues = contactPurposeOptions.map(({ value }) => value) as [
  ContactPurpose,
  ...ContactPurpose[],
];

const contactPurposeSchema = z.enum(contactPurposeValues, {
  errorMap: () => ({ message: "Select the purpose of your inquiry." }),
});

const optionalEmailSchema = z
  .string()
  .trim()
  .max(254, "Email is too long.")
  .refine(
    (value) => value === "" || z.string().email().safeParse(value).success,
    "Enter a valid email address.",
  )
  .optional();

const optionalText = (max: number, field: string) =>
  z.string().trim().max(max, `${field} must be ${max} characters or fewer.`).optional();

const phoneSchema = z
  .string()
  .trim()
  .min(7, "Enter your phone number.")
  .max(30, "Phone number is too long.")
  .refine((value) => /^\+?[0-9][0-9\s().-]*$/.test(value), "Enter a valid phone number.")
  .refine((value) => {
    const digitCount = value.replace(/\D/g, "").length;
    return digitCount >= 7 && digitCount <= 15;
  }, "Enter a valid phone number.");

export const contactInquirySchema = z.object({
  companyWebsite: honeypotField,
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(120, "Full name must be 120 characters or fewer."),
  phone: phoneSchema,
  email: optionalEmailSchema,
  organization: optionalText(160, "Organization"),
  role: optionalText(120, "Role"),
  purpose: contactPurposeSchema,
  subject: z
    .string()
    .trim()
    .min(3, "Enter a brief subject.")
    .max(160, "Subject must be 160 characters or fewer."),
  message: z
    .string()
    .trim()
    .min(20, "Enter at least 20 characters.")
    .max(2000, "Message must be 2000 characters or fewer.")
    .refine(
      excludesSensitiveCredentials,
      "Remove passwords, PINs, OTPs, or banking credentials before submitting.",
    ),
  consent: z.boolean().refine((value) => value, "Consent is required to submit your inquiry."),
});

export type ContactInquiry = z.infer<typeof contactInquirySchema>;

export function normalizeContactPhone(value: string) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");
  return trimmed.startsWith("+") ? `+${digits}` : digits;
}

// Backwards-compatible export for the existing route import and any external callers.
export const contactMessageSchema = contactInquirySchema;
