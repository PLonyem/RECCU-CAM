import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId || sessionClaims?.metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = Math.min(200, Math.max(1, Number(params.get("limit")) || 50));
  const status = params.get("status");

  const where: Prisma.ContactMessageWhereInput = {};
  if (status === "unread") {
    where.isRead = false;
  } else if (status === "read") {
    where.isRead = true;
  }

  const [messages, total, unreadCount] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.contactMessage.count({ where }),
    prisma.contactMessage.count({ where: { isRead: false } }),
  ]);

  return NextResponse.json({
    messages,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    unreadCount,
  });
}
