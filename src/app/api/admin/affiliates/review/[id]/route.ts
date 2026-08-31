import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { sendProfileApprovalEmail, sendProfileRejectedEmail } from "@/lib/email";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET/PUT here are both admin-only — distinct from the general-purpose
// PUT /api/admin/affiliates/[id], which a credit union session must never
// be able to reach either: that route accepts a raw profileStatus field,
// and without an admin-only gate a chapter could call it directly on its
// own affiliateId and self-approve, skipping review entirely.
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { userId, sessionClaims } = await auth();
  if (!userId || sessionClaims?.metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const affiliate = await prisma.affiliate.findUnique({ where: { id } });

  if (!affiliate) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(affiliate);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { userId, sessionClaims } = await auth();
  if (!userId || sessionClaims?.metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const action = body?.action;

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json(
      { error: 'action must be "approve" or "reject"' },
      { status: 400 }
    );
  }

  const existing = await prisma.affiliate.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const reason =
    action === "reject" && typeof body?.reason === "string" && body.reason.trim()
      ? body.reason.trim()
      : null;

  const affiliate = await prisma.affiliate.update({
    where: { id },
    data: {
      profileStatus: action === "approve" ? "approved" : "rejected",
      profileReviewNote: reason,
    },
  });

  // Closes out the submission this decision is actually about, for
  // SubmissionTimeline's history. Older affiliates approved/rejected
  // before this table existed simply have no rows to update — a no-op,
  // not an error.
  const latestSubmission = await prisma.affiliateSubmission.findFirst({
    where: { affiliateId: id, status: "pending" },
    orderBy: { submittedAt: "desc" },
  });
  if (latestSubmission) {
    await prisma.affiliateSubmission.update({
      where: { id: latestSubmission.id },
      data: {
        status: action === "approve" ? "approved" : "rejected",
        rejectionReason: reason,
      },
    });
  }

  if (action === "approve" || action === "reject") {
    const recipients = affiliate.email ? [affiliate.email] : [];

    const results = await Promise.allSettled(
      recipients.map((email) =>
        action === "approve"
          ? sendProfileApprovalEmail({ creditUnionName: affiliate.name, creditUnionEmail: email })
          : sendProfileRejectedEmail({
              creditUnionName: affiliate.name,
              creditUnionEmail: email,
              rejectionReason: reason ?? "Please contact CamCCUL for more information.",
            })
      )
    );
    for (const result of results) {
      if (result.status === "rejected") {
        console.error("Profile approval email failed:", result.reason);
      }
    }
  }

  return NextResponse.json(affiliate);
}
