import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { announcementSchema } from "@/lib/validation/announcement";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId || sessionClaims?.metadata?.role !== "admin") {
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
  const announcements = await prisma.announcement.findMany({
    where,
    orderBy: { publishedAt: { sort: "desc", nulls: "last" } },
  });

  return NextResponse.json(announcements);
}

export async function POST(request: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId || sessionClaims?.metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = announcementSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const announcement = await prisma.announcement.create({
    data: {
      title: data.title,
      opening: data.opening,
      details: data.details,
      category: data.category,
      priority: data.priority,
      targetChapter: data.targetChapter?.trim() || null,
      isPublished: data.isPublished,
      publishedAt: data.isPublished ? new Date() : null,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
    },
  });

  return NextResponse.json(announcement, { status: 201 });
}
