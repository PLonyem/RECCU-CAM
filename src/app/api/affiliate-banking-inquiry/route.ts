import { NextResponse } from "next/server";
import { sendContactFormNotification } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import {
  affiliateBankingInquirySchema,
  getAffiliateStatusLabel,
  getSupportCategoryLabel,
} from "@/lib/validation/affiliate-banking";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
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
    console.error("Affiliate Banking inquiry could not be stored:", error);
    return NextResponse.json(
      { error: "The inquiry service is temporarily unavailable. Please try again later." },
      { status: 503 },
    );
  }

  try {
    await sendContactFormNotification(inquiry.email);
  } catch (error) {
    console.error("Affiliate Banking inquiry notification failed:", error);
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
