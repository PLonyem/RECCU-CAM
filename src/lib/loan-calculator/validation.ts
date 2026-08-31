import { z } from "zod";

const fcfa = z.number().int().min(0).max(2_000_000_000);

export const simulationRequestSchema = z.object({
  productId: z.string().min(1),
  affiliateId: z.string().min(1).optional(),
  language: z.enum(["en", "fr"]).default("en"),
  requestedAmount: fcfa.positive(),
  termMonths: z.number().int().min(1).max(600),
  savingsBalance: fcfa,
  firstPaymentDate: z.string().date().optional(),
  financialProfile: z.object({
    monthlyNetIncome: fcfa.optional(),
    otherMonthlyIncome: fcfa.optional(),
    existingLoanRepayments: fcfa.optional(),
    housingObligations: fcfa.optional(),
    otherCommitments: fcfa.optional(),
  }).optional(),
});

export const feeRuleSchema = z.object({
  id: z.string().min(1),
  nameEn: z.string().min(1),
  nameFr: z.string().min(1),
  descriptionEn: z.string().optional(),
  descriptionFr: z.string().optional(),
  kind: z.enum(["fee", "tax", "insurance"]),
  calculationType: z.enum(["fixed", "percentage"]),
  amount: fcfa.optional(),
  rateBasisPoints: z.number().int().min(0).max(100_000).optional(),
  calculationBase: z.enum(["principal", "interest", "principal_and_interest"]),
  principalThreshold: fcfa.optional(),
  minimumAmount: fcfa.optional(),
  maximumAmount: fcfa.optional(),
  active: z.boolean().default(true),
});

export const loanProductAdminSchema = z.object({
  code: z.string().trim().min(2).max(30).regex(/^[A-Z0-9_-]+$/),
  nameEn: z.string().trim().min(2).max(120),
  nameFr: z.string().trim().min(2).max(120),
  descriptionEn: z.string().trim().min(2).max(1500),
  descriptionFr: z.string().trim().min(2).max(1500),
  category: z.string().trim().min(2).max(80),
  icon: z.string().trim().min(1).max(40).default("Landmark"),
  isActive: z.boolean(),
  minimumAmount: fcfa.positive(),
  maximumAmount: fcfa.positive(),
  availableTerms: z.array(z.number().int().min(1).max(600)).min(1),
  interestRateBasisPoints: z.number().int().min(0).max(100_000),
  interestPeriod: z.enum(["annual", "monthly"]),
  calculationMethod: z.enum(["flat", "reducing_balance"]),
  requiredSavingsBasisPoints: z.number().int().min(0).max(100_000),
  affordabilityBasisPoints: z.number().int().min(1).max(100_000).nullable().optional(),
  gracePeriodMonths: z.number().int().min(0).max(120).default(0),
  eligibilityDescriptionEn: z.string().max(2000).optional(),
  eligibilityDescriptionFr: z.string().max(2000).optional(),
  requiredDocuments: z.array(z.object({ en: z.string().min(1), fr: z.string().min(1) })).default([]),
  feeRules: z.array(feeRuleSchema).default([]),
  effectiveFrom: z.string().date(),
  effectiveTo: z.string().date().nullable().optional(),
  isPublished: z.boolean(),
  changeReason: z.string().trim().min(3).max(1000),
});

export const affiliateOverrideSchema = z.object({
  loanProductId: z.string().min(1),
  loanProductVersionId: z.string().min(1),
  affiliateId: z.string().min(1),
  minimumAmount: fcfa.positive().nullable().optional(),
  maximumAmount: fcfa.positive().nullable().optional(),
  availableTerms: z.array(z.number().int().min(1).max(600)).default([]),
  interestRateBasisPoints: z.number().int().min(0).max(100_000).nullable().optional(),
  interestPeriod: z.enum(["annual", "monthly"]).nullable().optional(),
  calculationMethod: z.enum(["flat", "reducing_balance"]).nullable().optional(),
  requiredSavingsBasisPoints: z.number().int().min(0).max(100_000).nullable().optional(),
  feeRules: z.array(feeRuleSchema).nullable().optional(),
  isActive: z.boolean(),
  effectiveFrom: z.string().date(),
  effectiveTo: z.string().date().nullable().optional(),
  changeReason: z.string().trim().min(3).max(1000),
});
