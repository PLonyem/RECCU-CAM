import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactMessageSchema } from "@/lib/validation/contact";
import { sendContactFormNotification } from "@/lib/email";

// Public endpoint — the site's contact form, not an admin route. No auth
// check by design; mirrors the same min-length rules as the client-side
// form validation as a defense-in-depth backstop.
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = contactMessageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await prisma.contactMessage.create({
    data: { ...parsed.data, phone: parsed.data.phone || null },
  });

  try {
    await sendContactFormNotification(parsed.data.email);
  } catch (error) {
    console.error("Contact form notification failed:", error);
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
