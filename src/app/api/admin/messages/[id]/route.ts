import { NextRequest, NextResponse } from "next/server";
import { adminDataErrorResponse } from "@/lib/admin-data-server";
import { getMessageActor } from "@/lib/message-auth";
import { messageArchiveUpdate, messagePriorityRank, messageReadUpdate, messageStarUpdate } from "@/lib/message-inbox";
import { prisma } from "@/lib/prisma";
import { resolveMessageAssignee } from "@/lib/message-service";
import { updateMessageSchema } from "@/lib/validation/message";
import type { Prisma } from "@/generated/prisma/client";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

function denied(status: 401 | 403) {
  return NextResponse.json(
    { error: status === 401 ? "Unauthorized" : "Forbidden" },
    { status },
  );
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const actor = await getMessageActor();
  if (!actor.ok) return denied(actor.status);
  const { id } = await params;

  try {
    const [message, activity] = await Promise.all([
      prisma.contactMessage.findUnique({
        where: { id },
        omit: { internalNotes: true, priorityRank: true },
        include: { notes: { orderBy: { createdAt: "desc" } } },
      }),
      prisma.auditLog.findMany({
        where: { resource: "message", resourceId: id },
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
          id: true,
          actorId: true,
          actorRole: true,
          action: true,
          metadata: true,
          createdAt: true,
        },
      }),
    ]);

    if (!message) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ message, activity });
  } catch (error) {
    return adminDataErrorResponse("messages", "detail", error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const actor = await getMessageActor();
  if (!actor.ok) return denied(actor.status);
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const existing = await prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const now = new Date();
    const resolvedAssignee = parsed.data.action === "assign" && parsed.data.assignedUserId
      ? await resolveMessageAssignee(parsed.data.assignedUserId)
      : null;
    if (parsed.data.action === "assign" && parsed.data.assignedUserId && !resolvedAssignee) {
      throw new InvalidAssigneeError();
    }

    let action: string = parsed.data.action;
    let metadata: Record<string, string | boolean | null> = {};

    const message = await prisma.$transaction(async (tx) => {
      if (parsed.data.action === "add-note") {
        await tx.messageNote.create({
          data: { messageId: id, authorUserId: actor.userId, body: parsed.data.body },
        });
        metadata = { noteAdded: true };
        action = "internal_note_added";
      }

      let data: Prisma.ContactMessageUpdateInput = {};
      if (parsed.data.action === "set-read") {
        data = messageReadUpdate(parsed.data.isRead, now);
        action = parsed.data.isRead ? "marked_read" : "marked_unread";
        metadata = { isRead: parsed.data.isRead };
      } else if (parsed.data.action === "set-star") {
        data = messageStarUpdate(parsed.data.isStarred);
        action = parsed.data.isStarred ? "starred" : "unstarred";
        metadata = { isStarred: parsed.data.isStarred };
      } else if (parsed.data.action === "set-status") {
        data = {
          status: parsed.data.status,
          archivedAt: parsed.data.status === "archived"
            ? now
            : existing.status === "archived" ? null : existing.archivedAt,
        };
        action = "status_changed";
        metadata = { from: existing.status, to: parsed.data.status };
      } else if (parsed.data.action === "set-priority") {
        data = {
          priority: parsed.data.priority,
          priorityRank: messagePriorityRank(parsed.data.priority),
        };
        action = "priority_changed";
        metadata = { from: existing.priority, to: parsed.data.priority };
      } else if (parsed.data.action === "assign") {
        data = {
          assignedUserId: resolvedAssignee?.id ?? null,
          assignedTo: resolvedAssignee?.name ?? null,
        };
        action = resolvedAssignee ? "assigned" : "unassigned";
        metadata = { assignedUserId: resolvedAssignee?.id ?? null, assignedTo: resolvedAssignee?.name ?? null };
      } else if (parsed.data.action === "archive") {
        data = messageArchiveUpdate(parsed.data.archived, now);
        action = parsed.data.archived ? "archived" : "restored";
        metadata = { archived: parsed.data.archived };
      } else if (parsed.data.action === "mark-responded") {
        data = {
          status: "responded",
          respondedAt: now,
          respondedBy: actor.userId,
          responseMethod: parsed.data.responseMethod,
          responseNote: parsed.data.responseNote || null,
        };
        action = "marked_responded";
        metadata = { responseMethod: parsed.data.responseMethod };
      }

      const updated = await tx.contactMessage.update({ where: { id }, data });
      await tx.auditLog.create({
        data: {
          actorId: actor.userId,
          actorRole: actor.role,
          action,
          resource: "message",
          resourceId: id,
          metadata,
        },
      });
      return updated;
    });

    return NextResponse.json({ message });
  } catch (error) {
    if (error instanceof InvalidAssigneeError) {
      return NextResponse.json({ error: "The selected staff member cannot manage messages." }, { status: 400 });
    }
    return adminDataErrorResponse("messages", "update", error);
  }
}

class InvalidAssigneeError extends Error {}
