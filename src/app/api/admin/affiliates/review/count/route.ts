import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// Cheap endpoint for the admin sidebar badge — just the pending-review
// count, not the full chapter list.
export async function GET() {
  const { userId, sessionClaims } = await auth();
  if (!userId || sessionClaims?.metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pending = await prisma.affiliate.count({
    where: {
      AND: [
        { OR: [{ profileUpdatedAt: { not: null } }, { documents: { some: {} } }] },
        { OR: [{ profileStatus: "pending" }, { profileStatus: null }] },
      ],
    },
  });

  return NextResponse.json({ pending });
}
