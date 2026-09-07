import assert from "node:assert/strict";
import test from "node:test";
import { processHomepageSave } from "@/lib/homepage-content-save";
import {
  HOMEPAGE_CONTENT_LIMITS,
  validateHomepageContent,
  type HomepageContentInput,
} from "./homepage-content";
import { publicAppearanceStyle, RECCUCAM_GREEN_APPEARANCE } from "@/lib/public-appearance";
import { heroGradientAngle } from "@/lib/utils";

const validHomepage: HomepageContentInput = {
  heroBadge: "RECCU-CAM LTD",
  heroTitle: "Cooperation that moves communities forward.\nTaking Advantage of the World",
  heroSubtitle: "One trusted digital home for cooperative connection.",
  primaryButtonText: "Explore the network",
  primaryButtonLink: "/network/affiliates",
  secondaryButtonText: "Discover VTIME",
  secondaryButtonLink: "/vtime",
  heroImages: [],
  statsAffiliates: 0,
  statsMembers: "",
  statsAssets: "",
  showOverlay: true,
  overlayColor: "#0D3D2E",
  overlayOpacity: 68,
  backgroundColor: "#124C37",
  gradientDirection: "to-br",
  textAlignment: "left",
  buttonStyle: "solid",
  primaryColor: "#0D3D2E",
  secondaryColor: "#267A57",
  accentColor: "#C58B2A",
  surfaceColor: "#FFFFFF",
  buttonColor: "#0D3D2E",
  buttonHoverColor: "#082D22",
  footerBackgroundColor: "#082D22",
  showHero: true,
  showStats: false,
  showMission: true,
  showServices: true,
  showReach: true,
  showNews: true,
};

test("valid homepage draft and publish payloads are accepted", () => {
  assert.equal(validateHomepageContent(validHomepage, "draft").success, true);
  assert.equal(validateHomepageContent(validHomepage, "publish").success, true);
});

test("the institutional appearance preset exposes centralized public CSS variables", () => {
  const style = publicAppearanceStyle(RECCUCAM_GREEN_APPEARANCE);
  assert.equal(style["--brand-primary"], "#0D3D2E");
  assert.equal(style["--brand-secondary"], "#267A57");
  assert.equal(style["--brand-button-hover"], "#082D22");
  assert.equal(style["--brand-footer"], "#082D22");
  assert.equal(Object.values(style).some((value) => ["#0A2647", "#144272", "#205295"].includes(value)), false);
});

test("hero gradient directions map to distinct CSS angles", () => {
  assert.deepEqual(
    ["to-r", "to-b", "to-br", "to-bl"].map(heroGradientAngle),
    [90, 180, 135, 225],
  );
});

test("publish rejects colors that cannot support accessible white text", () => {
  const result = validateHomepageContent({ ...validHomepage, buttonColor: "#7CBA99" }, "publish");
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.error.flatten().fieldErrors.buttonColor?.[0], "Button color needs more contrast with white text.");
  }
});

test("drafts retain low-contrast work-in-progress colors", () => {
  assert.equal(validateHomepageContent({ buttonColor: "#7CBA99" }, "draft").success, true);
});

test("an unchanged uploaded image remains valid", () => {
  const result = validateHomepageContent({ ...validHomepage, heroImages: ["https://cdn.example.com/hero.webp"] }, "publish");
  assert.equal(result.success, true);
});

test("multiline headlines are preserved and accepted", () => {
  const result = validateHomepageContent(validHomepage, "publish");
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.heroTitle, validHomepage.heroTitle);
});

test("blank optional statistics and CTA pairs are normalized by trimming", () => {
  const result = validateHomepageContent({
    ...validHomepage,
    primaryButtonText: "   ",
    primaryButtonLink: "",
    secondaryButtonText: "",
    secondaryButtonLink: "",
    statsMembers: "   ",
    statsAssets: "   ",
  }, "publish");
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.primaryButtonText, "");
    assert.equal(result.data.statsMembers, "");
  }
});

test("drafts allow incomplete content", () => {
  assert.equal(validateHomepageContent({ heroTitle: "Work in progress" }, "draft").success, true);
});

test("publish requires visible hero content", () => {
  const result = validateHomepageContent({ ...validHomepage, heroSubtitle: "" }, "publish");
  assert.equal(result.success, false);
  if (!result.success) {
    assert.deepEqual(result.error.flatten().fieldErrors.heroSubtitle, ["Subtitle is required before publishing."]);
  }
});

test("an invalid CTA URL produces a field-level error", () => {
  const result = validateHomepageContent({ ...validHomepage, primaryButtonLink: "example.com" }, "publish");
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.error.flatten().fieldErrors.primaryButtonLink?.[0], "Use an internal path beginning with a single /.");
  }
});

test("an overlong headline produces a field-level error", () => {
  const result = validateHomepageContent({ ...validHomepage, heroTitle: "x".repeat(HOMEPAGE_CONTENT_LIMITS.heroTitle + 1) }, "publish");
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.error.flatten().fieldErrors.heroTitle?.[0], `Headline must be ${HOMEPAGE_CONTENT_LIMITS.heroTitle} characters or fewer.`);
  }
});

test("database failures remain server errors and are not reported as validation errors", async () => {
  const result = await processHomepageSave(validHomepage, "draft", {
    persist: async () => { throw new Error("database offline"); },
    audit: async () => undefined,
    revalidatePublishedHomepage: () => undefined,
  });
  assert.equal(result.success, false);
  if (!result.success) assert.equal(result.kind, "server");
});

test("publishing revalidates the public homepage after persistence", async () => {
  const events: string[] = [];
  const result = await processHomepageSave(validHomepage, "publish", {
    persist: async () => { events.push("persist"); return { id: "default" }; },
    audit: async () => { events.push("audit"); },
    revalidatePublishedHomepage: () => { events.push("revalidate:/"); },
  });
  assert.equal(result.success, true);
  assert.deepEqual(events, ["persist", "audit", "revalidate:/"]);
});

test("saving a draft does not revalidate the public homepage", async () => {
  let revalidated = false;
  const result = await processHomepageSave({ heroTitle: "Draft" }, "draft", {
    persist: async () => ({ id: "default" }),
    audit: async () => undefined,
    revalidatePublishedHomepage: () => { revalidated = true; },
  });
  assert.equal(result.success, true);
  assert.equal(revalidated, false);
});
