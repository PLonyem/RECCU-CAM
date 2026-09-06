import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { isAdminRole, normalizeAuthRole } from "@/lib/auth/roles";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { chapterProfileFieldKeys, updateAffiliateSchema } from "@/lib/validation/affiliate";
import { slugify } from "@/lib/slug";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { userId, sessionClaims } = await auth();
  // Admin-only, not just "is there a session" — see the PUT handler below.
  if (!userId || !isAdminRole(sessionClaims?.metadata?.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const affiliate = await prisma.affiliate.findUnique({ where: { id } });

  if (!affiliate) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(affiliate);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { userId, sessionClaims } = await auth();
  const role = normalizeAuthRole(sessionClaims?.metadata?.role);
  // role check (not just "is there a session") matters here specifically:
  // this route accepts a raw profileStatus field, so without it a
  // affiliate_user session could call it directly and self-approve its own
  // profile, bypassing the admin review workflow entirely.
  if (!userId || !role || !isAdminRole(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.affiliate.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateAffiliateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  if (data.code && data.code !== existing.code) {
    const codeTaken = await prisma.affiliate.findFirst({
      where: { code: data.code, NOT: { id } },
      select: { id: true },
    });
    if (codeTaken) {
      return NextResponse.json(
        { error: `An affiliate with code "${data.code}" already exists.` },
        { status: 409 }
      );
    }
  }

  // Only bump profileUpdatedAt when this request actually touches
  // chapter-profile content, not on ordinary code/name/region edits from
  // the basic Affiliate admin form.
  const touchesProfile = chapterProfileFieldKeys.some((key) => key in body);

  const affiliate = await prisma.affiliate.update({
    where: { id },
    data: {
      ...data,
      ...(touchesProfile ? { profileUpdatedAt: new Date() } : {}),
    },
  });

  await writeAuditLog({ actorId: userId, actorRole: role, action: "affiliate_updated", resource: "affiliate", resourceId: affiliate.id, metadata: { active: affiliate.isActive, profileStatus: affiliate.profileStatus } });
  revalidatePath("/network/affiliates");
  revalidatePath("/network/map");
  revalidatePath(`/network/affiliates/${slugify(existing.code)}`);
  revalidatePath(`/network/affiliates/${slugify(affiliate.code)}`);

  return NextResponse.json(affiliate);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { userId, sessionClaims } = await auth();
  const role = normalizeAuthRole(sessionClaims?.metadata?.role);
  // Admin-only, not just "is there a session" — see the PUT handler below.
  if (!userId || !role || !isAdminRole(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.affiliate.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.affiliate.delete({ where: { id } });

  await writeAuditLog({ actorId: userId, actorRole: role, action: "affiliate_deleted", resource: "affiliate", resourceId: id });
  revalidatePath("/network/affiliates");
  revalidatePath("/network/map");

  return NextResponse.json({ success: true });
}
