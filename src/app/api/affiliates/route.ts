import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CAMCCUL_REGION_STRUCTURE } from "@/lib/chapters";

// Public directory endpoint — no auth. Profile content (history, contact
// details, leadership, services) is only included once profileStatus is
// "approved"; unapproved submissions never leave the server, not just
// hidden client-side, since a rejected draft could contain content the
// chapter doesn't want public yet.
export async function GET() {
  try {
    const regions = await prisma.region.findMany({
      include: {
        chapters: {
          include: {
            affiliates: {
              where: { isActive: true },
              orderBy: { name: "asc" },
            },
          },
        },
      },
    });

    const regionOrder = new Map<string, number>(CAMCCUL_REGION_STRUCTURE.map((region, index) => [region.name, index]));
    const chapterOrder = new Map<string, number>(CAMCCUL_REGION_STRUCTURE.flatMap((region) =>
      region.chapters.map((chapter, index) => [`${region.name}:${chapter}`, index])
    ));
    const hierarchy = regions
      .sort((a, b) => (regionOrder.get(a.name) ?? 99) - (regionOrder.get(b.name) ?? 99))
      .map((region) => ({
        id: region.id,
        name: region.name,
        chapters: region.chapters
          .sort((a, b) => (chapterOrder.get(`${region.name}:${a.name}`) ?? 99) - (chapterOrder.get(`${region.name}:${b.name}`) ?? 99))
          .map((chapter) => ({
            id: chapter.id,
            name: chapter.name,
            creditUnions: chapter.affiliates.map((affiliate) => {
              const isApproved = affiliate.profileStatus === "approved";
              return {
                id: affiliate.id,
                code: affiliate.code,
                name: affiliate.name,
                regionId: region.id,
                regionName: region.name,
                chapterId: chapter.id,
                chapterName: chapter.name,
                city: affiliate.city,
                profileStatus: affiliate.profileStatus,
                hasSubmittedProfile: affiliate.profileUpdatedAt !== null,
                address: isApproved ? affiliate.address : null,
                phone: isApproved ? affiliate.phone : null,
                email: isApproved ? affiliate.email : null,
                yearEstablished: isApproved ? affiliate.yearEstablished : null,
                briefHistory: isApproved ? affiliate.briefHistory : null,
                totalMembers: isApproved ? affiliate.totalMembers : null,
                branchCount: isApproved ? affiliate.branchCount : null,
                services: isApproved ? affiliate.services : [],
                chapterPresident: isApproved ? affiliate.chapterPresident : null,
                chapterSupervisor: isApproved ? affiliate.chapterSupervisor : null,
                boardSize: isApproved ? affiliate.boardSize : null,
                staffCount: isApproved ? affiliate.staffCount : null,
              };
            }),
          })),
      }));

    return NextResponse.json({ regions: hierarchy, source: "database" });
  } catch (error) {
    console.error("Database unavailable while loading affiliate hierarchy:", error);
    return NextResponse.json({
      regions: CAMCCUL_REGION_STRUCTURE.map((region, regionIndex) => ({
        id: `fallback-region-${regionIndex}`,
        name: region.name,
        chapters: region.chapters.map((chapter, chapterIndex) => ({
          id: `fallback-chapter-${regionIndex}-${chapterIndex}`,
          name: chapter,
          creditUnions: [],
        })),
      })),
      source: "fallback",
    });
  }
}
