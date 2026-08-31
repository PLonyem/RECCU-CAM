import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { DEFAULT_EMAIL_TEMPLATES } from "@/lib/notification-settings";

const templateSchema = z.object({
  name: z.string().min(1),
  subject: z.string().trim().min(1, "Template subject is required."),
  body: z.string().trim().min(1, "Template body is required."),
  variables: z.array(z.string()),
});

const notificationSettingsSchema = z.object({
  adminNotificationEmail: z.string().trim().email("Enter a valid notification email."),
  newCreditUnionCreated: z.boolean(),
  profileSubmittedForReview: z.boolean(),
  profileUpdated: z.boolean(),
  contactFormMessage: z.boolean(),
  accountCredentialsEmail: z.literal(true, {
    errorMap: () => ({ message: "Account credentials email cannot be disabled." }),
  }),
  profileSubmissionConfirmation: z.boolean(),
  profileApprovedEmail: z.boolean(),
  profileRejectedEmail: z.boolean(),
  emailTemplates: z.record(z.string(), templateSchema),
});

async function isAdmin() {
  const { userId, sessionClaims } = await auth();
  return Boolean(userId && sessionClaims?.metadata?.role === "admin");
}

function getSettings() {
  return prisma.notificationSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      emailTemplates: DEFAULT_EMAIL_TEMPLATES as unknown as Prisma.InputJsonValue,
    },
  });
}

function serializeSettings(settings: Awaited<ReturnType<typeof getSettings>>) {
  const savedTemplates =
    settings.emailTemplates && typeof settings.emailTemplates === "object" && !Array.isArray(settings.emailTemplates)
      ? settings.emailTemplates
      : {};
  return {
    adminNotificationEmail: settings.adminNotificationEmail,
    newCreditUnionCreated: settings.newCreditUnionCreated,
    profileSubmittedForReview: settings.profileSubmittedForReview,
    profileUpdated: settings.profileUpdated,
    contactFormMessage: settings.contactFormMessage,
    accountCredentialsEmail: true,
    profileSubmissionConfirmation: settings.profileSubmissionConfirmation,
    profileApprovedEmail: settings.profileApprovedEmail,
    profileRejectedEmail: settings.profileRejectedEmail,
    emailTemplates: { ...DEFAULT_EMAIL_TEMPLATES, ...savedTemplates },
  };
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(serializeSettings(await getSettings()));
}

export async function PUT(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = notificationSettingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid settings", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = {
    ...parsed.data,
    emailTemplates: parsed.data.emailTemplates as unknown as Prisma.InputJsonValue,
  };
  const settings = await prisma.notificationSettings.upsert({
    where: { id: "default" },
    create: { id: "default", ...data },
    update: data,
  });
  return NextResponse.json(serializeSettings(settings));
}
