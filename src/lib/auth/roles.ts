export const APP_ROLES = {
  superAdmin: "super_admin",
  communications: "communications",
  networkManager: "network_manager",
  complianceOfficer: "compliance_officer",
  trainingManager: "training_manager",
  editor: "editor",
  affiliateUser: "affiliate_user",
} as const;

export const LEGACY_AUTH_ROLES = {
  admin: "admin",
  creditUnion: "credit_union",
} as const;

export type AppRole = (typeof APP_ROLES)[keyof typeof APP_ROLES];
export type LegacyAuthRole = (typeof LEGACY_AUTH_ROLES)[keyof typeof LEGACY_AUTH_ROLES];
export type AuthRole = AppRole | LegacyAuthRole;

export const AUTH_PERMISSIONS = {
  manageUsers: "manage_users",
  manageNetwork: "manage_network",
  manageContent: "manage_content",
  manageCompliance: "manage_compliance",
  manageTraining: "manage_training",
  accessAffiliatePortal: "access_affiliate_portal",
} as const;

export type AuthPermission =
  (typeof AUTH_PERMISSIONS)[keyof typeof AUTH_PERMISSIONS];

/**
 * Future RBAC blueprint only. Production permission enforcement still needs
 * authoritative role assignments in Clerk before these specialist roles can
 * be admitted to private routes.
 */
export const ROLE_PERMISSION_BLUEPRINT: Readonly<Record<AppRole, readonly AuthPermission[]>> = {
  [APP_ROLES.superAdmin]: Object.values(AUTH_PERMISSIONS),
  [APP_ROLES.communications]: [AUTH_PERMISSIONS.manageContent],
  [APP_ROLES.networkManager]: [AUTH_PERMISSIONS.manageNetwork],
  [APP_ROLES.complianceOfficer]: [AUTH_PERMISSIONS.manageCompliance],
  [APP_ROLES.trainingManager]: [AUTH_PERMISSIONS.manageTraining],
  [APP_ROLES.editor]: [AUTH_PERMISSIONS.manageContent],
  [APP_ROLES.affiliateUser]: [AUTH_PERMISSIONS.accessAffiliatePortal],
};

export function normalizeAuthRole(role: unknown): AppRole | null {
  if (role === LEGACY_AUTH_ROLES.admin) return APP_ROLES.superAdmin;
  if (role === LEGACY_AUTH_ROLES.creditUnion) return APP_ROLES.affiliateUser;
  return Object.values(APP_ROLES).includes(role as AppRole) ? (role as AppRole) : null;
}

export function isAdminRole(role: unknown) {
  // Future roles are deliberately fail-closed until Clerk assignments and
  // endpoint-level permission checks are implemented and verified.
  return role === LEGACY_AUTH_ROLES.admin;
}

export function isAffiliateRole(role: unknown) {
  return role === LEGACY_AUTH_ROLES.creditUnion;
}

export function privateHomeForRole(role: unknown) {
  if (isAdminRole(role)) return "/admin";
  if (isAffiliateRole(role)) return "/dashboard";
  return "/";
}
