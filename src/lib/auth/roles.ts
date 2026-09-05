export const APP_ROLES = {
  superAdmin: "super_admin",
  admin: "admin",
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
  accessAdmin: "access_admin",
  accessAffiliatePortal: "access_affiliate_portal",
  manageUsers: "manage_users",
  manageContent: "manage_content",
  manageMessages: "manage_messages",
  manageNetwork: "manage_network",
  manageAffiliationRequests: "manage_affiliation_requests",
  manageNews: "manage_news",
  manageNotices: "manage_notices",
  manageTraining: "manage_training",
  manageKnowledge: "manage_knowledge",
  manageCompliance: "manage_compliance",
  manageAffiliateBanking: "manage_affiliate_banking",
  manageSupport: "manage_support",
  manageMedia: "manage_media",
  viewAuditLog: "view_audit_log",
  manageSettings: "manage_settings",
} as const;

export type AuthPermission = (typeof AUTH_PERMISSIONS)[keyof typeof AUTH_PERMISSIONS];

const ALL_STAFF_PERMISSIONS = Object.values(AUTH_PERMISSIONS).filter(
  (permission) => permission !== AUTH_PERMISSIONS.accessAffiliatePortal,
);

export const ROLE_PERMISSIONS: Readonly<Record<AppRole, readonly AuthPermission[]>> = {
  [APP_ROLES.superAdmin]: ALL_STAFF_PERMISSIONS,
  [APP_ROLES.admin]: ALL_STAFF_PERMISSIONS.filter(
    (permission) => permission !== AUTH_PERMISSIONS.manageUsers,
  ),
  [APP_ROLES.communications]: [AUTH_PERMISSIONS.accessAdmin, AUTH_PERMISSIONS.manageContent, AUTH_PERMISSIONS.manageMessages, AUTH_PERMISSIONS.manageNews, AUTH_PERMISSIONS.manageNotices, AUTH_PERMISSIONS.manageMedia],
  [APP_ROLES.networkManager]: [AUTH_PERMISSIONS.accessAdmin, AUTH_PERMISSIONS.manageNetwork, AUTH_PERMISSIONS.manageAffiliationRequests, AUTH_PERMISSIONS.manageAffiliateBanking, AUTH_PERMISSIONS.manageSupport],
  [APP_ROLES.complianceOfficer]: [AUTH_PERMISSIONS.accessAdmin, AUTH_PERMISSIONS.manageKnowledge, AUTH_PERMISSIONS.manageCompliance, AUTH_PERMISSIONS.manageNotices],
  [APP_ROLES.trainingManager]: [AUTH_PERMISSIONS.accessAdmin, AUTH_PERMISSIONS.manageTraining, AUTH_PERMISSIONS.manageKnowledge],
  [APP_ROLES.editor]: [AUTH_PERMISSIONS.accessAdmin, AUTH_PERMISSIONS.manageContent, AUTH_PERMISSIONS.manageNews],
  [APP_ROLES.affiliateUser]: [AUTH_PERMISSIONS.accessAffiliatePortal],
};

export const ROLE_LABELS: Readonly<Record<AppRole, string>> = {
  [APP_ROLES.superAdmin]: "Super Administrator",
  [APP_ROLES.admin]: "Administrator",
  [APP_ROLES.communications]: "Communications",
  [APP_ROLES.networkManager]: "Network Manager",
  [APP_ROLES.complianceOfficer]: "Compliance Officer",
  [APP_ROLES.trainingManager]: "Training Manager",
  [APP_ROLES.editor]: "Editor",
  [APP_ROLES.affiliateUser]: "Affiliate User",
};

export function normalizeAuthRole(role: unknown): AppRole | null {
  if (role === LEGACY_AUTH_ROLES.creditUnion) return APP_ROLES.affiliateUser;
  return Object.values(APP_ROLES).includes(role as AppRole) ? (role as AppRole) : null;
}

export function hasPermission(role: unknown, permission: AuthPermission) {
  const normalized = normalizeAuthRole(role);
  return normalized ? ROLE_PERMISSIONS[normalized].includes(permission) : false;
}

export function isStaffRole(role: unknown) {
  return hasPermission(role, AUTH_PERMISSIONS.accessAdmin);
}

export function isAdminRole(role: unknown) {
  return isStaffRole(role);
}

export function isAffiliateRole(role: unknown) {
  return hasPermission(role, AUTH_PERMISSIONS.accessAffiliatePortal);
}

export function privateHomeForRole(role: unknown) {
  if (isStaffRole(role)) return "/admin";
  if (isAffiliateRole(role)) return "/affiliate-portal";
  return "/";
}

const ADMIN_PATH_PERMISSIONS: readonly [string, AuthPermission][] = [
  ["/admin/users", AUTH_PERMISSIONS.manageUsers], ["/api/admin/users", AUTH_PERMISSIONS.manageUsers],
  ["/admin/audit-log", AUTH_PERMISSIONS.viewAuditLog], ["/api/admin/audit-log", AUTH_PERMISSIONS.viewAuditLog],
  ["/admin/messages", AUTH_PERMISSIONS.manageMessages], ["/api/admin/messages", AUTH_PERMISSIONS.manageMessages],
  ["/admin/affiliation-requests", AUTH_PERMISSIONS.manageAffiliationRequests], ["/api/admin/affiliation-requests", AUTH_PERMISSIONS.manageAffiliationRequests],
  ["/admin/affiliates", AUTH_PERMISSIONS.manageNetwork], ["/admin/chapters", AUTH_PERMISSIONS.manageNetwork],
  ["/api/admin/affiliates", AUTH_PERMISSIONS.manageNetwork], ["/api/admin/credit-unions", AUTH_PERMISSIONS.manageNetwork],
  ["/admin/news", AUTH_PERMISSIONS.manageNews], ["/api/admin/news", AUTH_PERMISSIONS.manageNews],
  ["/admin/notices", AUTH_PERMISSIONS.manageNotices], ["/admin/announcements", AUTH_PERMISSIONS.manageNotices],
  ["/api/admin/notices", AUTH_PERMISSIONS.manageNotices], ["/api/admin/announcements", AUTH_PERMISSIONS.manageNotices],
  ["/admin/vtime", AUTH_PERMISSIONS.manageTraining], ["/api/admin/vtime", AUTH_PERMISSIONS.manageTraining],
  ["/admin/knowledge", AUTH_PERMISSIONS.manageKnowledge], ["/admin/resources", AUTH_PERMISSIONS.manageKnowledge],
  ["/api/admin/knowledge", AUTH_PERMISSIONS.manageKnowledge], ["/api/admin/resources", AUTH_PERMISSIONS.manageKnowledge],
  ["/admin/compliance", AUTH_PERMISSIONS.manageCompliance], ["/api/admin/compliance", AUTH_PERMISSIONS.manageCompliance],
  ["/admin/affiliate-banking", AUTH_PERMISSIONS.manageAffiliateBanking], ["/admin/loan-products", AUTH_PERMISSIONS.manageAffiliateBanking],
  ["/api/admin/affiliate-banking", AUTH_PERMISSIONS.manageAffiliateBanking], ["/api/admin/loan-products", AUTH_PERMISSIONS.manageAffiliateBanking],
  ["/admin/support", AUTH_PERMISSIONS.manageSupport], ["/api/admin/support", AUTH_PERMISSIONS.manageSupport],
  ["/admin/media", AUTH_PERMISSIONS.manageMedia], ["/api/admin/media", AUTH_PERMISSIONS.manageMedia],
  ["/admin/settings", AUTH_PERMISSIONS.manageSettings], ["/api/admin/settings", AUTH_PERMISSIONS.manageSettings],
  ["/admin/content", AUTH_PERMISSIONS.manageContent], ["/admin/homepage", AUTH_PERMISSIONS.manageContent],
  ["/api/admin/content", AUTH_PERMISSIONS.manageContent], ["/api/admin/homepage", AUTH_PERMISSIONS.manageContent],
];

export function permissionForAdminPath(pathname: string): AuthPermission {
  return ADMIN_PATH_PERMISSIONS.find(
    ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )?.[1] ?? AUTH_PERMISSIONS.accessAdmin;
}
