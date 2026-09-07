import { NextRequest, NextResponse } from "next/server";
import { adminDataErrorResponse } from "@/lib/admin-data-server";
import { getMessageActor } from "@/lib/message-auth";
import { buildMessageOrderBy, buildMessageWhere, parseMessageListQuery } from "@/lib/message-inbox";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function csvCell(value: string | null | Date) {
  const text = value instanceof Date ? value.toISOString() : value ?? "";
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: NextRequest) {
  const actor = await getMessageActor();
  if (!actor.ok) {
    return NextResponse.json(
      { error: actor.status === 401 ? "Unauthorized" : "Forbidden" },
      { status: actor.status },
    );
  }

  const query = parseMessageListQuery(request.nextUrl.searchParams);

  try {
    const messages = await prisma.contactMessage.findMany({
      where: buildMessageWhere(query, actor.userId),
      orderBy: buildMessageOrderBy(query.sort),
      take: 5000,
      select: {
        referenceNumber: true,
        name: true,
        organization: true,
        role: true,
        email: true,
        phone: true,
        purpose: true,
        department: true,
        subject: true,
        message: true,
        status: true,
        priority: true,
        isRead: true,
        assignedTo: true,
        responseMethod: true,
        respondedAt: true,
        responseDueAt: true,
        createdAt: true,
      },
    });

    const header = [
      "Reference", "Sender", "Organization", "Role", "Email", "Phone", "Purpose",
      "Department", "Subject", "Message", "Status", "Priority", "Read", "Assigned to",
      "Response method", "Responded at", "Response target", "Submitted at",
    ].map(csvCell).join(",");
    const rows = messages.map((message) => [
      message.referenceNumber,
      message.name,
      message.organization,
      message.role,
      message.email,
      message.phone,
      message.purpose,
      message.department,
      message.subject,
      message.message,
      message.status,
      message.priority,
      message.isRead ? "Yes" : "No",
      message.assignedTo,
      message.responseMethod,
      message.respondedAt,
      message.responseDueAt,
      message.createdAt,
    ].map(csvCell).join(","));

    await prisma.auditLog.create({
      data: {
        actorId: actor.userId,
        actorRole: actor.role,
        action: "messages_exported",
        resource: "message_export",
        metadata: { count: messages.length },
      },
    });

    return new NextResponse([header, ...rows].join("\r\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="reccu-cam-messages-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch (error) {
    return adminDataErrorResponse("messages", "export", error);
  }
}
