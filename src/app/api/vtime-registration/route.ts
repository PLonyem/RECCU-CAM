import { NextResponse } from "next/server";
import { getTrainingProgramBySlug } from "@/data/training-programs";
import { sendContactFormNotification } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import {
  acceptedSubmissionResponse,
  isLikelyAutomatedSubmission,
} from "@/lib/validation/form-security";
import { vtimeRegistrationSchema } from "@/lib/validation/vtime-registration";
import { enforceRateLimit, readBoundedJson } from "@/lib/security/request";
import { reportServerError } from "@/lib/security/logging";

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
  const program = getTrainingProgramBySlug(registration.program);
  if (!program) {
    return NextResponse.json({ error: "Select a valid VTIME program." }, { status: 400 });
  }

  const message = [
    `Participant: ${registration.participantName}`,
    `Institution: ${registration.institution}`,
    `Role: ${registration.role}`,
    `Program: ${program.title}`,
    `Program slug: ${program.slug}`,
    "",
    registration.notes || "No additional notes provided.",
  ].join("\n");

  try {
    await prisma.contactMessage.create({
      data: {
        name: registration.participantName,
        email: registration.email,
        phone: registration.phone,
        subject: `VTIME registration — ${program.title}`,
        message,
      },
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
