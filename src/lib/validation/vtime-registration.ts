import { z } from "zod";
import { trainingPrograms } from "@/data/training-programs";
import { honeypotField } from "@/lib/validation/form-security";

const sensitiveDataPattern = /\b(password|passcode|pin|one[- ]?time password|otp|banking credential|login credential)\b/i;
const programSlugs = new Set(trainingPrograms.map((program) => program.slug));

export const vtimeRegistrationSchema = z.object({
  companyWebsite: honeypotField,
  participantName: z.string().trim().min(2, "Enter the participant's name.").max(120),
  institution: z.string().trim().min(2, "Enter the institution name.").max(160),
  role: z.string().trim().min(2, "Enter the participant's role.").max(120),
  program: z
    .string()
    .trim()
    .min(1, "Select a program.")
    .refine((value) => programSlugs.has(value), "Select a valid VTIME program."),
  phone: z.string().trim().min(6, "Enter a valid phone number.").max(30),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  notes: z
    .string()
    .trim()
    .max(2000, "Keep notes under 2,000 characters.")
    .refine(
      (value) => !sensitiveDataPattern.test(value),
      "Remove passwords, PINs, OTPs, or banking credentials before submitting.",
    ),
});

export type VtimeRegistration = z.infer<typeof vtimeRegistrationSchema>;
