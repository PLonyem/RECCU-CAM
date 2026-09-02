import { NextResponse } from "next/server";
import { sendContactFormNotification } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import {
  affiliateBankingInquirySchema,
  getAffiliateStatusLabel,
  getSupportCategoryLabel,
} from "@/lib/validation/affiliate-banking";
import {
  acceptedSubmissionResponse,
  isLikelyAutomatedSubmission,
} from "@/lib/validation/form-security";
import { enforceRateLimit, readBoundedJson } from "@/lib/security/request";
import { reportServerError } from "@/lib/security/logging";

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, {
    scope: "affiliate-banking-inquiry",
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

  const parsed = affiliateBankingInquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Review the highlighted fields.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const inquiry = parsed.data;
  const category = getSupportCategoryLabel(inquiry.supportCategory);
  const message = [
    `Institution: ${inquiry.institution}`,
    `Affiliate status: ${getAffiliateStatusLabel(inquiry.affiliateStatus)}`,
    `Contact person: ${inquiry.contactPerson}`,
    `Role: ${inquiry.role}`,
    `City: ${inquiry.city}`,
    `Support category: ${category}`,
    "",
    inquiry.message,
  ].join("\n");

  try {
    await prisma.contactMessage.create({
      data: {
        name: inquiry.contactPerson,
        email: inquiry.email,
        phone: inquiry.phone,
        subject: `Affiliate Banking inquiry — ${category}`,
        message,
      },
    });
  } catch (error) {
    reportServerError("affiliate-banking-inquiry.store_failed", error);
    return NextResponse.json(
      { error: "The inquiry service is temporarily unavailable. Please try again later." },
      { status: 503 },
    );
  }

  try {
    await sendContactFormNotification(inquiry.email);
  } catch (error) {
    reportServerError("affiliate-banking-inquiry.notification_failed", error);
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
