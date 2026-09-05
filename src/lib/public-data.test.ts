import assert from "node:assert/strict";
import test from "node:test";
import { readPublicData } from "./public-data";

test("returns public data when its query succeeds", async () => {
  const result = await readPublicData("test content", () => Promise.resolve({ title: "Published" }), null);

  assert.deepEqual(result, { title: "Published" });
});

test("uses a safe fallback and reports only the database error code", async () => {
  const reports: string[] = [];
  const databaseError = Object.assign(new Error("postgres://user:secret@example.invalid/database"), {
    code: "P2021",
  });

  const result = await readPublicData(
    "test content",
    () => Promise.reject(databaseError),
    [],
    (message) => reports.push(message),
  );

  assert.deepEqual(result, []);
  assert.deepEqual(reports, ["[public-data] test content unavailable (P2021); using fallback."]);
  assert.equal(reports[0]?.includes("secret"), false);
});
