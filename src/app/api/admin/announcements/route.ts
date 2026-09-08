import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { isAdminRole, normalizeAuthRole } from "@/lib/auth/roles";
import { adminDataResponse } from "@/lib/admin-data-server";
import { prisma } from "@/lib/prisma";
import { announcementDraftSchema, announcementSchema } from "@/lib/validation/announcement";
import type { Prisma } from "@/generated/prisma/client";
import { writeAuditLog } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId || !isAdminRole(sessionClaims?.metadata?.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const status = params.get("status");
  const category = params.get("category");

  const where: Prisma.AnnouncementWhereInput = {};
  if (status === "published") {
    where.isPublished = true;
  } else if (status === "draft") {
    where.isPublished = false;
  }
  if (category) {
    where.category = category;
  }

  // nulls: "last" keeps drafts (no publishedAt yet) at the bottom instead
  // of Postgres's default of sorting them to the top on a desc order.
  return adminDataResponse("announcements", "list", () =>
    prisma.announcement.findMany({
      where,
      orderBy: { publishedAt: { sort: "desc", nulls: "last" } },
    }),
  );
}

export async function POST(request: NextRequest) {
  const { userId, sessionClaims } = await auth();
  const role = normalizeAuthRole(sessionClaims?.metadata?.role);
  if (!userId || !role || !isAdminRole(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = (body && typeof body === "object" && "isPublished" in body && body.isPublished === true
    ? announcementSchema
    : announcementDraftSchema).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Review the highlighted fields.", errors: parsed.error.flatten().fieldErrors, details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  return adminDataResponse(
    "announcements",
    "create",
    async () => {
      const announcement = await prisma.announcement.create({
        data: {
          title: data.title,
          opening: data.opening,
          translations: { fr: { title: data.titleFr, opening: data.openingFr } },
          details: data.details,
          category: data.category,
          priority: data.priority,
          targetChapter: data.targetChapter?.trim() || null,
          audience: data.audience,
          affiliateId: data.affiliateId?.trim() || null,
          startDate: data.startDate ? new Date(data.startDate) : null,
          isPublished: data.isPublished,
          publishedAt: data.isPublished ? new Date() : null,
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        },
      });
      await writeAuditLog({ actorId: userId, actorRole: role, action: announcement.isPublished ? "announcement_published" : "announcement_draft_created", resource: "announcement", resourceId: announcement.id, metadata: { audience: announcement.audience } });
      revalidatePath("/");
      revalidatePath("/affiliate-portal");
      return announcement;
    },
    201,
  );
}
