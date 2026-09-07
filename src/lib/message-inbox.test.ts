import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  buildMessageOrderBy,
  buildMessageWhere,
  formatMessageReference,
  messageArchiveUpdate,
  messagePriorityRank,
  messageReadUpdate,
  messageStarUpdate,
  newMessageWorkflow,
  parseMessageListQuery,
} from "./message-inbox";
import { bulkMessageSchema, updateMessageSchema } from "./validation/message";
import { AUTH_PERMISSIONS, APP_ROLES, hasPermission } from "./auth/roles";

test("new correspondence starts unread with a stable institutional reference", () => {
  assert.deepEqual(newMessageWorkflow(2026, 123), {
    referenceNumber: "RECCU-MSG-2026-000123",
    status: "new",
    priority: "normal",
    priorityRank: 1,
    isRead: false,
    isStarred: false,
    readAt: null,
  });
  assert.equal(formatMessageReference(2027, 1), "RECCU-MSG-2027-000001");
});

test("opening and manually marking unread produce persisted read timestamps", () => {
  const at = new Date("2026-09-07T08:00:00.000Z");
  assert.deepEqual(messageReadUpdate(true, at), { isRead: true, readAt: at });
  assert.deepEqual(messageReadUpdate(false, at), { isRead: false, readAt: null });
});

test("starring and unstarring produce durable database updates", () => {
  assert.deepEqual(messageStarUpdate(true), { isStarred: true });
  assert.deepEqual(messageStarUpdate(false), { isStarred: false });
});

test("archive is soft and restore returns correspondence to the open workflow", () => {
  const at = new Date("2026-09-07T08:00:00.000Z");
  assert.deepEqual(messageArchiveUpdate(true, at), { archivedAt: at, status: "archived" });
  assert.deepEqual(messageArchiveUpdate(false, at), { archivedAt: null, status: "open" });
});

test("combined inbox filters include body and reference search without exposing archived records", () => {
  const query = parseMessageListQuery(new URLSearchParams({
    q: "RECCU-MSG-2026",
    status: "in-review",
    purpose: "compliance-regulatory",
    priority: "high",
    assignedUserId: "user_123",
    read: "unread",
    dateFrom: "2026-09-01",
    dateTo: "2026-09-07",
  }));
  const where = buildMessageWhere(query, "actor_1");
  assert.equal(where.archivedAt, null);
  assert.equal(where.status, "in-review");
  assert.equal(where.purpose, "compliance-regulatory");
  assert.equal(where.priority, "high");
  assert.equal(where.assignedUserId, "user_123");
  assert.equal(where.isRead, false);
  assert.equal(where.OR?.length, 7);
  assert.ok(where.createdAt && typeof where.createdAt === "object" && "gte" in where.createdAt && "lt" in where.createdAt);
});

test("folder filters support the simple starred inbox and preserve advanced backend queues", () => {
  const starred = buildMessageWhere(parseMessageListQuery(new URLSearchParams({ folder: "starred" })), "actor_1");
  assert.equal(starred.isStarred, true);
  assert.equal(starred.archivedAt, null);
  const needsResponse = buildMessageWhere(parseMessageListQuery(new URLSearchParams({ folder: "needs-response" })), "actor_1");
  assert.deepEqual(needsResponse.status, { in: ["new", "open", "in-review", "awaiting-response"] });
  const assigned = buildMessageWhere(parseMessageListQuery(new URLSearchParams({ folder: "assigned-to-me" })), "actor_1");
  assert.equal(assigned.assignedUserId, "actor_1");
  const unassigned = buildMessageWhere(parseMessageListQuery(new URLSearchParams({ assignedUserId: "__unassigned__" })), "actor_1");
  assert.equal(unassigned.assignedUserId, null);
});

test("sorting is deterministic and priority uses the explicit institutional rank", () => {
  assert.deepEqual(buildMessageOrderBy("newest"), [{ createdAt: "desc" }]);
  assert.deepEqual(buildMessageOrderBy("priority"), [{ priorityRank: "desc" }, { createdAt: "desc" }]);
  assert.deepEqual(["low", "normal", "high", "urgent"].map((value) => messagePriorityRank(value as never)), [0, 1, 2, 3]);
});

test("message lifecycle mutations accept only supported operations", () => {
  assert.equal(updateMessageSchema.safeParse({ action: "set-read", isRead: true }).success, true);
  assert.equal(updateMessageSchema.safeParse({ action: "set-star", isStarred: true }).success, true);
  assert.equal(updateMessageSchema.safeParse({ action: "set-star", isStarred: false }).success, true);
  assert.equal(updateMessageSchema.safeParse({ action: "set-status", status: "awaiting-response" }).success, true);
  assert.equal(updateMessageSchema.safeParse({ action: "set-priority", priority: "urgent" }).success, true);
  assert.equal(updateMessageSchema.safeParse({ action: "mark-responded", responseMethod: "phone" }).success, true);
  assert.equal(updateMessageSchema.safeParse({ action: "add-note", body: "Review completed internally." }).success, true);
  assert.equal(updateMessageSchema.safeParse({ action: "delete" }).success, false);
});

test("bulk actions cap selection and never expose a hard-delete operation", () => {
  assert.equal(bulkMessageSchema.safeParse({ action: "archive", ids: ["message_1"] }).success, true);
  assert.equal(bulkMessageSchema.safeParse({ action: "restore", ids: ["message_1"] }).success, true);
  assert.equal(bulkMessageSchema.safeParse({ action: "set-star", ids: ["message_1"], isStarred: true }).success, true);
  assert.equal(bulkMessageSchema.safeParse({ action: "delete", ids: ["message_1"] }).success, false);
  assert.equal(bulkMessageSchema.safeParse({ action: "mark-read", ids: Array.from({ length: 101 }, (_, index) => `message_${index}`) }).success, false);
});

test("only existing operational message roles receive server-side inbox permission", () => {
  assert.equal(hasPermission(APP_ROLES.superAdmin, AUTH_PERMISSIONS.manageMessages), true);
  assert.equal(hasPermission(APP_ROLES.admin, AUTH_PERMISSIONS.manageMessages), true);
  assert.equal(hasPermission(APP_ROLES.communications, AUTH_PERMISSIONS.manageMessages), true);
  assert.equal(hasPermission(APP_ROLES.editor, AUTH_PERMISSIONS.manageMessages), false);
  assert.equal(hasPermission(APP_ROLES.affiliateUser, AUTH_PERMISSIONS.manageMessages), false);
});

test("internal notes stay behind the protected admin detail boundary", () => {
  const publicContactRoute = readFileSync(path.join(process.cwd(), "src", "app", "api", "contact", "route.ts"), "utf8");
  const adminDetailRoute = readFileSync(path.join(process.cwd(), "src", "app", "api", "admin", "messages", "[id]", "route.ts"), "utf8");
  assert.equal(publicContactRoute.includes("messageNote"), false);
  assert.equal(publicContactRoute.includes("internalNotes"), false);
  assert.match(adminDetailRoute, /getMessageActor\(\)/);
  assert.match(adminDetailRoute, /include: \{ notes:/);
});

test("simplified messages workspace exposes its four folders and resilient states", () => {
  const component = readFileSync(path.join(process.cwd(), "src", "components", "admin", "MessagesInbox.tsx"), "utf8");
  for (const label of ["Inbox", "Unread", "Starred", "Archived"]) assert.match(component, new RegExp(label));
  for (const state of ["No messages yet.", "No unread messages.", "No starred messages.", "No archived messages."]) {
    assert.equal(component.includes(state), true, `${state} must be present`);
  }
  assert.match(component, /Messages could not be loaded\./);
  assert.match(component, /setRefreshKey/);
  assert.match(component, /Loading messages/);
  assert.match(component, /Back to Inbox/);
  for (const removedLabel of ["Needs Response", "Assigned to Me", "High Priority", "By purpose"]) {
    assert.equal(component.includes(removedLabel), false, `${removedLabel} must not appear in the simplified UI`);
  }
});

test("admin dashboard keeps only the simple unread summary and recent correspondence", () => {
  const dashboard = readFileSync(path.join(process.cwd(), "src", "app", "admin", "(dashboard)", "page.tsx"), "utf8");
  for (const label of ["Unread Messages", "Recent Messages", "View Inbox"]) {
    assert.equal(dashboard.includes(label), true, `${label} must be present`);
  }
  assert.equal(dashboard.includes("Needs Response"), false);
  assert.equal(dashboard.includes("High Priority"), false);
});
