import assert from "node:assert/strict";
import test from "node:test";
import { announcementDraftSchema, announcementSchema } from "./announcement";
import { newsArticleDraftSchema, newsArticleSchema } from "./news-article";

const newsDraft = {
  title: "A developing story",
  slug: "a-developing-story",
  language: "en",
  category: "",
  tags: [],
  excerpt: "",
  content: "",
  authorName: "",
  authorRole: null,
  chapter: null,
  featured: false,
  published: false,
  heroImageUrl: null,
  heroImageAlt: null,
  heroImageCaption: null,
};

test("news drafts can be saved with only a title", () => {
  assert.equal(newsArticleDraftSchema.safeParse(newsDraft).success, true);
});

test("news publishing reports missing fields", () => {
  const result = newsArticleSchema.safeParse({ ...newsDraft, published: true });
  assert.equal(result.success, false);
  if (!result.success) assert.deepEqual(Object.keys(result.error.flatten().fieldErrors).sort(), ["authorName", "category", "content", "excerpt"]);
});

test("news accepts a valid external HTTPS image", () => {
  const excerpt = Array.from({ length: 25 }, (_, index) => `word${index}`).join(" ");
  const result = newsArticleSchema.safeParse({ ...newsDraft, published: true, category: "network-news", excerpt, content: "Published article", authorName: "RECCU-CAM", heroImageUrl: "https://cdn.example.com/news.webp" });
  assert.equal(result.success, true);
});

test("announcement drafts can be saved before the opening is complete", () => {
  assert.equal(announcementDraftSchema.safeParse({ title: "Notice", opening: "", details: [], isPublished: false }).success, true);
});

test("announcement publishing reports incomplete copy", () => {
  const result = announcementSchema.safeParse({ title: "Note", opening: "Short", details: [], isPublished: true });
  assert.equal(result.success, false);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    assert.ok(errors.title);
    assert.ok(errors.opening);
  }
});
