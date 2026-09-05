"use server";

import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaffPermission } from "@/lib/auth/staff-context";
import { AUTH_PERMISSIONS, APP_ROLES, type AppRole } from "@/lib/auth/roles";
import { writeAuditLog } from "@/lib/audit";
import { slugify } from "@/lib/slug";
import type { Prisma } from "@/generated/prisma/client";

const kinds = ["message", "affiliation", "support", "banking"] as const;
const updateSchema = z.object({
  kind: z.enum(kinds), id: z.string().min(1), status: z.string().trim().min(1).max(40),
  assignedTo: z.string().trim().max(160).optional(), note: z.string().trim().max(2000).optional(),
});

const permissions = {
  message: AUTH_PERMISSIONS.manageMessages,
  affiliation: AUTH_PERMISSIONS.manageAffiliationRequests,
  support: AUTH_PERMISSIONS.manageSupport,
  banking: AUTH_PERMISSIONS.manageAffiliateBanking,
} as const;

function appendNote(notes: Prisma.JsonValue, note: string | undefined, actorId: string) {
  const current = Array.isArray(notes) ? notes : [];
  return note ? [...current, { note, actorId, createdAt: new Date().toISOString() }] as Prisma.InputJsonValue : current as Prisma.InputJsonValue;
}

export async function updateOperationalRecord(formData: FormData) {
  const parsed = updateSchema.parse(Object.fromEntries(formData));
  const actor = await requireStaffPermission(permissions[parsed.kind]);
  const shared = { status: parsed.status, assignedTo: parsed.assignedTo || null };
  if (parsed.kind === "message") {
    const existing = await prisma.contactMessage.findUniqueOrThrow({ where: { id: parsed.id } });
    await prisma.contactMessage.update({ where: { id: parsed.id }, data: { ...shared, isRead: true, internalNotes: appendNote(existing.internalNotes, parsed.note, actor.userId) } });
  } else if (parsed.kind === "affiliation") {
    const existing = await prisma.affiliationInquiry.findUniqueOrThrow({ where: { id: parsed.id } });
    await prisma.affiliationInquiry.update({ where: { id: parsed.id }, data: { ...shared, internalNotes: appendNote(existing.internalNotes, parsed.note, actor.userId) } });
  } else if (parsed.kind === "support") {
    const existing = await prisma.supportTicket.findUniqueOrThrow({ where: { id: parsed.id } });
    await prisma.supportTicket.update({ where: { id: parsed.id }, data: { ...shared, internalNotes: appendNote(existing.internalNotes, parsed.note, actor.userId) } });
  } else {
    const existing = await prisma.affiliateBankingInquiry.findUniqueOrThrow({ where: { id: parsed.id } });
    await prisma.affiliateBankingInquiry.update({ where: { id: parsed.id }, data: { ...shared, internalNotes: appendNote(existing.internalNotes, parsed.note, actor.userId) } });
  }
  await writeAuditLog({ actorId: actor.userId, actorRole: actor.role, action: "status_changed", resource: parsed.kind, resourceId: parsed.id, metadata: { status: parsed.status } });
  revalidatePath(`/admin/${parsed.kind === "affiliation" ? "affiliation-requests" : parsed.kind === "banking" ? "affiliate-banking" : `${parsed.kind}s`}`);
}

export async function createComplianceRecord(formData: FormData) {
  const actor = await requireStaffPermission(AUTH_PERMISSIONS.manageCompliance);
  const data = z.object({ title: z.string().trim().min(4).max(180), description: z.string().trim().min(10).max(4000), category: z.string().trim().min(2).max(80), dueDate: z.string().optional(), audience: z.enum(["all-affiliates", "specific-affiliate"]), affiliateId: z.string().optional() }).parse(Object.fromEntries(formData));
  const record = await prisma.complianceRecord.create({ data: { title: data.title, description: data.description, category: data.category, dueDate: data.dueDate ? new Date(`${data.dueDate}T00:00:00Z`) : null, audience: data.audience, affiliateId: data.affiliateId || null, published: true } });
  await writeAuditLog({ actorId: actor.userId, actorRole: actor.role, action: "compliance_notice_published", resource: "compliance", resourceId: record.id });
  revalidatePath("/admin/compliance"); revalidatePath("/affiliate-portal/compliance");
}

export async function createTrainingProgram(formData: FormData) {
  const actor = await requireStaffPermission(AUTH_PERMISSIONS.manageTraining);
  const data = z.object({ title: z.string().trim().min(4).max(180), summary: z.string().trim().min(10).max(4000), category: z.string().trim().min(2).max(80), level: z.string().trim().min(2).max(40), format: z.string().optional(), venue: z.string().optional(), startDate: z.string().optional(), endDate: z.string().optional(), capacity: z.coerce.number().int().positive().optional() }).parse(Object.fromEntries(formData));
  const baseSlug = slugify(data.title);
  const record = await prisma.trainingProgram.create({ data: { ...data, slug: `${baseSlug}-${Date.now().toString(36)}`, audience: [], format: data.format || null, venue: data.venue || null, startDate: data.startDate ? new Date(`${data.startDate}T00:00:00Z`) : null, endDate: data.endDate ? new Date(`${data.endDate}T00:00:00Z`) : null, capacity: data.capacity || null, registrationStatus: "registration-open", published: true } });
  await writeAuditLog({ actorId: actor.userId, actorRole: actor.role, action: "training_program_published", resource: "training_program", resourceId: record.id });
  revalidatePath("/admin/vtime"); revalidatePath("/affiliate-portal/vtime");
}

export async function createMediaMetadata(formData: FormData) {
  const actor = await requireStaffPermission(AUTH_PERMISSIONS.manageMedia);
  const data = z.object({ title: z.string().trim().min(2).max(180), fileName: z.string().trim().min(1).max(255), fileType: z.string().trim().min(2).max(100), altText: z.string().trim().min(2).max(300), caption: z.string().trim().max(1000).optional() }).parse(Object.fromEntries(formData));
  const record = await prisma.mediaAsset.create({ data: { ...data, caption: data.caption || null, uploadedBy: actor.userId, storageState: "metadata-only" } });
  await writeAuditLog({ actorId: actor.userId, actorRole: actor.role, action: "media_metadata_created", resource: "media", resourceId: record.id });
  revalidatePath("/admin/media");
}

export async function updateUserAccess(formData: FormData) {
  const actor = await requireStaffPermission(AUTH_PERMISSIONS.manageUsers);
  const data = z.object({ userId: z.string().min(1), operation: z.enum(["role", "deactivate", "reactivate"]), role: z.custom<AppRole>((value) => Object.values(APP_ROLES).includes(value as AppRole)).optional() }).parse(Object.fromEntries(formData));
  const clerk = await clerkClient();
  if (data.operation === "role") {
    if (!data.role) throw new Error("Role is required");
    await clerk.users.updateUserMetadata(data.userId, { publicMetadata: { role: data.role } });
  } else if (data.operation === "deactivate") await clerk.users.banUser(data.userId);
  else await clerk.users.unbanUser(data.userId);
  await writeAuditLog({ actorId: actor.userId, actorRole: actor.role, action: `user_${data.operation}`, resource: "clerk_user", resourceId: data.userId, metadata: data.role ? { role: data.role } : undefined });
  revalidatePath("/admin/users");
}
