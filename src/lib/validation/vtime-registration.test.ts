import assert from "node:assert/strict";
import test from "node:test";
import { vtimeRegistrationSchema } from "./vtime-registration";

const validRegistration = {
  participantName: "Alice Nfor",
  institution: "Demonstration Cooperative",
  role: "Operations Manager",
  program: "cooperative-governance-foundations",
  phone: "+237 600 000 000",
  email: "alice@example.org",
  notes: "Please share the confirmed cohort details when available.",
};

test("accepts a complete VTIME registration", () => {
  assert.equal(vtimeRegistrationSchema.safeParse(validRegistration).success, true);
});

test("rejects an unknown program and incomplete participant details", () => {
  const result = vtimeRegistrationSchema.safeParse({
    ...validRegistration,
    participantName: "",
    program: "invented-program",
  });
  assert.equal(result.success, false);
});

test("rejects credentials in registration notes", () => {
  const result = vtimeRegistrationSchema.safeParse({
    ...validRegistration,
    notes: "My banking PIN is 1234.",
  });
  assert.equal(result.success, false);
});
