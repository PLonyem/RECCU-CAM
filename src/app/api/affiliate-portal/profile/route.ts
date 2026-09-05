import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAffiliateSession } from "@/lib/auth/affiliate-context";
import { affiliateUpdateRequestSchema } from "@/lib/validation/portal";
import { readBoundedJson } from "@/lib/security/request";
import type { Prisma } from "@/generated/prisma/client";

export async function POST(request: Request) {
  const session = await getAffiliateSession();
  if (!session) return NextResponse.json({ error: "Affiliate account configuration is incomplete." }, { status: 403 });
  const body = await readBoundedJson(request);
  if (!body.ok) return body.response;
  const parsed = affiliateUpdateRequestSchema.safeParse(body.data);
  if (!parsed.success) return NextResponse.json({ error: "Review the highlighted fields.", details: parsed.error.flatten() }, { status: 400 });
  const requestedData = Object.fromEntries(Object.entries(parsed.data).filter(([, value]) => value));
  if (!Object.keys(requestedData).length) return NextResponse.json({ error: "Enter at least one requested change." }, { status: 400 });
  const updateRequest = await prisma.affiliateUpdateRequest.create({
    data: { affiliateId: session.affiliateId, submittedBy: session.userId, requestedData: requestedData as Prisma.InputJsonValue },
  });
  return NextResponse.json({ id: updateRequest.id, status: updateRequest.status }, { status: 201 });
}
