import assert from "node:assert/strict";
import test from "node:test";
import {
  APP_ROLES,
  AUTH_PERMISSIONS,
  hasPermission,
  isAdminRole,
  isAffiliateRole,
  LEGACY_AUTH_ROLES,
} from "@/lib/auth/roles";

test("current Clerk roles map to their existing private areas", () => {
  assert.equal(isAdminRole(LEGACY_AUTH_ROLES.admin), true);
  assert.equal(isAffiliateRole(LEGACY_AUTH_ROLES.creditUnion), true);
  assert.equal(isAdminRole(LEGACY_AUTH_ROLES.creditUnion), false);
});

test("centralized RBAC admits staff and affiliate roles to their private areas", () => {
  assert.equal(isAdminRole(APP_ROLES.superAdmin), true);
  assert.equal(isAdminRole(APP_ROLES.communications), true);
  assert.equal(isAffiliateRole(APP_ROLES.affiliateUser), true);
  assert.equal(isAffiliateRole(APP_ROLES.admin), false);
});

test("specialist permissions are least privilege", () => {
  assert.equal(hasPermission(APP_ROLES.communications, AUTH_PERMISSIONS.manageMessages), true);
  assert.equal(hasPermission(APP_ROLES.communications, AUTH_PERMISSIONS.manageNetwork), false);
  assert.equal(hasPermission(APP_ROLES.superAdmin, AUTH_PERMISSIONS.manageUsers), true);
  assert.equal(hasPermission(APP_ROLES.admin, AUTH_PERMISSIONS.manageUsers), false);
});
