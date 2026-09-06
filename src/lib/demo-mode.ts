import { APP_ROLES } from "@/lib/auth/roles";

export const DEMO_ADMIN_IDENTITY = {
  userId: "proposal-demo-administrator",
  name: "RECCU-CAM Demo Administrator",
  role: APP_ROLES.superAdmin,
  roleLabel: "Super Admin — Demo",
} as const;

/**
 * Fail closed: proposal access is enabled only by the exact value `true`.
 * Removing the variable, misspelling it, or setting any other value restores
 * the normal Clerk authentication and authorization flow.
 */
export function isDemoMode(
  value = process.env.NEXT_PUBLIC_DEMO_MODE,
  environment = process.env.NODE_ENV,
) {
  return environment === "development" && value === "true";
}

/**
 * Demo mode bypasses authentication only for read-only admin page requests.
 * API routes and Server Action POSTs continue through the normal auth checks.
 */
export function isDemoAdminPageRequest(
  pathname: string,
  method: string,
  demoMode = isDemoMode(),
) {
  if (!demoMode || (method !== "GET" && method !== "HEAD")) return false;
  return pathname === "/admin" || pathname.startsWith("/admin/");
}
