import { NextResponse } from "next/server";
import { getTrainingProgramBySlug } from "@/data/training-programs";
import { sendContactFormNotification } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import {
  acceptedSubmissionResponse,
  isLikelyAutomatedSubmission,
} from "@/lib/validation/form-security";
import { vtimeRegistrationSchema } from "@/lib/validation/vtime-registration";

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
    console.error("VTIME registration could not be stored:", error);
    return NextResponse.json(
      { error: "The registration service is temporarily unavailable. Please try again later." },
      { status: 503 },
    );
  }

  try {
    await sendContactFormNotification(registration.email);
  } catch (error) {
    console.error("VTIME registration notification failed:", error);
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
