import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { affiliateOverrideSchema } from "@/lib/loan-calculator/validation";
import type { Prisma } from "@/generated/prisma/client";

async function adminIdentity() {
  const { userId, sessionClaims } = await auth();
  return userId && sessionClaims?.metadata?.role === "admin" ? userId : null;
}

export async function GET() {
  if (!await adminIdentity()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [products, affiliates, overrides] = await Promise.all([
    prisma.loanProduct.findMany({
      include: { versions: { orderBy: { version: "desc" }, take: 1 } },
      orderBy: { nameEn: "asc" },
    }),
    prisma.affiliate.findMany({ where: { isActive: true }, select: { id: true, code: true, name: true, city: true, region: true }, orderBy: { name: "asc" } }),
    prisma.loanProductAffiliate.findMany({
      include: { affiliate: { select: { name: true, code: true } }, loanProduct: { select: { nameEn: true, code: true } }, loanProductVersion: { select: { version: true } } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);
  return NextResponse.json({ products, affiliates, overrides });
}

export async function POST(request: Request) {
  const actorUserId = await adminIdentity();
  if (!actorUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = affiliateOverrideSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid affiliate override.", details: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;
  const version = await prisma.loanProductVersion.findFirst({ where: { id: data.loanProductVersionId, loanProductId: data.loanProductId } });
  if (!version) return NextResponse.json({ error: "The selected policy version does not belong to this product." }, { status: 400 });
  const previous = await prisma.loanProductAffiliate.findUnique({
    where: { loanProductVersionId_affiliateId: { loanProductVersionId: data.loanProductVersionId, affiliateId: data.affiliateId } },
  });
  const overrideData = {
    loanProductId: data.loanProductId,
    affiliateId: data.affiliateId,
    minimumAmount: data.minimumAmount,
    maximumAmount: data.maximumAmount,
    availableTerms: data.availableTerms,
    interestRateBasisPoints: data.interestRateBasisPoints,
    interestPeriod: data.interestPeriod,
    calculationMethod: data.calculationMethod,
    requiredSavingsBasisPoints: data.requiredSavingsBasisPoints,
    feeRules: data.feeRules == null ? undefined : data.feeRules as Prisma.InputJsonValue,
    isActive: data.isActive,
    effectiveFrom: new Date(data.effectiveFrom),
    effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null,
    changeReason: data.changeReason,
    createdBy: actorUserId,
  };
  const saved = await prisma.$transaction(async (tx) => {
    const override = await tx.loanProductAffiliate.upsert({
      where: { loanProductVersionId_affiliateId: { loanProductVersionId: data.loanProductVersionId, affiliateId: data.affiliateId } },
      create: { ...overrideData, loanProductVersionId: data.loanProductVersionId },
      update: overrideData,
      include: { affiliate: { select: { name: true, code: true } }, loanProduct: { select: { nameEn: true, code: true } }, loanProductVersion: { select: { version: true } } },
    });
    await tx.loanPolicyAuditLog.create({
      data: {
        actorUserId,
        entityType: "affiliate_loan_override",
        entityId: override.id,
        action: previous ? "update" : "create",
        previousData: previous as unknown as Prisma.InputJsonValue | undefined,
        newData: data as unknown as Prisma.InputJsonValue,
        reason: data.changeReason,
      },
    });
    return override;
  });
  return NextResponse.json(saved, { status: previous ? 200 : 201 });
}
