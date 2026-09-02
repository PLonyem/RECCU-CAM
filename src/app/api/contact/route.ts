import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactMessageSchema } from "@/lib/validation/contact";
import {
  acceptedSubmissionResponse,
  isLikelyAutomatedSubmission,
} from "@/lib/validation/form-security";
import { sendContactFormNotification } from "@/lib/email";
import { enforceRateLimit, readBoundedJson } from "@/lib/security/request";
import { reportServerError } from "@/lib/security/logging";

// Public endpoint — the site's contact form, not an admin route. No auth
// check by design; mirrors the same min-length rules as the client-side
// form validation as a defense-in-depth backstop.
export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, {
    scope: "contact",
    limit: 5,
    windowMs: 10 * 60_000,
  });
  if (limited) return limited;

  const bodyResult = await readBoundedJson(request);
  if (!bodyResult.ok) return bodyResult.response;
  const body = bodyResult.data;

  if (isLikelyAutomatedSubmission(body)) {
    return NextResponse.json(acceptedSubmissionResponse, { status: 201 });
  }

  const parsed = contactMessageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const message = parsed.data;

  try {
    await prisma.contactMessage.create({
      data: {
        name: message.name,
        email: message.email,
        phone: message.phone || null,
        subject: message.subject,
        message: message.message,
      },
    });
  } catch (error) {
    reportServerError("contact.store_failed", error);
    return NextResponse.json(
      { error: "The contact service is temporarily unavailable. Please try again later." },
      { status: 503 },
    );
  }

  try {
    await sendContactFormNotification(message.email);
  } catch (error) {
    reportServerError("contact.notification_failed", error);
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
