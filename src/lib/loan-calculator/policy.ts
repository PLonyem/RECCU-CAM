import "server-only";
import { prisma } from "@/lib/prisma";
import { feeRuleSchema } from "./validation";
import type { LoanFeeRule, ResolvedLoanPolicy } from "./types";

function parseFeeRules(value: unknown): LoanFeeRule[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((rule) => {
    const parsed = feeRuleSchema.safeParse(rule);
    return parsed.success ? [parsed.data] : [];
  });
}

export async function resolveLoanPolicy(productId: string, affiliateId?: string): Promise<ResolvedLoanPolicy | null> {
  const now = new Date();
  const product = await prisma.loanProduct.findFirst({
    where: { id: productId, isActive: true },
    include: {
      versions: {
        where: {
          isPublished: true,
          effectiveFrom: { lte: now },
          OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }],
        },
        orderBy: [{ version: "desc" }],
        take: 1,
      },
    },
  });
  const version = product?.versions[0];
  if (!product || !version) return null;

  const override = affiliateId
    ? await prisma.loanProductAffiliate.findFirst({
        where: {
          affiliateId,
          loanProductVersionId: version.id,
          isActive: true,
          effectiveFrom: { lte: now },
          OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }],
        },
        include: { affiliate: true },
      })
    : null;

  return {
    productId: product.id,
    productVersionId: version.id,
    productCode: product.code,
    productNameEn: product.nameEn,
    productNameFr: product.nameFr,
    affiliateId: override?.affiliateId,
    affiliateName: override?.affiliate.name,
    minimumAmount: override?.minimumAmount ?? version.minimumAmount,
    maximumAmount: override?.maximumAmount ?? version.maximumAmount,
    availableTerms: override?.availableTerms.length ? override.availableTerms : version.availableTerms,
    interestRateBasisPoints: override?.interestRateBasisPoints ?? version.interestRateBasisPoints,
    interestPeriod: (override?.interestPeriod ?? version.interestPeriod) as ResolvedLoanPolicy["interestPeriod"],
    calculationMethod: (override?.calculationMethod ?? version.calculationMethod) as ResolvedLoanPolicy["calculationMethod"],
    requiredSavingsBasisPoints: override?.requiredSavingsBasisPoints ?? version.requiredSavingsBasisPoints,
    affordabilityBasisPoints: version.affordabilityBasisPoints ?? undefined,
    feeRules: parseFeeRules(override?.feeRules ?? version.feeRules),
    effectiveFrom: (override?.effectiveFrom ?? version.effectiveFrom).toISOString(),
    effectiveTo: (override?.effectiveTo ?? version.effectiveTo)?.toISOString(),
  };
}

export async function listPublicLoanProducts() {
  const now = new Date();
  const products = await prisma.loanProduct.findMany({
    where: { isActive: true },
    include: {
      versions: {
        where: {
          isPublished: true,
          effectiveFrom: { lte: now },
          OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }],
        },
        orderBy: { version: "desc" },
        take: 1,
      },
    },
    orderBy: [{ category: "asc" }, { nameEn: "asc" }],
  });

  return products.flatMap((product) => {
    const version = product.versions[0];
    if (!version) return [];
    return [{
      id: product.id,
      code: product.code,
      nameEn: product.nameEn,
      nameFr: product.nameFr,
      descriptionEn: product.descriptionEn,
      descriptionFr: product.descriptionFr,
      category: product.category,
      icon: product.icon,
      minimumAmount: version.minimumAmount,
      maximumAmount: version.maximumAmount,
      availableTerms: version.availableTerms,
      interestRateBasisPoints: version.interestRateBasisPoints,
      interestPeriod: version.interestPeriod,
      calculationMethod: version.calculationMethod,
      requiredSavingsBasisPoints: version.requiredSavingsBasisPoints,
    }];
  });
}
