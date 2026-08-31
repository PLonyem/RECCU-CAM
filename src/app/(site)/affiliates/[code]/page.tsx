import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { affiliates as mockAffiliates } from "@/lib/mock-data";
import {
  ChapterProfileClient,
  type ChapterDetail,
  type MemberCreditUnionEntry,
} from "./ChapterProfileClient";

interface ChapterPageProps {
  params: Promise<{ code: string }>;
}

// Chapters can be added, edited, or deactivated by an admin at any time, so
// this route must always hit the database fresh — mirrors the same
// force-dynamic reasoning used by the news article detail route.
export const dynamic = "force-dynamic";

// The memberCreditUnions column is a loosely-typed Json field, so its
// contents are validated defensively on read rather than trusted as-is —
// a malformed or partially-written value degrades to an empty list
// instead of crashing the page.
function parseMemberCreditUnions(value: unknown): MemberCreditUnionEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (entry): entry is MemberCreditUnionEntry =>
      typeof entry === "object" &&
      entry !== null &&
      typeof (entry as Record<string, unknown>).name === "string" &&
      typeof (entry as Record<string, unknown>).code === "string"
  );
}

async function getAffiliateByCode(code: string): Promise<ChapterDetail | null> {
  try {
    const affiliate = await prisma.affiliate.findUnique({
      where: { code },
      select: {
        id: true,
        code: true,
        name: true,
        region: true,
        city: true,
        address: true,
        phone: true,
        email: true,
        isActive: true,
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
        profileStatus: true,
      },
    });
    if (!affiliate || !affiliate.isActive) return null;
    return {
      ...affiliate,
      memberCreditUnions: parseMemberCreditUnions(affiliate.memberCreditUnions),
    };
  } catch (error) {
    console.error(
      "Database unavailable, falling back to mock affiliate data:",
      error
    );
    const mock = mockAffiliates.find((a) => a.code === code);
    if (!mock || !mock.isActive) return null;
    return {
      id: mock.id,
      code: mock.code,
      name: mock.name,
      region: mock.region,
      city: mock.city,
      address: mock.address,
      phone: mock.phone,
      email: mock.email,
      // Chapter profile fields have no mock-data equivalent yet — the
      // profile page treats all of these as "not yet available" in the
      // DB-unavailable fallback path, same as it always has.
      yearEstablished: null,
      briefHistory: null,
      totalMembers: null,
      branchCount: null,
      memberCreditUnionCount: null,
      services: [],
      chapterPresident: null,
      chapterSupervisor: null,
      boardSize: null,
      staffCount: null,
      memberCreditUnions: [],
      profileStatus: null,
    };
  }
}

export async function generateMetadata({ params }: ChapterPageProps): Promise<Metadata> {
  const { code } = await params;
  const affiliate = await getAffiliateByCode(code);

  if (!affiliate) {
    return { title: "Chapter Not Found — CamCCUL" };
  }

  return {
    title: `${affiliate.name} — CamCCUL`,
    description: `Chapter profile for ${affiliate.name} in the ${affiliate.region} region.`,
  };
}

export default async function ChapterProfilePage({ params }: ChapterPageProps) {
  const { code } = await params;
  const affiliate = await getAffiliateByCode(code);

  return <ChapterProfileClient affiliate={affiliate} requestedCode={code} />;
}
