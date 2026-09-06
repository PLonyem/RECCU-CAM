import assert from "node:assert/strict";
import test from "node:test";
import {
  APP_ROLES,
  AUTH_PERMISSIONS,
  hasPermission,
  isAdminRole,
  isAffiliateRole,
  LEGACY_AUTH_ROLES,
  privateHomeForRole,
} from "@/lib/auth/roles";

test("legacy credit-union metadata no longer grants protected access", () => {
  assert.equal(isAdminRole(LEGACY_AUTH_ROLES.admin), true);
  assert.equal(isAffiliateRole(LEGACY_AUTH_ROLES.creditUnion), false);
  assert.equal(isAdminRole(LEGACY_AUTH_ROLES.creditUnion), false);
});

test("centralized RBAC admits staff and affiliate roles to their private areas", () => {
  assert.equal(isAdminRole(APP_ROLES.superAdmin), true);
  assert.equal(isAdminRole(APP_ROLES.communications), true);
  assert.equal(isAffiliateRole(APP_ROLES.affiliateUser), true);
  assert.equal(isAffiliateRole(APP_ROLES.admin), false);
});

test("post-sign-in routing admits only recognized RECCU-CAM roles", () => {
  const staffRoles = [
    APP_ROLES.superAdmin,
    APP_ROLES.admin,
    APP_ROLES.communications,
    APP_ROLES.networkManager,
    APP_ROLES.complianceOfficer,
    APP_ROLES.trainingManager,
    APP_ROLES.editor,
  ];

  for (const role of staffRoles) assert.equal(privateHomeForRole(role), "/admin");
  assert.equal(privateHomeForRole(APP_ROLES.affiliateUser), "/affiliate-portal");
  assert.equal(privateHomeForRole(LEGACY_AUTH_ROLES.creditUnion), "/access-denied");
  assert.equal(privateHomeForRole("unknown"), "/access-denied");
  assert.equal(privateHomeForRole(undefined), "/access-denied");
});

test("specialist permissions are least privilege", () => {
  assert.equal(hasPermission(APP_ROLES.communications, AUTH_PERMISSIONS.manageMessages), true);
  assert.equal(hasPermission(APP_ROLES.communications, AUTH_PERMISSIONS.manageNetwork), false);
  assert.equal(hasPermission(APP_ROLES.superAdmin, AUTH_PERMISSIONS.manageUsers), true);
  assert.equal(hasPermission(APP_ROLES.admin, AUTH_PERMISSIONS.manageUsers), false);
});
