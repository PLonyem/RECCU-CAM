import { z } from "zod";
import {
  MESSAGE_PRIORITIES,
  MESSAGE_RESPONSE_METHODS,
  MESSAGE_STATUSES,
} from "@/lib/message-inbox";

const messageId = z.string().trim().min(1).max(200);

export const updateMessageSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("set-read"), isRead: z.boolean() }).strict(),
  z.object({ action: z.literal("set-status"), status: z.enum(MESSAGE_STATUSES) }).strict(),
  z.object({ action: z.literal("set-priority"), priority: z.enum(MESSAGE_PRIORITIES) }).strict(),
  z.object({ action: z.literal("assign"), assignedUserId: z.string().trim().max(200).nullable() }).strict(),
  z.object({ action: z.literal("archive"), archived: z.boolean() }).strict(),
  z.object({
    action: z.literal("mark-responded"),
    responseMethod: z.enum(MESSAGE_RESPONSE_METHODS),
    responseNote: z.string().trim().max(2000).optional(),
  }).strict(),
  z.object({ action: z.literal("add-note"), body: z.string().trim().min(2).max(4000) }).strict(),
]);

export const bulkMessageSchema = z.discriminatedUnion("action", [
  z.object({ action: z.enum(["mark-read", "mark-unread"]), ids: z.array(messageId).min(1).max(100) }).strict(),
  z.object({ action: z.literal("set-status"), ids: z.array(messageId).min(1).max(100), status: z.enum(MESSAGE_STATUSES) }).strict(),
  z.object({ action: z.literal("set-priority"), ids: z.array(messageId).min(1).max(100), priority: z.enum(MESSAGE_PRIORITIES) }).strict(),
  z.object({ action: z.literal("assign"), ids: z.array(messageId).min(1).max(100), assignedUserId: z.string().trim().max(200).nullable() }).strict(),
  z.object({ action: z.enum(["archive", "restore"]), ids: z.array(messageId).min(1).max(100) }).strict(),
  z.object({ action: z.literal("mark-all-read") }).strict(),
]);
