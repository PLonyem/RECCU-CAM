import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getContactPurpose } from "@/data/contact";
import { contactMessageSchema, normalizeContactPhone } from "@/lib/validation/contact";
import {
  acceptedSubmissionResponse,
  isLikelyAutomatedSubmission,
} from "@/lib/validation/form-security";
import { sendContactFormNotification } from "@/lib/email";
import { enforceRateLimit, readBoundedJson } from "@/lib/security/request";
import { reportServerError } from "@/lib/security/logging";

// Public endpoint — the site's contact form, not an admin route. No auth
// check by design. The same schema is used by the client for inline feedback
// and repeated here as the authoritative security boundary.
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
  const purpose = getContactPurpose(message.purpose);
  const normalizedPhone = normalizeContactPhone(message.phone);

  try {
    await prisma.contactMessage.create({
      data: {
        name: message.fullName,
        phone: normalizedPhone,
        email: message.email || null,
        organization: message.organization || null,
        role: message.role || null,
        purpose: purpose.value,
        department: purpose.department,
        subject: message.subject,
        message: message.message,
        consent: message.consent,
        status: "new",
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
    await sendContactFormNotification({
      name: message.fullName,
      contact: message.email || normalizedPhone,
      email: message.email || "Not provided",
      purpose: purpose.label,
      department: purpose.department,
      subject: message.subject,
    });
  } catch (error) {
    reportServerError("contact.notification_failed", error);
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
