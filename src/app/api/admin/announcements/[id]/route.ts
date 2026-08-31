import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { updateAnnouncementSchema } from "@/lib/validation/announcement";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { userId, sessionClaims } = await auth();
  if (!userId || sessionClaims?.metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateAnnouncementSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

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
      expiryDate:
        data.expiryDate !== undefined
          ? data.expiryDate
            ? new Date(data.expiryDate)
            : null
          : undefined,
      ...(publishedAt !== undefined ? { publishedAt } : {}),
    },
  });

  return NextResponse.json(announcement);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { userId, sessionClaims } = await auth();
  if (!userId || sessionClaims?.metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.announcement.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
