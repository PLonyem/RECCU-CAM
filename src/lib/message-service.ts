import "server-only";

import { prisma } from "@/lib/prisma";
import { newMessageWorkflow } from "@/lib/message-inbox";
import { clerkClient } from "@clerk/nextjs/server";
import { AUTH_PERMISSIONS, hasPermission, normalizeAuthRole } from "@/lib/auth/roles";
import type { Prisma } from "@/generated/prisma/client";

export interface IncomingContactMessage {
  name: string;
  phone: string | null;
  email: string | null;
  organization: string | null;
  role: string | null;
  purpose: string;
  department: string;
  subject: string;
  message: string;
  consent: boolean;
}

export async function createIncomingContactMessage(input: IncomingContactMessage) {
  return prisma.$transaction((tx) => createIncomingContactMessageRecord(tx, input));
}

export async function createIncomingContactMessageRecord(
  tx: Prisma.TransactionClient,
  input: IncomingContactMessage,
) {
  const year = new Date().getUTCFullYear();
  const counter = await tx.messageReferenceCounter.upsert({
    where: { year },
    update: { sequence: { increment: 1 } },
    create: { year, sequence: 1 },
  });

  return tx.contactMessage.create({
    data: {
      ...input,
      ...newMessageWorkflow(year, counter.sequence),
    },
  });
}

export interface MessageAssignee {
  id: string;
  name: string;
  role: string;
}

function toMessageAssignee(user: {
  id: string;
  firstName: string | null;
  lastName: string | null;
  primaryEmailAddress: { emailAddress: string } | null;
  publicMetadata: Record<string, unknown>;
  banned: boolean;
}): MessageAssignee | null {
  const role = normalizeAuthRole(user.publicMetadata.role);
  if (!role || user.banned || !hasPermission(role, AUTH_PERMISSIONS.manageMessages)) return null;
  return {
    id: user.id,
    name: [user.firstName, user.lastName].filter(Boolean).join(" ")
      || user.primaryEmailAddress?.emailAddress
      || "Authorized staff",
    role,
  };
}

export async function listMessageAssignees() {
  const clerk = await clerkClient();
  const { data: users } = await clerk.users.getUserList({ limit: 100, orderBy: "-last_sign_in_at" });
  return users.map(toMessageAssignee).filter((user): user is MessageAssignee => Boolean(user));
}

export async function resolveMessageAssignee(userId: string) {
  const clerk = await clerkClient();
  try {
    return toMessageAssignee(await clerk.users.getUser(userId));
  } catch {
    return null;
  }
}
