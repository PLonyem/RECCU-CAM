import assert from "node:assert/strict";
import test from "node:test";
import { classifyAdminDataError } from "./admin-data-errors";

test("database connection failures are retriable without exposing their message", () => {
  const details = classifyAdminDataError({
    code: "P1001",
    message: "Can't reach database server at a sensitive hostname",
  });

  assert.deepEqual(details, { category: "connection", code: "P1001", status: 503 });
  assert.equal("message" in details, false);
});

test("missing tables are classified as retriable schema failures", () => {
  assert.deepEqual(classifyAdminDataError({ code: "P2021" }), {
    category: "schema",
    code: "P2021",
    status: 503,
  });
});

test("unexpected failures remain generic server errors", () => {
  assert.deepEqual(classifyAdminDataError(new Error("internal detail")), {
    category: "unknown",
    code: null,
    status: 500,
  });
});
