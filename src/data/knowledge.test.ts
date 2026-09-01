import assert from "node:assert/strict";
import test from "node:test";
import {
  filterKnowledgeDocuments,
  getKnowledgeFilterOptions,
  getPublicKnowledgeDocumentBySlug,
  knowledgeCategories,
  knowledgeCategorySlugs,
  knowledgeDocuments,
  publicKnowledgeDocuments,
} from "./knowledge";

test("publishes the complete knowledge category taxonomy", () => {
  assert.equal(knowledgeCategories.length, 13);
  assert.deepEqual(
    knowledgeCategories.map((category) => category.slug),
    [...knowledgeCategorySlugs],
  );
});

test("exposes only public source-backed records", () => {
  assert.ok(publicKnowledgeDocuments.length > 0);
  assert.ok(publicKnowledgeDocuments.every((document) => document.accessLevel === "public"));
  assert.ok(publicKnowledgeDocuments.every((document) => document.fileUrl));
  assert.equal(publicKnowledgeDocuments.length, knowledgeDocuments.length);
});

test("searches and combines knowledge filters", () => {
  const results = filterKnowledgeDocuments(publicKnowledgeDocuments, {
    query: "microfinance institutions",
    category: "minfi-notices",
    issuingAuthority: "Ministry of Finance, Cameroon",
    documentType: "Web Resource",
    accessLevel: "public",
  });
  assert.deepEqual(results.map((document) => document.slug), [
    "minfi-approved-microfinance-institutions-2021",
  ]);
  assert.equal(
    filterKnowledgeDocuments(publicKnowledgeDocuments, { accessLevel: "affiliate-only" }).length,
    0,
  );
});

test("derives verified filter options without inventing a year", () => {
  const options = getKnowledgeFilterOptions();
  assert.deepEqual(options.authorities, ["Ministry of Finance, Cameroon"]);
  assert.deepEqual(options.documentTypes, ["Web Resource"]);
  assert.deepEqual(options.years, []);
});

test("resolves only a public document slug", () => {
  assert.equal(
    getPublicKnowledgeDocumentBySlug("minfi-approved-microfinance-institutions-2021")?.id,
    "minfi-emf-list-2021",
  );
  assert.equal(getPublicKnowledgeDocumentBySlug("restricted-example"), undefined);
});
