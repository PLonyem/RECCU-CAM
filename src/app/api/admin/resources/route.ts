import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { resourceSchema } from "@/lib/validation/resource";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId || sessionClaims?.metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.get("limit")) || 20));
  const search = params.get("search")?.trim();
  const category = params.get("category");

  const where: Prisma.ResourceWhereInput = {};

  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }
  if (category) {
    where.category = category;
  }

  const [resources, total] = await Promise.all([
    prisma.resource.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.resource.count({ where }),
  ]);

  return NextResponse.json({
    resources,
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
  const parsed = resourceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const resource = await prisma.resource.create({ data: parsed.data });

  return NextResponse.json(resource, { status: 201 });
}
