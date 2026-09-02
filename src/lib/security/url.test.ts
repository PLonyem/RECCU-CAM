import assert from "node:assert/strict";
import test from "node:test";
import { isHttpsUrl, isSafeInternalPath } from "@/lib/validation/url";

test("internal redirects reject protocol-relative and backslash paths", () => {
  assert.equal(isSafeInternalPath("/network/affiliates"), true);
  assert.equal(isSafeInternalPath("//example.com"), false);
  assert.equal(isSafeInternalPath("/\\example.com"), false);
});

test("external content URLs require HTTPS and no embedded credentials", () => {
  assert.equal(isHttpsUrl("https://example.com/resource.pdf"), true);
  assert.equal(isHttpsUrl("http://example.com/resource.pdf"), false);
  assert.equal(isHttpsUrl("https://user:secret@example.com/resource.pdf"), false);
  assert.equal(isHttpsUrl("javascript:alert(1)"), false);
});
