import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { AUTH_PERMISSIONS, hasPermission, normalizeAuthRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";
import { processHomepageSave, type HomepageSaveIntent } from "@/lib/homepage-content-save";
import { writeAuditLog } from "@/lib/audit";
import { reportServerError } from "@/lib/security/logging";
import { Prisma } from "@/generated/prisma/client";

async function requireContentStaff() {
  const { userId, sessionClaims } = await auth();
  const role = normalizeAuthRole(sessionClaims?.metadata?.role);
  return userId && role && hasPermission(role, AUTH_PERMISSIONS.manageContent) ? { userId, role } : null;
}

export async function GET() {
  const actor = await requireContentStaff();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const content = await prisma.homepageContent.upsert({ where: { id: "default" }, update: {}, create: { id: "default" } });
  const draft = content.draftContent && typeof content.draftContent === "object" && !Array.isArray(content.draftContent) ? content.draftContent : {};
  const published = {
    heroBadge: content.heroBadge,
    heroTitle: content.heroTitle,
    heroSubtitle: content.heroSubtitle,
    primaryButtonText: content.primaryButtonText,
    primaryButtonLink: content.primaryButtonLink,
    secondaryButtonText: content.secondaryButtonText,
    secondaryButtonLink: content.secondaryButtonLink,
    heroImages: content.heroImages,
    statsAffiliates: content.statsAffiliates,
    statsMembers: content.statsMembers,
    statsAssets: content.statsAssets,
    showOverlay: content.showOverlay,
    overlayColor: content.overlayColor,
    overlayOpacity: content.overlayOpacity,
    backgroundColor: content.backgroundColor,
    gradientDirection: content.gradientDirection,
    textAlignment: content.textAlignment,
    buttonStyle: content.buttonStyle,
    showHero: content.showHero,
    showStats: content.showStats,
    showMission: content.showMission,
    showServices: content.showServices,
    showReach: content.showReach,
    showNews: content.showNews,
  };
  return NextResponse.json({ ...published, ...draft });
}

export async function PUT(request: NextRequest) {
  const actor = await requireContentStaff();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const mode = request.nextUrl.searchParams.get("mode");
  if (mode !== "draft" && mode !== "publish") {
    return NextResponse.json({ error: "Choose Save Draft or Publish." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const result = await processHomepageSave(body, mode, {
    persist: async (intent, data) => intent === "draft"
      ? prisma.homepageContent.upsert({
          where: { id: "default" },
          update: { draftContent: data as Prisma.InputJsonValue, publicationStatus: "draft" },
          create: { id: "default", draftContent: data as Prisma.InputJsonValue, publicationStatus: "draft" },
        })
      : prisma.homepageContent.upsert({
          where: { id: "default" },
          update: { ...data, draftContent: Prisma.JsonNull, publicationStatus: "published", publishedAt: new Date(), publishedBy: actor.userId },
          create: { id: "default", ...data, publicationStatus: "published", publishedAt: new Date(), publishedBy: actor.userId },
        }),
    audit: (intent: HomepageSaveIntent, content) => writeAuditLog({
      actorId: actor.userId,
      actorRole: actor.role,
      action: intent === "draft" ? "homepage_draft_saved" : "homepage_published",
      resource: "homepage",
      resourceId: content.id,
    }),
    revalidatePublishedHomepage: () => revalidatePath("/"),
  });

  if (!result.success) {
    if (result.kind === "validation") {
      return NextResponse.json(
        { success: false, error: "Review the highlighted fields.", errors: result.errors, details: { fieldErrors: result.errors } },
        { status: 400 },
      );
    }
    reportServerError("homepage.save_failed", result.cause);
    return NextResponse.json({ success: false, error: "Unable to save changes." }, { status: 500 });
  }

  return NextResponse.json({ ...result.saved, ...result.data });
}
