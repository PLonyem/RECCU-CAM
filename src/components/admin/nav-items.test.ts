import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  APP_ROLES,
  hasPermission,
  normalizeAuthRole,
  permissionForAdminPath,
} from "@/lib/auth/roles";
import { adminNavItems } from "./nav-items";

const dashboardRoot = path.join(process.cwd(), "src", "app", "admin", "(dashboard)");

function pagePathFor(href: string) {
  const segments = href.split("/").filter(Boolean).slice(1);
  return path.join(dashboardRoot, ...segments, "page.tsx");
}

test("every visible admin sidebar destination resolves to a page", () => {
  const hrefs = adminNavItems.map((item) => item.href);
  assert.equal(new Set(hrefs).size, hrefs.length);

  for (const item of adminNavItems) {
    assert.equal(existsSync(pagePathFor(item.href)), true, `${item.href} must have a page`);
  }
});

test("super_admin is normalized consistently and can access every sidebar destination", () => {
  assert.equal(normalizeAuthRole("super_admin"), APP_ROLES.superAdmin);

  for (const item of adminNavItems) {
    assert.equal(hasPermission(APP_ROLES.superAdmin, item.permission), true, item.href);
    assert.equal(permissionForAdminPath(item.href), item.permission, item.href);
  }
});

test("unknown and mismatched role spellings remain unauthorized", () => {
  for (const role of [undefined, null, "SUPER_ADMIN", "super-admin", "staff_admin"]) {
    assert.equal(normalizeAuthRole(role), null);
    assert.equal(hasPermission(role, "access_admin"), false);
  }
});

test("data-backed sidebar modules define a zero-record state", () => {
  const expectations = [
    ["messages/page.tsx", "No messages yet."],
    ["affiliates/page.tsx", "No affiliates found."],
    ["affiliation-requests/page.tsx", "No affiliation requests have been received."],
    ["affiliate-banking/page.tsx", "No affiliate banking inquiries have been submitted."],
    ["support/page.tsx", "No support requests yet."],
    ["news/page.tsx", "No news articles yet."],
    ["announcements/page.tsx", "No active announcements."],
    ["vtime/page.tsx", "No programs have been created."],
    ["resources/page.tsx", "No resources found."],
    ["compliance/page.tsx", "No compliance records yet."],
    ["media/page.tsx", "No media assets yet."],
    ["users/page.tsx", "No users found."],
    ["audit-log/page.tsx", "No audited actions yet."],
  ] as const;

  for (const [relativePath, copy] of expectations) {
    const source = readFileSync(path.join(dashboardRoot, relativePath), "utf8");
    assert.equal(source.includes(copy), true, `${relativePath} must render an empty state`);
  }
});

test("the nested admin error boundary keeps recovery actions available", () => {
  const source = readFileSync(path.join(dashboardRoot, "error.tsx"), "utf8");
  assert.match(source, /Unable to load this section\./);
  assert.match(source, /> Retry/);
  assert.match(source, /Back to Admin Dashboard/);
  assert.match(source, /href="\/admin"/);
});
