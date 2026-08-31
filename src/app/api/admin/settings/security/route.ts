import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const securitySettingsSchema = z.object({
  minimumPasswordLength: z.union([z.literal(8), z.literal(10), z.literal(12), z.literal(14)]),
  requireNumbers: z.boolean(),
  requireSpecialCharacters: z.boolean(),
  passwordExpiryDays: z.number().int().min(0).max(3650),
  sessionTimeoutMinutes: z.number().int().min(5).max(1440),
  maximumFailedAttempts: z.number().int().min(1).max(20),
  lockoutDurationMinutes: z.number().int().min(1).max(1440),
});

async function isAdmin() {
  const { userId, sessionClaims } = await auth();
  return Boolean(userId && sessionClaims?.metadata?.role === "admin");
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await prisma.adminSecuritySettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = securitySettingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid security settings" },
      { status: 400 }
    );
  }
  const settings = await prisma.adminSecuritySettings.upsert({
    where: { id: "default" },
    create: { id: "default", ...parsed.data },
    update: parsed.data,
  });
  return NextResponse.json(settings);
}
