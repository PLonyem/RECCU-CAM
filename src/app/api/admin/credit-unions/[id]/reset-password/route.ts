import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generateClerkPassword } from "@/lib/clerk-admin-utils";
import { sendCreditUnionCredentials } from "@/lib/email";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, sessionClaims } = await auth();
  if (!userId || sessionClaims?.metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const affiliate = await prisma.affiliate.findUnique({ where: { id }, include: { chapter: true } });
  if (!affiliate) return NextResponse.json({ error: "Credit union not found." }, { status: 404 });

  const clerk = await clerkClient();
  const { data: users } = await clerk.users.getUserList({ limit: 500 });
  const account = users.find(
    (user) => (user.publicMetadata as { affiliateId?: string }).affiliateId === id
  );
  if (!account) return NextResponse.json({ error: "This credit union has no login account." }, { status: 404 });

  const email = account.primaryEmailAddress?.emailAddress;
  if (!email) return NextResponse.json({ error: "The login account has no email address." }, { status: 400 });

  const password = generateClerkPassword();
  await clerk.users.updateUser(account.id, {
    password,
    signOutOfOtherSessions: true,
  });

  let emailSent = true;
  try {
    await sendCreditUnionCredentials({
      creditUnionName: affiliate.name,
      email,
      password,
      chapter: affiliate.chapter?.name ?? affiliate.chapterName ?? "CamCCUL",
    });
  } catch (error) {
    emailSent = false;
    console.error("Reset credentials email failed:", error);
  }

  return NextResponse.json({ success: true, emailSent, password });
}
