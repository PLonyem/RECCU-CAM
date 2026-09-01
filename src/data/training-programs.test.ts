import assert from "node:assert/strict";
import test from "node:test";
import {
  publishedTrainingEvents,
  trainingCategories,
  trainingCategorySlugs,
  trainingPrograms,
} from "./training-programs";

test("publishes the complete VTIME category taxonomy", () => {
  assert.equal(trainingCategories.length, 10);
  assert.deepEqual(
    trainingCategories.map((category) => category.slug),
    [...trainingCategorySlugs],
  );
});

test("keeps category and program identifiers unique", () => {
  const categoryIds = trainingCategories.map((category) => category.id);
  const programIds = trainingPrograms.map((program) => program.id);
  const programSlugs = trainingPrograms.map((program) => program.slug);

  assert.equal(new Set(categoryIds).size, categoryIds.length);
  assert.equal(new Set(programIds).size, programIds.length);
  assert.equal(new Set(programSlugs).size, programSlugs.length);
});

test("does not treat curriculum previews as scheduled events", () => {
  assert.equal(publishedTrainingEvents.length, 0);

  for (const program of trainingPrograms) {
    assert.equal(program.startDate, null);
    assert.equal(program.endDate, null);
    assert.equal(program.facilitator, null);
    assert.equal(program.registrationStatus, "schedule-pending");
  }
});
