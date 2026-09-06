import assert from "node:assert/strict";
import test from "node:test";
import { mapPublicAffiliate, mapPublicNewsArticle, mapPublicTrainingProgram } from "./public-content-mappers";

const createdAt = new Date("2026-09-01T12:00:00.000Z");

test("maps an approved database affiliate into the public directory shape", () => {
  const affiliate = mapPublicAffiliate({
    id: "affiliate-1", code: "NW CU 01", name: "Example", region: "Northwest", city: "Bamenda",
    address: null, phone: null, email: null, website: null, logoUrl: null, description: null,
    services: [], createdAt, updatedAt: createdAt,
  });
  assert.equal(affiliate.slug, "nw-cu-01");
  assert.equal(affiliate.dataClassification, "database-managed");
  assert.equal(affiliate.region, "north-west");
});

test("does not map a news draft without a publication date", () => {
  assert.equal(mapPublicNewsArticle({
    id: "news-1", slug: "draft", title: "Draft", excerpt: "Summary", content: "Body",
    category: "Institutional", publishedAt: null, updatedAt: createdAt, authorName: "Editor", featured: false,
  }), null);
});

test("maps a published programme into the public VTIME shape", () => {
  const programme = mapPublicTrainingProgram({
    id: "programme-1", slug: "governance", title: "Governance", summary: "Summary",
    category: "Governance", audience: ["affiliates"], level: "Foundational", format: "In person",
    venue: "Training centre", startDate: createdAt, endDate: null, capacity: 40,
    registrationStatus: "registration-open",
  });
  assert.equal(programme.location, "Training centre");
  assert.equal(programme.startDate, "2026-09-01");
  assert.equal(programme.capacity, 40);
});
