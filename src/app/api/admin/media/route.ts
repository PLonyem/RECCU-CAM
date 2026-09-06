import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { AUTH_PERMISSIONS, hasPermission, normalizeAuthRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { contentMatchesMime, storageFileName, UPLOAD_MIME_TYPES } from "@/lib/security/file-upload";
import { isSupabaseStorageConfigured, uploadPublicSupabaseMedia } from "@/lib/supabase-storage";
import { reportServerError } from "@/lib/security/logging";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set<string>(Object.values(UPLOAD_MIME_TYPES));

export async function POST(request: NextRequest) {
  const { userId, sessionClaims } = await auth();
  const role = normalizeAuthRole(sessionClaims?.metadata?.role);
  if (!userId || !role) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(role, AUTH_PERMISSIONS.manageMedia)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let formData: FormData;
  try { formData = await request.formData(); } catch {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }
  const file = formData.get("file");
  const title = String(formData.get("title") ?? "").trim();
  const altText = String(formData.get("altText") ?? "").trim();
  const caption = String(formData.get("caption") ?? "").trim();
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 });
  if (title.length < 2 || title.length > 180 || altText.length < 2 || altText.length > 300) {
    return NextResponse.json({ error: "Provide a valid title and alternative text." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ error: "Use PDF, DOCX, JPG, PNG, or WEBP files only." }, { status: 400 });
  if (file.size < 1 || file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "File size must be between 1 byte and 10MB." }, { status: 400 });
  if (!isSupabaseStorageConfigured()) return NextResponse.json({ error: "Media storage is not configured on this deployment." }, { status: 503 });

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!contentMatchesMime(buffer, file.type)) return NextResponse.json({ error: "The file contents do not match its declared type." }, { status: 400 });

  try {
    const path = `library/${storageFileName(file.type)}`;
    const fileUrl = await uploadPublicSupabaseMedia(path, buffer, file.type);
    const asset = await prisma.mediaAsset.create({ data: { fileName: file.name, fileUrl, fileType: file.type, fileSize: file.size, title, altText, caption: caption || null, uploadedBy: userId, storageState: "active" } });
    await writeAuditLog({ actorId: userId, actorRole: role, action: "media_uploaded", resource: "media", resourceId: asset.id, metadata: { fileType: file.type, fileSize: file.size } });
    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    reportServerError("media.upload_failed", error);
    return NextResponse.json({ error: "The media asset could not be saved." }, { status: 502 });
  }
}
