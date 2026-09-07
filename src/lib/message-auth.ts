import "server-only";

import { auth } from "@clerk/nextjs/server";
import {
  AUTH_PERMISSIONS,
  hasPermission,
  normalizeAuthRole,
  type AppRole,
} from "@/lib/auth/roles";

export type MessageActorResult =
  | { ok: true; userId: string; role: AppRole }
  | { ok: false; status: 401 | 403 };

export async function getMessageActor(): Promise<MessageActorResult> {
  const { userId, sessionClaims } = await auth();
  if (!userId) return { ok: false, status: 401 };

  const role = normalizeAuthRole(sessionClaims?.metadata?.role);
  if (!role || !hasPermission(role, AUTH_PERMISSIONS.manageMessages)) {
    return { ok: false, status: 403 };
  }

  return { ok: true, userId, role };
}
