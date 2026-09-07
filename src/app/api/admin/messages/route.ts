import { NextRequest, NextResponse } from "next/server";
import { adminDataResponse } from "@/lib/admin-data-server";
import { getMessageActor } from "@/lib/message-auth";
import {
  buildMessageOrderBy,
  buildMessageWhere,
  NEEDS_RESPONSE_STATUSES,
  parseMessageListQuery,
} from "@/lib/message-inbox";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const actor = await getMessageActor();
  if (!actor.ok) {
    return NextResponse.json(
      { error: actor.status === 401 ? "Unauthorized" : "Forbidden" },
      { status: actor.status },
    );
  }

  const query = parseMessageListQuery(request.nextUrl.searchParams);
  const where = buildMessageWhere(query, actor.userId);

  return adminDataResponse("messages", "list", async () => {
    const [rows, total, inbox, unread, starred, needsResponse, highPriority, resolved, archived, purposeGroups] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: buildMessageOrderBy(query.sort),
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: {
          id: true,
          referenceNumber: true,
          name: true,
          organization: true,
          purpose: true,
          department: true,
          subject: true,
          message: true,
          status: true,
          priority: true,
          isRead: true,
          isStarred: true,
          assignedUserId: true,
          assignedTo: true,
          archivedAt: true,
          respondedAt: true,
          responseDueAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.contactMessage.count({ where }),
      prisma.contactMessage.count({ where: { archivedAt: null } }),
      prisma.contactMessage.count({ where: { isRead: false, archivedAt: null } }),
      prisma.contactMessage.count({ where: { isStarred: true, archivedAt: null } }),
      prisma.contactMessage.count({ where: { status: { in: [...NEEDS_RESPONSE_STATUSES] }, archivedAt: null } }),
      prisma.contactMessage.count({ where: { priority: { in: ["high", "urgent"] }, archivedAt: null } }),
      prisma.contactMessage.count({ where: { status: "resolved", archivedAt: null } }),
      prisma.contactMessage.count({ where: { archivedAt: { not: null } } }),
      prisma.contactMessage.groupBy({
        by: ["purpose"],
        where: { archivedAt: null },
        _count: { _all: true },
        orderBy: { purpose: "asc" },
      }),
    ]);

    return {
      messages: rows.map(({ message, ...row }) => ({
        ...row,
        preview: message.replace(/\s+/g, " ").trim().slice(0, 220),
      })),
      summary: { inbox, unread, starred, needsResponse, highPriority, resolved, archived },
      purposeCounts: Object.fromEntries(purposeGroups.map((group) => [group.purpose, group._count._all])),
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
      unreadCount: unread,
    };
  });
}
