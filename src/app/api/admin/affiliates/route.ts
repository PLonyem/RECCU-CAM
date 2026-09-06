import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { isAdminRole, normalizeAuthRole } from "@/lib/auth/roles";
import { adminDataResponse } from "@/lib/admin-data-server";
import { prisma } from "@/lib/prisma";
import { affiliateSchema } from "@/lib/validation/affiliate";
import type { Prisma } from "@/generated/prisma/client";
import { writeAuditLog } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId || !isAdminRole(sessionClaims?.metadata?.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = Math.min(1000, Math.max(1, Number(params.get("limit")) || 20));
  const search = params.get("search")?.trim();
  const region = params.get("region");
  const status = params.get("status");

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
  if (status === "active") {
    where.isActive = true;
  } else if (status === "inactive") {
    where.isActive = false;
  } else if (["pending", "approved", "rejected"].includes(status ?? "")) {
    where.profileStatus = status;
  }

  return adminDataResponse("affiliates", "list", async () => {
    const [affiliates, total] = await Promise.all([
      prisma.affiliate.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.affiliate.count({ where }),
    ]);

    return {
      affiliates,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  });
}

export async function POST(request: NextRequest) {
  const { userId, sessionClaims } = await auth();
  const role = normalizeAuthRole(sessionClaims?.metadata?.role);
  if (!userId || !role || !isAdminRole(role)) {
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

  await writeAuditLog({ actorId: userId, actorRole: role, action: "affiliate_created", resource: "affiliate", resourceId: affiliate.id, metadata: { active: affiliate.isActive } });
  revalidatePath("/network/affiliates");
  revalidatePath("/network/map");

  return NextResponse.json(affiliate, { status: 201 });
}
