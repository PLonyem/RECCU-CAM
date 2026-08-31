import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { listPublicLoanProducts } from "@/lib/loan-calculator/policy";

export async function GET() {
  const [products, affiliates] = await Promise.all([
    listPublicLoanProducts(),
    prisma.affiliate.findMany({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
        region: true,
        city: true,
        phone: true,
        email: true,
        website: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);
  return NextResponse.json({ products, affiliates });
}
