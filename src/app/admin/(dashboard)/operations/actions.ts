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
import { defaultHomepageSections } from "@/data/homepage-cms";

const kinds = ["affiliation", "support", "banking"] as const;
const updateSchema = z.object({
  kind: z.enum(kinds), id: z.string().min(1), status: z.string().trim().min(1).max(40),
  assignedTo: z.string().trim().max(160).optional(), note: z.string().trim().max(2000).optional(),
});

const permissions = {
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
  if (parsed.kind === "affiliation") {
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
  revalidatePath(`/admin/${parsed.kind === "affiliation" ? "affiliation-requests" : parsed.kind === "banking" ? "affiliate-banking" : "support"}`);
}

export async function createComplianceRecord(formData: FormData) {
  const actor = await requireStaffPermission(AUTH_PERMISSIONS.manageCompliance);
  const data = z.object({ title: z.string().trim().min(4).max(180), description: z.string().trim().min(10).max(4000), category: z.string().trim().min(2).max(80), dueDate: z.string().optional(), audience: z.enum(["all-affiliates", "specific-affiliate"]), affiliateId: z.string().optional(), publication: z.enum(["draft", "published"]).default("draft") }).parse(Object.fromEntries(formData));
  const published = data.publication === "published";
  const record = await prisma.complianceRecord.create({ data: { title: data.title, description: data.description, category: data.category, dueDate: data.dueDate ? new Date(`${data.dueDate}T00:00:00Z`) : null, audience: data.audience, affiliateId: data.audience === "specific-affiliate" ? data.affiliateId || null : null, published } });
  await writeAuditLog({ actorId: actor.userId, actorRole: actor.role, action: published ? "compliance_notice_published" : "compliance_notice_draft_created", resource: "compliance", resourceId: record.id });
  revalidatePath("/admin/compliance"); revalidatePath("/affiliate-portal/compliance");
}

export async function updateComplianceRecord(formData: FormData) {
  const actor = await requireStaffPermission(AUTH_PERMISSIONS.manageCompliance);
  const data = z.object({ id: z.string().min(1), title: z.string().trim().min(4).max(180), description: z.string().trim().min(10).max(4000), category: z.string().trim().min(2).max(80), dueDate: z.string().optional(), audience: z.enum(["all-affiliates", "specific-affiliate"]), affiliateId: z.string().optional(), status: z.enum(["pending", "in-review", "completed", "archived"]), publication: z.enum(["draft", "published"]) }).parse(Object.fromEntries(formData));
  const record = await prisma.complianceRecord.update({ where: { id: data.id }, data: { title: data.title, description: data.description, category: data.category, dueDate: data.dueDate ? new Date(`${data.dueDate}T00:00:00Z`) : null, audience: data.audience, affiliateId: data.audience === "specific-affiliate" ? data.affiliateId || null : null, status: data.status, published: data.status === "archived" ? false : data.publication === "published" } });
  await writeAuditLog({ actorId: actor.userId, actorRole: actor.role, action: "compliance_record_updated", resource: "compliance", resourceId: record.id, metadata: { status: record.status, published: record.published } });
  revalidatePath("/admin/compliance");
  revalidatePath("/affiliate-portal/compliance");
}

export async function createTrainingProgram(formData: FormData) {
  const actor = await requireStaffPermission(AUTH_PERMISSIONS.manageTraining);
  const data = z.object({ title: z.string().trim().min(4).max(180), summary: z.string().trim().min(10).max(4000), category: z.string().trim().min(2).max(80), level: z.string().trim().min(2).max(40), format: z.string().optional(), venue: z.string().optional(), startDate: z.string().optional(), endDate: z.string().optional(), capacity: z.preprocess((value) => value === "" ? undefined : value, z.coerce.number().int().positive().optional()), publicationStatus: z.enum(["draft", "published"]).default("draft") }).parse(Object.fromEntries(formData));
  const baseSlug = slugify(data.title);
  const { publicationStatus, ...fields } = data;
  const published = publicationStatus === "published";
  const record = await prisma.trainingProgram.create({ data: { ...fields, slug: `${baseSlug}-${Date.now().toString(36)}`, audience: [], format: data.format || null, venue: data.venue || null, startDate: data.startDate ? new Date(`${data.startDate}T00:00:00Z`) : null, endDate: data.endDate ? new Date(`${data.endDate}T00:00:00Z`) : null, capacity: data.capacity || null, registrationStatus: published ? "registration-open" : "schedule-pending", published } });
  await writeAuditLog({ actorId: actor.userId, actorRole: actor.role, action: published ? "training_program_published" : "training_program_draft_created", resource: "training_program", resourceId: record.id });
  revalidateTraining(record.slug);
}

export async function updateTrainingProgram(formData: FormData) {
  const actor = await requireStaffPermission(AUTH_PERMISSIONS.manageTraining);
  const data = z.object({ id: z.string().min(1), title: z.string().trim().min(4).max(180), summary: z.string().trim().min(10).max(4000), category: z.string().trim().min(2).max(80), level: z.string().trim().min(2).max(40), format: z.string().optional(), venue: z.string().optional(), startDate: z.string().optional(), endDate: z.string().optional(), capacity: z.preprocess((value) => value === "" ? null : value, z.coerce.number().int().positive().nullable()), publicationStatus: z.enum(["draft", "published", "closed", "archived"]) }).parse(Object.fromEntries(formData));
  const existing = await prisma.trainingProgram.findUniqueOrThrow({ where: { id: data.id } });
  const published = data.publicationStatus === "published" || data.publicationStatus === "closed";
  const registrationStatus = data.publicationStatus === "closed" ? "registration-closed" : data.publicationStatus === "archived" ? "archived" : published ? "registration-open" : "schedule-pending";
  const record = await prisma.trainingProgram.update({ where: { id: data.id }, data: { title: data.title, summary: data.summary, category: data.category, level: data.level, format: data.format || null, venue: data.venue || null, startDate: data.startDate ? new Date(`${data.startDate}T00:00:00Z`) : null, endDate: data.endDate ? new Date(`${data.endDate}T00:00:00Z`) : null, capacity: data.capacity, published, registrationStatus } });
  await writeAuditLog({ actorId: actor.userId, actorRole: actor.role, action: `training_program_${data.publicationStatus}`, resource: "training_program", resourceId: record.id });
  revalidateTraining(existing.slug);
  revalidateTraining(record.slug);
}

function revalidateTraining(slug: string) {
  revalidatePath("/admin/vtime");
  revalidatePath("/vtime");
  revalidatePath("/vtime/programs");
  revalidatePath("/vtime/calendar");
  revalidatePath("/vtime/registration");
  revalidatePath(`/vtime/programs/${slug}`);
  revalidatePath("/affiliate-portal/vtime");
}

export async function createMediaMetadata(formData: FormData) {
  const actor = await requireStaffPermission(AUTH_PERMISSIONS.manageMedia);
  const data = z.object({ title: z.string().trim().min(2).max(180), fileName: z.string().trim().min(1).max(255), fileType: z.string().trim().min(2).max(100), altText: z.string().trim().min(2).max(300), caption: z.string().trim().max(1000).optional() }).parse(Object.fromEntries(formData));
  const record = await prisma.mediaAsset.create({ data: { ...data, caption: data.caption || null, uploadedBy: actor.userId, storageState: "metadata-only" } });
  await writeAuditLog({ actorId: actor.userId, actorRole: actor.role, action: "media_metadata_created", resource: "media", resourceId: record.id });
  revalidatePath("/admin/media");
}

export async function updateOrganizationSettings(formData: FormData) {
  const actor = await requireStaffPermission(AUTH_PERMISSIONS.manageSettings);
  const data = z.object({ siteName: z.string().trim().min(2).max(100), fullName: z.string().trim().min(4).max(240), address: z.string().trim().min(2).max(240), addressSecondary: z.string().trim().max(240).optional(), phone: z.string().trim().max(60).optional(), email: z.string().trim().email().optional().or(z.literal("")), officeHours: z.string().trim().max(240).optional(), facebookUrl: z.string().trim().url().optional().or(z.literal("")), linkedinUrl: z.string().trim().url().optional().or(z.literal("")), twitterUrl: z.string().trim().url().optional().or(z.literal("")) }).parse(Object.fromEntries(formData));
  const settings = await prisma.siteSettings.upsert({ where: { id: "default" }, update: data, create: { id: "default", ...data } });
  await writeAuditLog({ actorId: actor.userId, actorRole: actor.role, action: "organization_settings_updated", resource: "site_settings", resourceId: settings.id });
  revalidatePath("/", "layout"); revalidatePath("/contact");
}

export async function saveHomepageSections(formData: FormData) {
  const actor = await requireStaffPermission(AUTH_PERMISSIONS.manageContent);
  const value = z.string().trim().max(2500);
  const raw = Object.fromEntries(formData);
  const data = z.object({ mode: z.enum(["draft", "publish"]), whoTitle: value.min(4), whoDescription: value.min(20), missionTitle: value.min(4), missionBody: value.min(20), visionTitle: value.min(4), visionBody: value.min(20), leaderName: value, leaderRole: value, leaderMessage: value, contactTitle: value.min(4), contactDescription: value.min(10), contactButtonText: value.min(2) }).parse(raw);
  const values = defaultHomepageSections.values.map((fallback, index) => ({ title: String(raw[`value${index + 1}Title`] ?? fallback.title).trim(), description: String(raw[`value${index + 1}Description`] ?? fallback.description).trim() }));
  const { mode, ...fields } = data;
  const content = { ...fields, values } as unknown as Prisma.InputJsonValue;
  const status = mode;
  const record = await prisma.pageContent.upsert({ where: { pageKey_locale_status: { pageKey: "homepage-sections", locale: "en", status } }, update: { content, publishedAt: mode === "publish" ? new Date() : null, publishedBy: mode === "publish" ? actor.userId : null }, create: { pageKey: "homepage-sections", locale: "en", status, content, publishedAt: mode === "publish" ? new Date() : null, publishedBy: mode === "publish" ? actor.userId : null } });
  await writeAuditLog({ actorId: actor.userId, actorRole: actor.role, action: mode === "publish" ? "homepage_sections_published" : "homepage_sections_draft_saved", resource: "page_content", resourceId: record.id });
  if (mode === "publish") revalidatePath("/");
  revalidatePath("/admin/content/homepage-sections");
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
