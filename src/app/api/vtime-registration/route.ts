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
  const curriculumProgram = getTrainingProgramBySlug(registration.program);
  const publishedProgram = await prisma.trainingProgram.findFirst({ where: { slug: registration.program, published: true } });
  if (!curriculumProgram && !publishedProgram) {
    return NextResponse.json({ error: "Select a valid VTIME program." }, { status: 400 });
  }
  const programTitle = publishedProgram?.title ?? curriculumProgram!.title;
  const programSlug = publishedProgram?.slug ?? curriculumProgram!.slug;

  const message = [
    `Participant: ${registration.participantName}`,
    `Institution: ${registration.institution}`,
    `Role: ${registration.role}`,
    `Program: ${programTitle}`,
    `Program slug: ${programSlug}`,
    "",
    registration.notes || "No additional notes provided.",
  ].join("\n");

  try {
    const storedProgram = publishedProgram ?? await prisma.trainingProgram.upsert({
      where: { slug: curriculumProgram!.slug },
      update: {},
      create: {
        slug: curriculumProgram!.slug,
        title: curriculumProgram!.title,
        summary: curriculumProgram!.summary,
        category: curriculumProgram!.category,
        audience: [...curriculumProgram!.audience],
        level: curriculumProgram!.level,
        format: curriculumProgram!.format,
        venue: curriculumProgram!.location,
        startDate: curriculumProgram!.startDate ? new Date(`${curriculumProgram!.startDate}T00:00:00Z`) : null,
        endDate: curriculumProgram!.endDate ? new Date(`${curriculumProgram!.endDate}T00:00:00Z`) : null,
        capacity: curriculumProgram!.capacity,
        registrationStatus: curriculumProgram!.registrationStatus,
      },
    });
    await prisma.trainingRegistration.create({
      data: {
        programId: storedProgram.id,
        participantName: registration.participantName,
        institution: registration.institution,
        role: registration.role,
        email: registration.email,
        phone: registration.phone,
        notes: registration.notes,
      },
    });
    await prisma.contactMessage.create({
      data: {
        name: registration.participantName,
        email: registration.email,
        phone: registration.phone,
        organization: registration.institution,
        role: registration.role,
        purpose: "training",
        department: "VTIME Training",
        subject: `VTIME registration — ${programTitle}`,
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
