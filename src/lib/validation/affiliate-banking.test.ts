import assert from "node:assert/strict";
import test from "node:test";
import { affiliateBankingInquirySchema } from "./affiliate-banking";

const validInquiry = {
  institution: "Demo Cooperative Credit Union",
  affiliateStatus: "current-affiliate",
  contactPerson: "Test Contact",
  role: "Operations Manager",
  email: "contact@example.com",
  phone: "+237 600 000 000",
  city: "Bamenda",
  supportCategory: "institutional-liquidity",
  message: "We would like to discuss an institutional liquidity requirement.",
} as const;

test("accepts a complete affiliate banking inquiry", () => {
  assert.equal(affiliateBankingInquirySchema.safeParse(validInquiry).success, true);
});

test("rejects incomplete inquiry fields", () => {
  const parsed = affiliateBankingInquirySchema.safeParse({
    ...validInquiry,
    institution: "",
    email: "not-an-email",
    message: "Too short",
  });
  assert.equal(parsed.success, false);
});

test("rejects messages containing credentials", () => {
  const parsed = affiliateBankingInquirySchema.safeParse({
    ...validInquiry,
    message: "Our banking credential and password are included for your review.",
  });
  assert.equal(parsed.success, false);
});
