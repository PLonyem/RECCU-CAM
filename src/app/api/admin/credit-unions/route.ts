import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { CAMCCUL_REGION_STRUCTURE, regionNameToCode } from "@/lib/chapters";
import { extractClerkErrorMessage } from "@/lib/clerk-admin-utils";
import { sendCreditUnionCredentials, sendNewCreditUnionCreatedToCamCCUL } from "@/lib/email";

const createCreditUnionSchema = z.object({
  name: z.string().trim().min(3, "Credit union name is required."),
  code: z.string().trim().min(2, "Code is required.").max(30).transform((value) => value.toUpperCase()),
  regionId: z.string().min(1, "Select a region."),
  chapterId: z.string().min(1, "Select a chapter."),
  city: z.string().trim().max(120).optional(),
  address: z.string().trim().max(240).optional(),
  phone: z.string().trim().max(50).optional(),
  email: z.string().trim().email("Enter a valid login email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

async function requireAdmin() {
  const { userId, sessionClaims } = await auth();
  return Boolean(userId && sessionClaims?.metadata?.role === "admin");
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [regions, clerk] = await Promise.all([
    prisma.region.findMany({ include: { chapters: { include: { affiliates: { orderBy: { name: "asc" } } } } } }),
    clerkClient(),
  ]);
  const { data: users } = await clerk.users.getUserList({ limit: 500 });
  const userByAffiliate = new Map<string, (typeof users)[number]>();
  for (const user of users) {
    const metadata = user.publicMetadata as { role?: string; affiliateId?: string };
    if (metadata.role === "credit_union" && metadata.affiliateId) userByAffiliate.set(metadata.affiliateId, user);
  }

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
            const user = userByAffiliate.get(affiliate.id);
            return {
              id: affiliate.id,
              code: affiliate.code,
              name: affiliate.name,
              email: user?.primaryEmailAddress?.emailAddress ?? affiliate.email,
              status: user ? (user.banned || user.locked ? "Inactive" : "Active") : "No Account",
              profileStatus: affiliate.profileStatus,
            };
          }),
        })),
    }));

  return NextResponse.json({ regions: hierarchy });
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createCreditUnionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const chapter = await prisma.chapter.findFirst({
    where: { id: data.chapterId, regionId: data.regionId },
    include: { region: true },
  });
  if (!chapter) return NextResponse.json({ error: "The selected chapter does not belong to that region." }, { status: 400 });

  const clerk = await clerkClient();
  const [existingAffiliate, existingUsers] = await Promise.all([
    prisma.affiliate.findUnique({ where: { code: data.code } }),
    clerk.users.getUserList({ emailAddress: [data.email] }),
  ]);
  if (existingAffiliate) return NextResponse.json({ error: `Code ${data.code} is already in use.` }, { status: 409 });
  if (existingUsers.data.length > 0) return NextResponse.json({ error: "That login email already has an account." }, { status: 409 });

  const affiliate = await prisma.affiliate.create({
    data: {
      code: data.code,
      name: data.name,
      chapterId: chapter.id,
      chapterName: chapter.name,
      region: regionNameToCode(chapter.region.name),
      city: data.city || null,
      address: data.address || null,
      phone: data.phone || null,
      email: data.email,
      isActive: true,
    },
  });

  try {
    await clerk.users.createUser({
      emailAddress: [data.email],
      password: data.password,
      publicMetadata: {
        role: "credit_union",
        affiliateId: affiliate.id,
        affiliateName: affiliate.name,
        affiliateCode: affiliate.code,
        region: chapter.region.name,
        chapter: chapter.name,
      },
    });
  } catch (error) {
    await prisma.affiliate.delete({ where: { id: affiliate.id } }).catch(() => undefined);
    return NextResponse.json({ error: extractClerkErrorMessage(error) ?? "Could not create the login account." }, { status: 502 });
  }

  let emailSent = true;
  try {
    await sendCreditUnionCredentials({ creditUnionName: affiliate.name, email: data.email, password: data.password, chapter: chapter.name });
  } catch (error) {
    emailSent = false;
    console.error("Credit union credentials email failed:", error);
  }

  try {
    await sendNewCreditUnionCreatedToCamCCUL({ creditUnionName: affiliate.name, email: data.email, chapter: chapter.name });
  } catch (error) {
    console.error("New credit union admin notification failed:", error);
  }

  return NextResponse.json({ success: true, affiliateId: affiliate.id, emailSent }, { status: 201 });
}
