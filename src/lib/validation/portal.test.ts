import assert from "node:assert/strict";
import test from "node:test";
import { affiliateUpdateRequestSchema, supportTicketSchema } from "./portal";

test("affiliate update requests reject unsafe or malformed links", () => {
  assert.equal(affiliateUpdateRequestSchema.safeParse({ website: "javascript:alert(1)" }).success, false);
  assert.equal(affiliateUpdateRequestSchema.safeParse({ website: "https://example.org" }).success, true);
});

test("support tickets enforce known categories and useful detail", () => {
  assert.equal(supportTicketSchema.safeParse({ subject: "Help", category: "technical", message: "A detailed description of the portal issue.", priority: "normal" }).success, true);
  assert.equal(supportTicketSchema.safeParse({ subject: "Help", category: "payments", message: "A detailed description of the portal issue.", priority: "normal" }).success, false);
});
