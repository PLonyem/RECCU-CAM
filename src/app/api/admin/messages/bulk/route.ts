import { NextRequest, NextResponse } from "next/server";
import { adminDataErrorResponse } from "@/lib/admin-data-server";
import { getMessageActor } from "@/lib/message-auth";
import { messageArchiveUpdate, messagePriorityRank, messageReadUpdate } from "@/lib/message-inbox";
import { resolveMessageAssignee } from "@/lib/message-service";
import { prisma } from "@/lib/prisma";
import { bulkMessageSchema } from "@/lib/validation/message";
import type { Prisma } from "@/generated/prisma/client";

export const runtime = "nodejs";

class InvalidAssigneeError extends Error {}

export async function POST(request: NextRequest) {
  const actor = await getMessageActor();
  if (!actor.ok) {
    return NextResponse.json(
      { error: actor.status === 401 ? "Unauthorized" : "Forbidden" },
      { status: actor.status },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bulkMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const assignee = parsed.data.action === "assign" && parsed.data.assignedUserId
      ? await resolveMessageAssignee(parsed.data.assignedUserId)
      : null;
    if (parsed.data.action === "assign" && parsed.data.assignedUserId && !assignee) {
      throw new InvalidAssigneeError();
    }

    const now = new Date();
    const requestedIds = parsed.data.action === "mark-all-read" ? null : parsed.data.ids;
    const records = await prisma.contactMessage.findMany({
      where: requestedIds
        ? { id: { in: requestedIds } }
        : { isRead: false, archivedAt: null },
      select: { id: true },
    });
    const ids = records.map((record) => record.id);

    if (!ids.length) return NextResponse.json({ updated: 0 });

    let data: Prisma.ContactMessageUpdateManyMutationInput = {};
    let action: string = parsed.data.action;
    let metadata: Prisma.InputJsonValue | undefined;

    if (parsed.data.action === "mark-read" || parsed.data.action === "mark-all-read") {
      data = messageReadUpdate(true, now);
      action = "marked_read";
    } else if (parsed.data.action === "mark-unread") {
      data = messageReadUpdate(false, now);
      action = "marked_unread";
    } else if (parsed.data.action === "set-status") {
      data = {
        status: parsed.data.status,
        archivedAt: parsed.data.status === "archived" ? now : null,
      };
      action = "status_changed";
      metadata = { to: parsed.data.status };
    } else if (parsed.data.action === "set-priority") {
      data = {
        priority: parsed.data.priority,
        priorityRank: messagePriorityRank(parsed.data.priority),
      };
      action = "priority_changed";
      metadata = { to: parsed.data.priority };
    } else if (parsed.data.action === "assign") {
      data = {
        assignedUserId: assignee?.id ?? null,
        assignedTo: assignee?.name ?? null,
      };
      action = assignee ? "assigned" : "unassigned";
      metadata = { assignedUserId: assignee?.id ?? null, assignedTo: assignee?.name ?? null };
    } else if (parsed.data.action === "archive") {
      data = messageArchiveUpdate(true, now);
      action = "archived";
    } else if (parsed.data.action === "restore") {
      data = messageArchiveUpdate(false, now);
      action = "restored";
    }

    await prisma.$transaction([
      prisma.contactMessage.updateMany({ where: { id: { in: ids } }, data }),
      prisma.auditLog.createMany({
        data: ids.map((id) => ({
          actorId: actor.userId,
          actorRole: actor.role,
          action,
          resource: "message",
          resourceId: id,
          metadata,
        })),
      }),
    ]);

    return NextResponse.json({ updated: ids.length });
  } catch (error) {
    if (error instanceof InvalidAssigneeError) {
      return NextResponse.json({ error: "The selected staff member cannot manage messages." }, { status: 400 });
    }
    return adminDataErrorResponse("messages", "bulk-update", error);
  }
}
