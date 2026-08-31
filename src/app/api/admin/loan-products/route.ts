import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loanProductAdminSchema } from "@/lib/loan-calculator/validation";
import type { Prisma } from "@/generated/prisma/client";

async function adminIdentity() {
  const { userId, sessionClaims } = await auth();
  return userId && sessionClaims?.metadata?.role === "admin" ? userId : null;
}

export async function GET() {
  if (!await adminIdentity()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const products = await prisma.loanProduct.findMany({
    include: { versions: { orderBy: { version: "desc" } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const actorUserId = await adminIdentity();
  if (!actorUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = loanProductAdminSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid policy.", details: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;
  const created = await prisma.$transaction(async (tx) => {
    const product = await tx.loanProduct.create({
      data: {
        code: data.code,
        nameEn: data.nameEn,
        nameFr: data.nameFr,
        descriptionEn: data.descriptionEn,
        descriptionFr: data.descriptionFr,
        category: data.category,
        icon: data.icon,
        isActive: data.isActive,
      },
    });
    const version = await tx.loanProductVersion.create({
      data: {
        loanProductId: product.id,
        version: 1,
        minimumAmount: data.minimumAmount,
        maximumAmount: data.maximumAmount,
        availableTerms: data.availableTerms,
        interestRateBasisPoints: data.interestRateBasisPoints,
        interestPeriod: data.interestPeriod,
        calculationMethod: data.calculationMethod,
        requiredSavingsBasisPoints: data.requiredSavingsBasisPoints,
        affordabilityBasisPoints: data.affordabilityBasisPoints,
        gracePeriodMonths: data.gracePeriodMonths,
        eligibilityDescriptionEn: data.eligibilityDescriptionEn,
        eligibilityDescriptionFr: data.eligibilityDescriptionFr,
        requiredDocuments: data.requiredDocuments as Prisma.InputJsonValue,
        feeRules: data.feeRules as Prisma.InputJsonValue,
        effectiveFrom: new Date(data.effectiveFrom),
        effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null,
        isPublished: data.isPublished,
        changeReason: data.changeReason,
        createdBy: actorUserId,
      },
    });
    await tx.loanPolicyAuditLog.create({
      data: {
        actorUserId,
        entityType: "loan_product",
        entityId: product.id,
        action: "create",
        newData: data as unknown as Prisma.InputJsonValue,
        reason: data.changeReason,
      },
    });
    return { ...product, versions: [version] };
  });
  return NextResponse.json(created, { status: 201 });
}

export async function PUT(request: Request) {
  const actorUserId = await adminIdentity();
  if (!actorUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  const parsed = loanProductAdminSchema.safeParse(body);
  if (!id || !parsed.success) return NextResponse.json({ error: "Invalid policy update." }, { status: 400 });
  const data = parsed.data;
  const previous = await prisma.loanProduct.findUnique({ where: { id }, include: { versions: { orderBy: { version: "desc" }, take: 1 } } });
  if (!previous) return NextResponse.json({ error: "Loan product not found." }, { status: 404 });
  const updated = await prisma.$transaction(async (tx) => {
    const product = await tx.loanProduct.update({
      where: { id },
      data: {
        code: data.code,
        nameEn: data.nameEn,
        nameFr: data.nameFr,
        descriptionEn: data.descriptionEn,
        descriptionFr: data.descriptionFr,
        category: data.category,
        icon: data.icon,
        isActive: data.isActive,
      },
    });
    const version = await tx.loanProductVersion.create({
      data: {
        loanProductId: id,
        version: (previous.versions[0]?.version ?? 0) + 1,
        minimumAmount: data.minimumAmount,
        maximumAmount: data.maximumAmount,
        availableTerms: data.availableTerms,
        interestRateBasisPoints: data.interestRateBasisPoints,
        interestPeriod: data.interestPeriod,
        calculationMethod: data.calculationMethod,
        requiredSavingsBasisPoints: data.requiredSavingsBasisPoints,
        affordabilityBasisPoints: data.affordabilityBasisPoints,
        gracePeriodMonths: data.gracePeriodMonths,
        eligibilityDescriptionEn: data.eligibilityDescriptionEn,
        eligibilityDescriptionFr: data.eligibilityDescriptionFr,
        requiredDocuments: data.requiredDocuments as Prisma.InputJsonValue,
        feeRules: data.feeRules as Prisma.InputJsonValue,
        effectiveFrom: new Date(data.effectiveFrom),
        effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null,
        isPublished: data.isPublished,
        changeReason: data.changeReason,
        createdBy: actorUserId,
      },
    });
    await tx.loanPolicyAuditLog.create({
      data: {
        actorUserId,
        entityType: "loan_product",
        entityId: id,
        action: "create_version",
        previousData: previous as unknown as Prisma.InputJsonValue,
        newData: data as unknown as Prisma.InputJsonValue,
        reason: data.changeReason,
      },
    });
    return { ...product, versions: [version, ...previous.versions] };
  });
  return NextResponse.json(updated);
}
