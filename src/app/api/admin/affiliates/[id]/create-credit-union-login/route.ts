import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { extractClerkErrorMessage, generateClerkPassword } from "@/lib/clerk-admin-utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const bodySchema = z.object({
  email: z.string().trim().email(),
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { userId, sessionClaims } = await auth();
  if (!userId || sessionClaims?.metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const affiliate = await prisma.affiliate.findUnique({
    where: { id },
    select: { id: true, name: true, code: true, chapterName: true, chapter: { select: { name: true } } },
  });
  if (!affiliate) {
    return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "A valid email address is required." },
      { status: 400 }
    );
  }

  const password = generateClerkPassword();
  const clerk = await clerkClient();

  try {
    const user = await clerk.users.createUser({
      emailAddress: [parsed.data.email],
      password,
      publicMetadata: {
        role: "credit_union",
        affiliateId: affiliate.id,
        affiliateName: affiliate.name,
        affiliateCode: affiliate.code,
        chapter: affiliate.chapter?.name ?? affiliate.chapterName ?? undefined,
      },
    });

    return NextResponse.json({
      success: true,
      userId: user.id,
      email: parsed.data.email,
      password,
    });
  } catch (error) {
    // Surface Clerk's own message (e.g. "That email address is taken")
    // rather than a generic failure, since the admin needs to know why.
    const message =
      extractClerkErrorMessage(error) ??
      "Could not create the Clerk account. Please try again.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
