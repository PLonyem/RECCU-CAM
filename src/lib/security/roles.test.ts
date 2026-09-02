import assert from "node:assert/strict";
import test from "node:test";
import {
  APP_ROLES,
  isAdminRole,
  isAffiliateRole,
  LEGACY_AUTH_ROLES,
} from "@/lib/auth/roles";

test("current Clerk roles map to their existing private areas", () => {
  assert.equal(isAdminRole(LEGACY_AUTH_ROLES.admin), true);
  assert.equal(isAffiliateRole(LEGACY_AUTH_ROLES.creditUnion), true);
  assert.equal(isAdminRole(LEGACY_AUTH_ROLES.creditUnion), false);
});

test("future RBAC roles remain fail-closed until permissions are implemented", () => {
  assert.equal(isAdminRole(APP_ROLES.superAdmin), false);
  assert.equal(isAffiliateRole(APP_ROLES.affiliateUser), false);
});
