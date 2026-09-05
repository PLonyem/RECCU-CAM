import assert from "node:assert/strict";
import test from "node:test";
import { defaultHomepageSections, parseHomepageSections } from "./homepage-cms";

test("homepage CMS falls back safely when persisted JSON is malformed", () => {
  assert.deepEqual(parseHomepageSections(null), defaultHomepageSections);
  assert.equal(parseHomepageSections({ whoTitle: "Updated", values: "bad" }).whoTitle, "Updated");
  assert.deepEqual(parseHomepageSections({ values: "bad" }).values, defaultHomepageSections.values);
});

test("homepage CMS accepts only value objects with plain text fields", () => {
  const result = parseHomepageSections({ values: [{ title: "Trust", description: "Act consistently." }, null, { title: 4, description: "bad" }] });
  assert.deepEqual(result.values, [{ title: "Trust", description: "Act consistently." }]);
});
