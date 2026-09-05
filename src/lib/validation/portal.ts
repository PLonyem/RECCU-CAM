import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

export const affiliateUpdateRequestSchema = z.object({
  address: optionalText(240),
  city: optionalText(120),
  phone: optionalText(50),
  email: optionalText(160).refine((value) => !value || z.string().email().safeParse(value).success, "Enter a valid email."),
  website: optionalText(300).refine((value) => !value || /^https?:\/\/[^\s]+$/i.test(value), "Enter a complete HTTP(S) website URL."),
  description: optionalText(2000),
});

export const supportTicketSchema = z.object({
  subject: z.string().trim().min(4).max(160),
  category: z.enum(["general", "compliance", "training", "technical", "affiliate-banking", "network-administration", "other"]),
  message: z.string().trim().min(20).max(5000),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
});

export const portalBankingInquirySchema = z.object({
  subject: z.string().trim().min(4).max(160),
  message: z.string().trim().min(20).max(5000),
});

export type AffiliateUpdateRequestInput = z.infer<typeof affiliateUpdateRequestSchema>;
export type SupportTicketInput = z.infer<typeof supportTicketSchema>;
