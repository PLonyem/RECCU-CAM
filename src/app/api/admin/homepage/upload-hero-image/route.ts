import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  isSupabaseStorageConfigured,
  uploadPublicSupabaseImage,
} from "@/lib/supabase-storage";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB — hero images, not documents

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

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
      { error: "Invalid upload. Please choose an image and try again." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image was uploaded." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Unsupported file type. Please upload a JPG, PNG, or WEBP image." },
      { status: 400 }
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Image is too large. Maximum size is 5MB." },
      { status: 400 }
    );
  }

  if (!isSupabaseStorageConfigured()) {
    return NextResponse.json(
      {
        error:
          "Image storage is not configured on this deployment. Ask a developer to set the SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.",
      },
      { status: 503 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const path = `${Date.now()}-${sanitizeFileName(file.name)}`;

  try {
    const url = await uploadPublicSupabaseImage(path, buffer, file.type);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Hero image upload failed:", error);
    return NextResponse.json(
      { error: "Failed to save the uploaded image. Please try again." },
      { status: 502 }
    );
  }
}
