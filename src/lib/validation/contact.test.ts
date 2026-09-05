import assert from "node:assert/strict";
import test from "node:test";
import { contactPurposeOptions, getContactPurpose } from "@/data/contact";
import { contactInquirySchema, normalizeContactPhone } from "./contact";

const validInquiry = {
  companyWebsite: "",
  fullName: "Alice Nfor",
  phone: "+237 600 000 000",
  email: "alice@example.org",
  organization: "Demonstration Cooperative",
  role: "Branch Manager",
  purpose: "affiliate-support",
  subject: "Support with institutional reporting",
  message: "Please direct this inquiry to the team responsible for affiliate reporting guidance.",
  consent: true,
};

test("accepts a complete contact inquiry", () => {
  assert.equal(contactInquirySchema.safeParse(validInquiry).success, true);
});

test("accepts a contact inquiry without optional email, organization, or role", () => {
  const result = contactInquirySchema.safeParse({
    companyWebsite: "",
    fullName: "Alice Nfor",
    phone: "+237 600 000 000",
    purpose: "general-inquiry",
    subject: "Request for general information",
    message: "Please direct me to the team responsible for general institutional information.",
    consent: true,
  });
  assert.equal(result.success, true);
});

test("validates all required contact fields", () => {
  for (const field of ["fullName", "phone", "purpose", "subject", "message"] as const) {
    const result = contactInquirySchema.safeParse({ ...validInquiry, [field]: "" });
    assert.equal(result.success, false, `${field} should be required`);
  }
});

test("rejects an invalid optional email", () => {
  assert.equal(contactInquirySchema.safeParse({ ...validInquiry, email: "not-an-email" }).success, false);
});

test("rejects missing consent", () => {
  assert.equal(contactInquirySchema.safeParse({ ...validInquiry, consent: false }).success, false);
});

test("rejects short messages and sensitive credentials", () => {
  assert.equal(contactInquirySchema.safeParse({ ...validInquiry, message: "Too short" }).success, false);
  assert.equal(
    contactInquirySchema.safeParse({
      ...validInquiry,
      message: "Please help me recover my banking PIN before I submit the report.",
    }).success,
    false,
  );
});

test("accepts flexible international phone formatting and normalizes separators", () => {
  assert.equal(contactInquirySchema.safeParse({ ...validInquiry, phone: "+44 (0) 20-7946-0958" }).success, true);
  assert.equal(normalizeContactPhone("+237 6-00 000 000"), "+237600000000");
});

test("rejects invalid phone numbers", () => {
  assert.equal(contactInquirySchema.safeParse({ ...validInquiry, phone: "call-me" }).success, false);
  assert.equal(contactInquirySchema.safeParse({ ...validInquiry, phone: "123" }).success, false);
});

test("rejects a filled anti-spam field", () => {
  assert.equal(
    contactInquirySchema.safeParse({ ...validInquiry, companyWebsite: "https://spam.example" }).success,
    false,
  );
});

test("maps every contact purpose to a routing department", () => {
  for (const option of contactPurposeOptions) {
    assert.equal(getContactPurpose(option.value).department, option.department);
  }
});
