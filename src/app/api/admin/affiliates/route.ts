import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { affiliateSchema } from "@/lib/validation/affiliate";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId || sessionClaims?.metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = Math.min(1000, Math.max(1, Number(params.get("limit")) || 20));
  const search = params.get("search")?.trim();
  const region = params.get("region");

  const where: Prisma.AffiliateWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } },
    ];
  }
  if (region) {
    where.region = region;
  }

  const [affiliates, total] = await Promise.all([
    prisma.affiliate.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.affiliate.count({ where }),
  ]);

  return NextResponse.json({
    affiliates,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
}

export async function POST(request: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId || sessionClaims?.metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = affiliateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const existing = await prisma.affiliate.findUnique({
    where: { code: data.code },
  });
  if (existing) {
    return NextResponse.json(
      { error: `An affiliate with code "${data.code}" already exists.` },
      { status: 409 }
    );
  }

  const affiliate = await prisma.affiliate.create({ data });

  return NextResponse.json(affiliate, { status: 201 });
}
