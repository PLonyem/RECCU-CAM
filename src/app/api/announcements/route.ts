import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public — no auth, unlike everything under /api/admin. Read by the credit
// union dashboard's AnnouncementsFeed, but nothing about the query itself
// is dashboard-specific, so this stays a plain public endpoint rather than
// living under /api/dashboard.
export const dynamic = "force-dynamic";

// urgent/high/normal/low as a plain String column sorts alphabetically
// (high, low, normal, urgent) under a normal Prisma orderBy, not by actual
// severity — so priority order is applied here in JS instead of a raw SQL
// CASE expression.
const PRIORITY_RANK: Record<string, number> = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
};

export async function GET() {
  const now = new Date();

  const rows = await prisma.announcement.findMany({
    where: {
      isPublished: true,
      OR: [{ expiryDate: null }, { expiryDate: { gt: now } }],
    },
    orderBy: { publishedAt: "desc" },
  });

  const sorted = rows
    .slice()
    .sort((a, b) => {
      const rankDiff = (PRIORITY_RANK[a.priority] ?? 99) - (PRIORITY_RANK[b.priority] ?? 99);
      if (rankDiff !== 0) return rankDiff;
      return (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0);
    })
    .slice(0, 5);

  return NextResponse.json(sorted);
}
