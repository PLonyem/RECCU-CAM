import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

// A chapter shows up for review once it has either submitted profile
// content (profileUpdatedAt set) or uploaded a document — either path
// through the "Upload Chapter Profiles" tool.
const HAS_SUBMISSION_WHERE: Prisma.AffiliateWhereInput = {
  OR: [{ profileUpdatedAt: { not: null } }, { documents: { some: {} } }],
};

const VALID_STATUSES = ["pending", "approved", "rejected"];

export async function GET(request: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId || sessionClaims?.metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = request.nextUrl.searchParams.get("status");
  const region = request.nextUrl.searchParams.get("region");

  const filters: Prisma.AffiliateWhereInput[] = [HAS_SUBMISSION_WHERE];
  if (status && VALID_STATUSES.includes(status)) {
    filters.push({ profileStatus: status });
  }
  if (region) {
    filters.push({ region });
  }
  const where: Prisma.AffiliateWhereInput = { AND: filters };

  // Counts (and the tab badges they drive) are scoped to the chapter
  // filter but not the status filter, so switching status tabs doesn't
  // change the other tabs' own counts out from under the user — only
  // picking a different chapter does.
  const countsWhere: Prisma.AffiliateWhereInput = region
    ? { AND: [HAS_SUBMISSION_WHERE, { region }] }
    : HAS_SUBMISSION_WHERE;

  const [chapters, statusGroups] = await Promise.all([
    prisma.affiliate.findMany({
      where,
      orderBy: { profileUpdatedAt: "desc" },
      select: {
        id: true,
        code: true,
        name: true,
        region: true,
        phone: true,
        email: true,
        address: true,
        profileStatus: true,
        profileReviewNote: true,
        profileUpdatedAt: true,
        yearEstablished: true,
        briefHistory: true,
        totalMembers: true,
        branchCount: true,
        memberCreditUnionCount: true,
        services: true,
        chapterPresident: true,
        chapterSupervisor: true,
        boardSize: true,
        staffCount: true,
        memberCreditUnions: true,
        documents: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            fileName: true,
            fileType: true,
            fileSize: true,
            status: true,
            createdAt: true,
          },
        },
      },
    }),
    prisma.affiliate.groupBy({
      by: ["profileStatus"],
      where: countsWhere,
      _count: { _all: true },
    }),
  ]);

  const counts = { pending: 0, approved: 0, rejected: 0 };
  for (const group of statusGroups) {
    const key = (group.profileStatus ?? "pending") as keyof typeof counts;
    if (key in counts) counts[key] += group._count._all;
  }

  return NextResponse.json({
    chapters,
    counts: {
      ...counts,
      total: counts.pending + counts.approved + counts.rejected,
    },
  });
}
