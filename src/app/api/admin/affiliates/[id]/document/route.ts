import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getSignedSupabaseUrl, isSupabaseStorageConfigured } from "@/lib/supabase-storage";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Redirects to a short-lived signed URL for the affiliate's most recently
// uploaded chapter profile document — the bucket is private, so the raw
// storagePath alone isn't viewable.
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { userId, sessionClaims } = await auth();
  if (!userId || sessionClaims?.metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const document = await prisma.affiliateDocument.findFirst({
    where: { affiliateId: id },
    orderBy: { createdAt: "desc" },
  });

  if (!document) {
    return NextResponse.json({ error: "No document found for this chapter." }, { status: 404 });
  }

  if (!isSupabaseStorageConfigured()) {
    return NextResponse.json(
      {
        error:
          "File storage is not configured on this deployment. Ask a developer to set the SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.",
      },
      { status: 503 }
    );
  }

  try {
    const url = await getSignedSupabaseUrl(document.storagePath);
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Failed to sign chapter document URL:", error);
    return NextResponse.json(
      { error: "Failed to generate a link to this document. Please try again." },
      { status: 502 }
    );
  }
}
