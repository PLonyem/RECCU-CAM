import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import {
  isSupabaseStorageConfigured,
  uploadToSupabaseStorage,
} from "@/lib/supabase-storage";
import {
  extractTextFromFile,
  parseChapterFieldsFromText,
} from "@/lib/chapter-profile-extraction";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "image/jpeg",
  "image/png",
]);

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(request: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId || sessionClaims?.metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid upload. Please choose a file and try again." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  const chapterCode = formData.get("chapterCode");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
  }
  if (typeof chapterCode !== "string" || !chapterCode.trim()) {
    return NextResponse.json({ error: "A chapter must be selected." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Unsupported file type. Please upload a PDF, DOCX, JPG, or PNG file." },
      { status: 400 }
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File is too large. Maximum size is 10MB." },
      { status: 400 }
    );
  }

  const affiliate = await prisma.affiliate.findUnique({
    where: { code: chapterCode },
  });
  if (!affiliate) {
    return NextResponse.json({ error: "Chapter not found." }, { status: 404 });
  }

  if (!isSupabaseStorageConfigured()) {
    return NextResponse.json(
      {
        error:
          "File storage is not configured on this deployment. Ask a developer to set the SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables, or use manual entry instead.",
      },
      { status: 503 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const storagePath = `${affiliate.id}/${Date.now()}-${sanitizeFileName(file.name)}`;

  try {
    await uploadToSupabaseStorage(storagePath, buffer, file.type);
  } catch (error) {
    console.error("Chapter profile document upload failed:", error);
    return NextResponse.json(
      { error: "Failed to save the uploaded file. Please try again." },
      { status: 502 }
    );
  }

  const extractedText = await extractTextFromFile(buffer, file.type);
  const extractedFields = extractedText
    ? parseChapterFieldsFromText(extractedText)
    : null;

  const document = await prisma.affiliateDocument.create({
    data: {
      affiliateId: affiliate.id,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      storagePath,
      status: "pending_review",
      extractedText,
    },
  });

  return NextResponse.json({
    success: true,
    documentId: document.id,
    affiliate: {
      id: affiliate.id,
      code: affiliate.code,
      name: affiliate.name,
      region: affiliate.region,
    },
    extractedFields,
    reviewRequired: true,
  });
}
