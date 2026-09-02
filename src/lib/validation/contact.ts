import { z } from "zod";
import {
  excludesSensitiveCredentials,
  honeypotField,
} from "@/lib/validation/form-security";

export const contactMessageSchema = z.object({
  companyWebsite: honeypotField,
  name: z.string().trim().min(2, "Enter your name.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  phone: z.union([z.literal(""), z.string().trim().min(6, "Enter a valid phone number.").max(30)]).optional(),
  subject: z.string().trim().min(5, "Enter a subject.").max(160),
  message: z
    .string()
    .trim()
    .min(10, "Enter at least 10 characters.")
    .max(2000)
    .refine(
      excludesSensitiveCredentials,
      "Remove passwords, PINs, OTPs, or banking credentials before submitting.",
    ),
});
