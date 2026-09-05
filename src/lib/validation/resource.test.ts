import assert from "node:assert/strict";
import test from "node:test";
import { resourceSchema } from "./resource";

test("knowledge documents use explicit server-validated access levels", () => {
  const base = { title: "Governance guide", category: "Governance", fileUrl: "https://example.org/guide.pdf" };
  assert.equal(resourceSchema.safeParse({ ...base, accessLevel: "AFFILIATE_ONLY", published: true }).success, true);
  assert.equal(resourceSchema.safeParse({ ...base, accessLevel: "EVERYONE", published: true }).success, false);
  assert.equal(resourceSchema.safeParse({ ...base, fileUrl: "javascript:alert(1)" }).success, false);
});
