import "server-only";

import { prisma } from "@/lib/prisma";
import type { AppRole } from "@/lib/auth/roles";
import type { Prisma } from "@/generated/prisma/client";

export async function writeAuditLog(input: { actorId: string; actorRole: AppRole; action: string; resource: string; resourceId?: string; metadata?: Prisma.InputJsonValue }) {
  await prisma.auditLog.create({ data: input });
}
