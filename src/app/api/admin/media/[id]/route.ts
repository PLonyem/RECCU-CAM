import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { AUTH_PERMISSIONS, hasPermission, normalizeAuthRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { deletePublicSupabaseMedia } from "@/lib/supabase-storage";
import { reportServerError } from "@/lib/security/logging";

interface RouteParams { params: Promise<{ id: string }>; }

async function actor() {
  const { userId, sessionClaims } = await auth();
  const role = normalizeAuthRole(sessionClaims?.metadata?.role);
  return userId && role && hasPermission(role, AUTH_PERMISSIONS.manageMedia) ? { userId, role } : null;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const current = await actor();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = z.object({ archived: z.boolean() }).safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "Invalid media state." }, { status: 400 });
  const { id } = await params;
  const asset = await prisma.mediaAsset.update({ where: { id }, data: { storageState: body.data.archived ? "archived" : "active" } });
  await writeAuditLog({ actorId: current.userId, actorRole: current.role, action: body.data.archived ? "media_archived" : "media_restored", resource: "media", resourceId: id });
  return NextResponse.json(asset);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const current = await actor();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    if (asset.fileUrl) await deletePublicSupabaseMedia(asset.fileUrl);
    await prisma.mediaAsset.delete({ where: { id } });
    await writeAuditLog({ actorId: current.userId, actorRole: current.role, action: "media_deleted", resource: "media", resourceId: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    reportServerError("media.delete_failed", error);
    return NextResponse.json({ error: "The media asset could not be deleted safely." }, { status: 502 });
  }
}
