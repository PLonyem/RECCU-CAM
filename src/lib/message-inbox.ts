import type { Prisma } from "@/generated/prisma/client";

export const MESSAGE_STATUSES = [
  "new",
  "open",
  "in-review",
  "awaiting-response",
  "responded",
  "resolved",
  "archived",
] as const;

export const MESSAGE_PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export const MESSAGE_RESPONSE_METHODS = ["email", "phone", "in-person", "other"] as const;
export const MESSAGE_SORTS = ["newest", "oldest", "priority", "unread", "updated"] as const;
export const MESSAGE_FOLDERS = [
  "inbox",
  "unread",
  "needs-response",
  "assigned-to-me",
  "high-priority",
  "resolved",
  "archived",
] as const;

export const NEEDS_RESPONSE_STATUSES = ["new", "open", "in-review", "awaiting-response"] as const;

export type MessageStatus = (typeof MESSAGE_STATUSES)[number];
export type MessagePriority = (typeof MESSAGE_PRIORITIES)[number];
export type MessageResponseMethod = (typeof MESSAGE_RESPONSE_METHODS)[number];
export type MessageSort = (typeof MESSAGE_SORTS)[number];
export type MessageFolder = (typeof MESSAGE_FOLDERS)[number];

export interface MessageListQuery {
  q: string;
  folder: MessageFolder;
  status: MessageStatus | "";
  purpose: string;
  priority: MessagePriority | "";
  assignedUserId: string;
  read: "" | "read" | "unread";
  dateFrom: string;
  dateTo: string;
  sort: MessageSort;
  page: number;
  limit: number;
}

function enumValue<T extends string>(value: string | null, values: readonly T[], fallback: T): T {
  return values.includes(value as T) ? (value as T) : fallback;
}

function optionalEnumValue<T extends string>(value: string | null, values: readonly T[]): T | "" {
  return value && values.includes(value as T) ? (value as T) : "";
}

export function parseMessageListQuery(params: URLSearchParams): MessageListQuery {
  const legacyReadFilter = optionalEnumValue(params.get("status"), ["read", "unread"] as const);
  return {
    q: (params.get("q") ?? "").trim().slice(0, 200),
    folder: enumValue(params.get("folder"), MESSAGE_FOLDERS, "inbox"),
    status: optionalEnumValue(params.get("status"), MESSAGE_STATUSES),
    purpose: (params.get("purpose") ?? "").trim().slice(0, 80),
    priority: optionalEnumValue(params.get("priority"), MESSAGE_PRIORITIES),
    assignedUserId: (params.get("assignedUserId") ?? "").trim().slice(0, 200),
    read: optionalEnumValue(params.get("read"), ["read", "unread"] as const) || legacyReadFilter,
    dateFrom: (params.get("dateFrom") ?? "").trim().slice(0, 10),
    dateTo: (params.get("dateTo") ?? "").trim().slice(0, 10),
    sort: enumValue(params.get("sort"), MESSAGE_SORTS, "newest"),
    page: Math.max(1, Number(params.get("page")) || 1),
    limit: Math.min(100, Math.max(10, Number(params.get("limit")) || 25)),
  };
}

function dateBoundary(value: string, endOfDay = false) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  if (endOfDay) date.setUTCDate(date.getUTCDate() + 1);
  return date;
}

export function buildMessageWhere(query: MessageListQuery, actorUserId: string): Prisma.ContactMessageWhereInput {
  const where: Prisma.ContactMessageWhereInput = {};

  if (query.folder === "archived") where.archivedAt = { not: null };
  else where.archivedAt = null;

  if (query.folder === "unread") where.isRead = false;
  if (query.folder === "needs-response") where.status = { in: [...NEEDS_RESPONSE_STATUSES] };
  if (query.folder === "assigned-to-me") where.assignedUserId = actorUserId;
  if (query.folder === "high-priority") where.priority = { in: ["high", "urgent"] };
  if (query.folder === "resolved") where.status = "resolved";

  if (query.status) where.status = query.status;
  if (query.purpose) where.purpose = query.purpose;
  if (query.priority) where.priority = query.priority;
  if (query.assignedUserId) {
    where.assignedUserId = query.assignedUserId === "__unassigned__" ? null : query.assignedUserId;
  }
  if (query.read) where.isRead = query.read === "read";

  const from = dateBoundary(query.dateFrom);
  const to = dateBoundary(query.dateTo, true);
  if (from || to) where.createdAt = { ...(from ? { gte: from } : {}), ...(to ? { lt: to } : {}) };

  if (query.q) {
    const contains = { contains: query.q, mode: "insensitive" as const };
    where.OR = [
      { name: contains },
      { organization: contains },
      { email: contains },
      { phone: contains },
      { subject: contains },
      { message: contains },
      { referenceNumber: contains },
    ];
  }

  return where;
}

export function buildMessageOrderBy(sort: MessageSort): Prisma.ContactMessageOrderByWithRelationInput[] {
  if (sort === "oldest") return [{ createdAt: "asc" }];
  if (sort === "updated") return [{ updatedAt: "desc" }, { createdAt: "desc" }];
  if (sort === "unread") return [{ isRead: "asc" }, { createdAt: "desc" }];
  if (sort === "priority") return [{ priorityRank: "desc" }, { createdAt: "desc" }];
  return [{ createdAt: "desc" }];
}

export function formatMessageReference(year: number, sequence: number) {
  return `RECCU-MSG-${year}-${String(sequence).padStart(6, "0")}`;
}

export function isMessageStatus(value: unknown): value is MessageStatus {
  return MESSAGE_STATUSES.includes(value as MessageStatus);
}

export function isMessagePriority(value: unknown): value is MessagePriority {
  return MESSAGE_PRIORITIES.includes(value as MessagePriority);
}

export function messagePriorityRank(priority: MessagePriority) {
  return { low: 0, normal: 1, high: 2, urgent: 3 }[priority];
}

export function newMessageWorkflow(year: number, sequence: number) {
  return {
    referenceNumber: formatMessageReference(year, sequence),
    status: "new" as const,
    priority: "normal" as const,
    priorityRank: messagePriorityRank("normal"),
    isRead: false,
    readAt: null,
  };
}

export function messageReadUpdate(isRead: boolean, at: Date) {
  return { isRead, readAt: isRead ? at : null };
}

export function messageArchiveUpdate(archived: boolean, at: Date) {
  return archived
    ? { archivedAt: at, status: "archived" as const }
    : { archivedAt: null, status: "open" as const };
}

export function isNeedsResponse(status: string) {
  return NEEDS_RESPONSE_STATUSES.includes(status as (typeof NEEDS_RESPONSE_STATUSES)[number]);
}
