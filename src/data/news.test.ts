import assert from "node:assert/strict";
import test from "node:test";
import {
  getNewsCategory,
  newsCategories,
  newsCategorySlugs,
  publishedNewsArticles,
  publishedNewsEvents,
} from "./news";

test("publishes the complete newsroom category taxonomy", () => {
  assert.deepEqual(
    newsCategories.map((category) => category.slug),
    [...newsCategorySlugs],
  );
  assert.deepEqual(
    newsCategories.map((category) => category.label),
    ["Network News", "Training", "AGMs", "Affiliate Updates", "Partnerships", "Announcements"],
  );
});

test("resolves a newsroom category by slug", () => {
  assert.equal(getNewsCategory("affiliate-updates")?.label, "Affiliate Updates");
});

test("does not publish unverified articles or event dates", () => {
  assert.equal(publishedNewsArticles.length, 0);
  assert.equal(publishedNewsEvents.length, 0);
});
