import "server-only";

import { auth } from "@clerk/nextjs/server";
import { hasPermission, normalizeAuthRole, type AuthPermission } from "@/lib/auth/roles";

export async function requireStaffPermission(permission: AuthPermission) {
  const { userId, sessionClaims } = await auth();
  const role = normalizeAuthRole(sessionClaims?.metadata?.role);
  if (!userId || !role || !hasPermission(role, permission)) throw new Error("Unauthorized");
  return { userId, role };
}
