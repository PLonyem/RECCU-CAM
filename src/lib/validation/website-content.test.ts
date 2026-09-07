import assert from "node:assert/strict";
import test from "node:test";
import {
  homepageSectionStatus,
  homepageSectionsDraftSchema,
  homepageSectionsPublishSchema,
  organizationSettingsSchema,
} from "./website-content";
import { defaultHomepageSections } from "@/data/homepage-cms";

test("homepage section drafts accept incomplete and multiline content", () => {
  const result = homepageSectionsDraftSchema.safeParse({
    ...defaultHomepageSections,
    whoTitle: "Work in progress",
    missionBody: "First line\nSecond line",
    contactTitle: "",
    contactDescription: "",
    contactButtonText: "",
  });
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.missionBody, "First line\nSecond line");
});

test("homepage section publishing reports missing fields individually", () => {
  const result = homepageSectionsPublishSchema.safeParse({ ...defaultHomepageSections, missionTitle: "", contactButtonText: "" });
  assert.equal(result.success, false);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    assert.equal(errors.missionTitle?.[0], "Mission title is required before publishing.");
    assert.equal(errors.contactButtonText?.[0], "Contact button text is required before publishing.");
  }
});

test("homepage section publish status matches the public query", () => {
  assert.equal(homepageSectionStatus("draft"), "draft");
  assert.equal(homepageSectionStatus("publish"), "published");
});

test("organization settings normalize blank optional contact fields", () => {
  const result = organizationSettingsSchema.safeParse({
    siteName: "RECCU-CAM",
    fullName: "Union of Renaissance Cooperative Credit Unions",
    address: "Bamenda, Cameroon",
    addressSecondary: "   ",
    phone: "",
    email: "",
    officeHours: "",
    facebookUrl: "",
    linkedinUrl: "",
    twitterUrl: "",
  });
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.addressSecondary, "");
});

test("organization settings return field errors for invalid public links", () => {
  const result = organizationSettingsSchema.safeParse({
    siteName: "RECCU-CAM",
    fullName: "Union of Renaissance Cooperative Credit Unions",
    address: "Bamenda, Cameroon",
    addressSecondary: "",
    phone: "",
    email: "not-an-email",
    officeHours: "",
    facebookUrl: "facebook.com/reccucam",
    linkedinUrl: "",
    twitterUrl: "",
  });
  assert.equal(result.success, false);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    assert.equal(errors.email?.[0], "Enter a valid email address.");
    assert.equal(errors.facebookUrl?.[0], "Enter a valid URL.");
  }
});
