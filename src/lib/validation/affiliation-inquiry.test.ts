import assert from "node:assert/strict";
import test from "node:test";
import { affiliationInquirySchema } from "./affiliation-inquiry";

const validInquiry = {
  institution: "Demonstration Cooperative",
  city: "Bamenda",
  contactPerson: "Test Contact",
  role: "Operations Manager",
  email: "contact@example.org",
  phone: "+237 600 000 000",
  message: "We would like to understand the verified affiliation pathway and requirements.",
};

test("accepts a complete affiliation inquiry", () => {
  assert.equal(affiliationInquirySchema.safeParse(validInquiry).success, true);
});
test("rejects incomplete affiliation inquiry fields", () => {
  const result = affiliationInquirySchema.safeParse({
    ...validInquiry,
    institution: "",
    email: "invalid",
    message: "Too short",
  });
  assert.equal(result.success, false);
});

test("rejects a filled anti-spam field", () => {
  const result = affiliationInquirySchema.safeParse({
    ...validInquiry,
    companyWebsite: "https://spam.example",
  });
  assert.equal(result.success, false);
});
