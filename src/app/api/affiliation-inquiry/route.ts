import { NextResponse } from "next/server";
import { sendContactFormNotification } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { affiliationInquirySchema } from "@/lib/validation/affiliation-inquiry";
import {
  acceptedSubmissionResponse,
  isLikelyAutomatedSubmission,
} from "@/lib/validation/form-security";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (isLikelyAutomatedSubmission(body)) {
    return NextResponse.json(acceptedSubmissionResponse, { status: 201 });
  }

  const parsed = affiliationInquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Review the highlighted fields.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const inquiry = parsed.data;
  const message = [
    `Institution: ${inquiry.institution}`,
    `City: ${inquiry.city}`,
    `Contact person: ${inquiry.contactPerson}`,
    `Role: ${inquiry.role}`,
    "",
    inquiry.message,
  ].join("\n");

  try {
    await prisma.contactMessage.create({
      data: {
        name: inquiry.contactPerson,
        email: inquiry.email,
        phone: inquiry.phone,
        subject: `Affiliation inquiry — ${inquiry.institution}`,
        message,
      },
    });
  } catch (error) {
    console.error("Affiliation inquiry could not be stored:", error);
    return NextResponse.json(
      { error: "The inquiry service is temporarily unavailable. Please try again later." },
      { status: 503 },
    );
  }

  try {
    await sendContactFormNotification(inquiry.email);
  } catch (error) {
    console.error("Affiliation inquiry notification failed:", error);
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
