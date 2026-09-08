import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerLanguage } from "@/lib/i18n-server";
import { localizeHomepageContent } from "@/lib/localized-content";

// Public — feeds the live homepage (once it's wired to read from here) as
// well as the admin editor's initial fetch. The "default" row always
// exists (seeded in prisma/seed.ts), but upsert as a safety net rather than
// 404ing the homepage if it's ever missing.
export async function GET() {
  const language = await getServerLanguage();
  const content = await prisma.homepageContent.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });

  return NextResponse.json(localizeHomepageContent(content, language), {
    headers: { "Cache-Control": "private, no-store", Vary: "Cookie" },
  });
}
