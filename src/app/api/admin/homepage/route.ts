import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { AUTH_PERMISSIONS, hasPermission, normalizeAuthRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";
import { homepageContentSchema } from "@/lib/validation/homepage-content";
import { writeAuditLog } from "@/lib/audit";
import { Prisma } from "@/generated/prisma/client";

async function requireContentStaff() {
  const { userId, sessionClaims } = await auth();
  const role = normalizeAuthRole(sessionClaims?.metadata?.role);
  return userId && role && hasPermission(role, AUTH_PERMISSIONS.manageContent) ? { userId, role } : null;
}

export async function GET() {
  const actor = await requireContentStaff();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const content = await prisma.homepageContent.upsert({ where: { id: "default" }, update: {}, create: { id: "default" } });
  const draft = content.draftContent && typeof content.draftContent === "object" && !Array.isArray(content.draftContent) ? content.draftContent : {};
  return NextResponse.json({ ...content, ...draft });
}

export async function PUT(request: NextRequest) {
  const actor = await requireContentStaff();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const parsed = homepageContentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  const mode = request.nextUrl.searchParams.get("mode") === "draft" ? "draft" : "publish";
  const content = mode === "draft"
    ? await prisma.homepageContent.upsert({ where: { id: "default" }, update: { draftContent: parsed.data as Prisma.InputJsonValue, publicationStatus: "draft" }, create: { id: "default", draftContent: parsed.data as Prisma.InputJsonValue, publicationStatus: "draft" } })
    : await prisma.homepageContent.upsert({ where: { id: "default" }, update: { ...parsed.data, draftContent: Prisma.JsonNull, publicationStatus: "published", publishedAt: new Date(), publishedBy: actor.userId }, create: { id: "default", ...parsed.data, publicationStatus: "published", publishedAt: new Date(), publishedBy: actor.userId } });
  await writeAuditLog({ actorId: actor.userId, actorRole: actor.role, action: mode === "draft" ? "homepage_draft_saved" : "homepage_published", resource: "homepage", resourceId: content.id });
  if (mode === "publish") revalidatePath("/");
  return NextResponse.json({ ...content, ...parsed.data });
}
