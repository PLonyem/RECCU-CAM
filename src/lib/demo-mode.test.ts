import assert from "node:assert/strict";
import test from "node:test";
import { isDemoAdminPageRequest, isDemoMode } from "./demo-mode";

test("demo mode is fail-closed unless explicitly set to true", () => {
  assert.equal(isDemoMode("true"), true);
  assert.equal(isDemoMode("false"), false);
  assert.equal(isDemoMode("TRUE"), false);
  assert.equal(isDemoMode("1"), false);
  assert.equal(isDemoMode(undefined), false);
});

test("demo access applies only to read-only admin page requests", () => {
  assert.equal(isDemoAdminPageRequest("/admin", "GET", true), true);
  assert.equal(isDemoAdminPageRequest("/admin/messages", "HEAD", true), true);
  assert.equal(isDemoAdminPageRequest("/admin", "POST", true), false);
  assert.equal(isDemoAdminPageRequest("/api/admin/messages", "GET", true), false);
  assert.equal(isDemoAdminPageRequest("/admin", "GET", false), false);
});
