import assert from "node:assert/strict";
import test from "node:test";
import { isDemoAdminPageRequest, isDemoMode } from "./demo-mode";

test("demo mode is fail-closed unless explicitly set to true", () => {
  assert.equal(isDemoMode("true", "development"), true);
  assert.equal(isDemoMode("false", "development"), false);
  assert.equal(isDemoMode("TRUE", "development"), false);
  assert.equal(isDemoMode("1", "development"), false);
  assert.equal(isDemoMode(undefined, "development"), false);
});

test("demo mode cannot be enabled in a production build", () => {
  assert.equal(isDemoMode("true", "production"), false);
  assert.equal(isDemoMode("true", "test"), false);
});

test("demo access applies only to read-only admin page requests", () => {
  assert.equal(isDemoAdminPageRequest("/admin", "GET", true), true);
  assert.equal(isDemoAdminPageRequest("/admin/messages", "HEAD", true), true);
  assert.equal(isDemoAdminPageRequest("/admin", "POST", true), false);
  assert.equal(isDemoAdminPageRequest("/api/admin/messages", "GET", true), false);
  assert.equal(isDemoAdminPageRequest("/admin", "GET", false), false);
});
