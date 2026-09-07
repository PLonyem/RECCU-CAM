import { NextResponse } from "next/server";
import { sendContactFormNotification } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import {
  acceptedSubmissionResponse,
  isLikelyAutomatedSubmission,
} from "@/lib/validation/form-security";
import { vtimeRegistrationSchema } from "@/lib/validation/vtime-registration";
import { enforceRateLimit, readBoundedJson } from "@/lib/security/request";
import { reportServerError } from "@/lib/security/logging";
import { createIncomingContactMessageRecord } from "@/lib/message-service";

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, {
    scope: "vtime-registration",
    limit: 10,
    windowMs: 10 * 60_000,
  });
  if (limited) return limited;

  const bodyResult = await readBoundedJson(request);
  if (!bodyResult.ok) return bodyResult.response;
  const body = bodyResult.data;

  if (isLikelyAutomatedSubmission(body)) {
    return NextResponse.json(acceptedSubmissionResponse, { status: 201 });
  }

  const parsed = vtimeRegistrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Review the highlighted fields.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const registration = parsed.data;
  try {
    const publishedProgram = await prisma.trainingProgram.findFirst({
      where: { slug: registration.program, published: true },
    });
    if (!publishedProgram) {
      return NextResponse.json({ error: "Select a valid published VTIME program." }, { status: 400 });
    }

    const message = [
      `Participant: ${registration.participantName}`,
      `Institution: ${registration.institution}`,
      `Role: ${registration.role}`,
      `Program: ${publishedProgram.title}`,
      `Program slug: ${publishedProgram.slug}`,
      "",
      registration.notes || "No additional notes provided.",
    ].join("\n");

    await prisma.$transaction(async (tx) => {
      await tx.trainingRegistration.create({
        data: {
          programId: publishedProgram.id,
          participantName: registration.participantName,
          institution: registration.institution,
          role: registration.role,
          email: registration.email,
          phone: registration.phone,
          notes: registration.notes,
        },
      });
      await createIncomingContactMessageRecord(tx, {
        name: registration.participantName,
        email: registration.email,
        phone: registration.phone,
        organization: registration.institution,
        role: registration.role,
        purpose: "training-vtime",
        department: "VTIME Training",
        subject: `VTIME registration — ${publishedProgram.title}`,
        message,
        consent: false,
      });
    });
  } catch (error) {
    reportServerError("vtime-registration.store_failed", error);
    return NextResponse.json(
      { error: "The registration service is temporarily unavailable. Please try again later." },
      { status: 503 },
    );
  }

  try {
    await sendContactFormNotification(registration.email);
  } catch (error) {
    reportServerError("vtime-registration.notification_failed", error);
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
