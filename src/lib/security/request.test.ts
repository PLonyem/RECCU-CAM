import assert from "node:assert/strict";
import test from "node:test";
import { enforceRateLimit, readBoundedJson } from "./request";

test("readBoundedJson accepts application/json", async () => {
  const result = await readBoundedJson(
    new Request("https://example.test/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "hello" }),
    }),
  );
  assert.equal(result.ok, true);
});

test("readBoundedJson rejects unsupported content types and oversized bodies", async () => {
  const unsupported = await readBoundedJson(
    new Request("https://example.test/api/contact", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "hello",
    }),
  );
  assert.equal(unsupported.ok, false);
  if (!unsupported.ok) assert.equal(unsupported.response.status, 415);

  const oversized = await readBoundedJson(
    new Request("https://example.test/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ value: "x".repeat(50) }),
    }),
    16,
  );
  assert.equal(oversized.ok, false);
  if (!oversized.ok) assert.equal(oversized.response.status, 413);
});

test("enforceRateLimit rejects requests over the configured limit", () => {
  const request = new Request("https://example.test/api/contact", {
    headers: { "x-forwarded-for": "192.0.2.10" },
  });
  const scope = `test-${crypto.randomUUID()}`;
  assert.equal(enforceRateLimit(request, { scope, limit: 1, windowMs: 60_000 }), null);
  assert.equal(
    enforceRateLimit(request, { scope, limit: 1, windowMs: 60_000 })?.status,
    429,
  );
});
