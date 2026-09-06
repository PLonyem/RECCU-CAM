import "server-only";

import { prisma } from "@/lib/prisma";
import { readPublicData } from "@/lib/public-data";
import { mapPublicAffiliate } from "@/lib/data/public-content-mappers";

export async function getPublicAffiliates() {
  const records = await readPublicData(
    "published affiliates",
    () => prisma.affiliate.findMany({
      where: { isActive: true, profileStatus: "approved" },
      orderBy: { name: "asc" },
    }),
    [],
  );

  return records.map(mapPublicAffiliate);
}

export async function getPublicAffiliateBySlug(slug: string) {
  const affiliates = await getPublicAffiliates();
  return affiliates.find((affiliate) => affiliate.slug === slug) ?? null;
}
