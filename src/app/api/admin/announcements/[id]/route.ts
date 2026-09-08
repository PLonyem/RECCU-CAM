import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { isAdminRole, normalizeAuthRole } from "@/lib/auth/roles";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { announcementSchema, updateAnnouncementSchema } from "@/lib/validation/announcement";
import type { Prisma } from "@/generated/prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { userId, sessionClaims } = await auth();
  const role = normalizeAuthRole(sessionClaims?.metadata?.role);
  if (!userId || !role || !isAdminRole(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const hasTitleFr = Boolean(body && typeof body === "object" && "titleFr" in body);
  const hasOpeningFr = Boolean(body && typeof body === "object" && "openingFr" in body);
  const publishCandidate = body && typeof body === "object" && "isPublished" in body && body.isPublished === true
    ? {
        ...existing,
        ...body,
        startDate: "startDate" in body ? body.startDate : existing.startDate?.toISOString() ?? null,
        expiryDate: "expiryDate" in body ? body.expiryDate : existing.expiryDate?.toISOString() ?? null,
      }
    : body;
  const parsed = (publishCandidate !== body ? announcementSchema : updateAnnouncementSchema).safeParse(publishCandidate);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Review the highlighted fields.", errors: parsed.error.flatten().fieldErrors, details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { titleFr, openingFr, ...data } = parsed.data;
  const previousTranslations = existing.translations && typeof existing.translations === "object" && !Array.isArray(existing.translations)
    ? existing.translations as Record<string, unknown>
    : {};
  const previousFrench = previousTranslations.fr && typeof previousTranslations.fr === "object" && !Array.isArray(previousTranslations.fr)
    ? previousTranslations.fr as Record<string, unknown>
    : {};
  const translations: Prisma.InputJsonValue = {
    ...previousTranslations,
    fr: {
      ...previousFrench,
      ...(hasTitleFr ? { title: titleFr } : {}),
      ...(hasOpeningFr ? { opening: openingFr } : {}),
    },
  } as Prisma.InputJsonValue;

  // publishedAt tracks isPublished's transition rather than being a
  // client-supplied value: the draft -> published edge stamps "now" (and
  // only that edge — editing an already-published announcement doesn't
  // reset its original publish date), while any move to unpublished always
  // clears it, even if it was already unpublished.
  let publishedAt: Date | null | undefined;
  if (data.isPublished === true && !existing.isPublished) {
    publishedAt = new Date();
  } else if (data.isPublished === false) {
    publishedAt = null;
  }

  const announcement = await prisma.announcement.update({
    where: { id },
    data: {
      ...data,
      translations,
      expiryDate:
        data.expiryDate !== undefined
          ? data.expiryDate
            ? new Date(data.expiryDate)
            : null
          : undefined,
      startDate:
        data.startDate !== undefined
          ? data.startDate
            ? new Date(data.startDate)
            : null
          : undefined,
      ...(publishedAt !== undefined ? { publishedAt } : {}),
    },
  });

  await writeAuditLog({ actorId: userId, actorRole: role, action: announcement.isPublished ? "announcement_published_or_updated" : "announcement_unpublished_or_updated", resource: "announcement", resourceId: announcement.id, metadata: { audience: announcement.audience } });
  revalidatePath("/");
  revalidatePath("/affiliate-portal");

  return NextResponse.json(announcement);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { userId, sessionClaims } = await auth();
  const role = normalizeAuthRole(sessionClaims?.metadata?.role);
  if (!userId || !role || !isAdminRole(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.announcement.delete({ where: { id } });

  await writeAuditLog({ actorId: userId, actorRole: role, action: "announcement_deleted", resource: "announcement", resourceId: id });
  revalidatePath("/");
  revalidatePath("/affiliate-portal");

  return NextResponse.json({ success: true });
}
