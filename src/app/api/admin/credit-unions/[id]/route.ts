import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const { userId, sessionClaims } = await auth();
  return Boolean(userId && sessionClaims?.metadata?.role === "admin");
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const affiliate = await prisma.affiliate.findUnique({ where: { id }, select: { id: true } });
  if (!affiliate) return NextResponse.json({ error: "Credit union not found." }, { status: 404 });

  const clerk = await clerkClient();
  const { data: users } = await clerk.users.getUserList({ limit: 500 });
  const account = users.find(
    (user) => (user.publicMetadata as { affiliateId?: string }).affiliateId === id
  );
  if (account) await clerk.users.deleteUser(account.id);

  await prisma.$transaction([
    prisma.creditUnionSignupRequest.updateMany({ where: { affiliateId: id }, data: { affiliateId: null } }),
    prisma.loanSimulation.updateMany({ where: { affiliateId: id }, data: { affiliateId: null } }),
    prisma.affiliate.delete({ where: { id } }),
  ]);

  return NextResponse.json({ success: true });
}
