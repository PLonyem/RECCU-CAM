import assert from "node:assert/strict";
import test from "node:test";
import { requestAdminData } from "./admin-data-client";

test("successful empty admin data remains a successful empty response", async () => {
  const result = await requestAdminData<unknown[]>("/api/admin/test", undefined, async () =>
    Response.json([], { status: 200 }),
  );

  assert.deepEqual(result, { ok: true, data: [], status: 200 });
});

test("database API failures settle as a recoverable result", async () => {
  const result = await requestAdminData("/api/admin/test", undefined, async () =>
    Response.json({ error: "sensitive server detail" }, { status: 503 }),
  );

  assert.deepEqual(result, {
    ok: false,
    message: "Unable to load this section. Please retry.",
    status: 503,
  });
  assert.equal(result.ok ? "" : result.message.includes("sensitive"), false);
});

test("network rejection settles instead of leaving loading unresolved", async () => {
  const outcome = await Promise.race([
    requestAdminData("/api/admin/test", undefined, async () => {
      throw new Error("network failure");
    }),
    new Promise<"timeout">((resolve) => setTimeout(() => resolve("timeout"), 100)),
  ]);

  assert.notEqual(outcome, "timeout");
  assert.deepEqual(outcome, {
    ok: false,
    message: "Unable to load this section. Please retry.",
    status: null,
  });
});

test("authorization failures remain distinguishable without exposing claims", async () => {
  const unauthenticated = await requestAdminData("/api/admin/test", undefined, async () =>
    Response.json({ error: "Unauthorized" }, { status: 401 }),
  );
  const forbidden = await requestAdminData("/api/admin/test", undefined, async () =>
    Response.json({ error: "Forbidden" }, { status: 403 }),
  );

  assert.equal(unauthenticated.ok ? 200 : unauthenticated.status, 401);
  assert.equal(forbidden.ok ? 200 : forbidden.status, 403);
});
