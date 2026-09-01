import assert from "node:assert/strict";
import test from "node:test";
import {
  filterTrainingPrograms,
  getTrainingAudienceOptions,
  getTrainingProgramBySlug,
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

test("searches programs across titles, categories, audiences, and modules", () => {
  assert.deepEqual(
    filterTrainingPrograms(trainingPrograms, { query: "reconciliation" }).map(
      (program) => program.slug,
    ),
    ["microfinance-accounting-essentials"],
  );
  assert.deepEqual(
    filterTrainingPrograms(trainingPrograms, { query: "credit teams" }).map(
      (program) => program.slug,
    ),
    ["responsible-credit-practice"],
  );
});

test("combines category, audience, level, format, and date filters", () => {
  assert.deepEqual(
    filterTrainingPrograms(trainingPrograms, {
      category: "governance-leadership",
      audience: "Board members",
      level: "foundation",
      date: "pending",
    }).map((program) => program.slug),
    ["cooperative-governance-foundations"],
  );
  assert.equal(filterTrainingPrograms(trainingPrograms, { format: "online" }).length, 0);
  assert.equal(filterTrainingPrograms(trainingPrograms, { date: "scheduled" }).length, 0);
});

test("derives audience options and resolves programs by slug", () => {
  const audiences = getTrainingAudienceOptions();
  assert.ok(audiences.includes("Institutional managers"));
  assert.deepEqual(audiences, [...audiences].sort((a, b) => a.localeCompare(b)));
  assert.equal(
    getTrainingProgramBySlug("internal-control-foundations")?.title,
    "Internal Control Foundations",
  );
  assert.equal(getTrainingProgramBySlug("missing-program"), undefined);
});
