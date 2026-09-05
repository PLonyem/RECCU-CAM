import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAffiliateSession } from "@/lib/auth/affiliate-context";
import { supportTicketSchema } from "@/lib/validation/portal";
import { readBoundedJson } from "@/lib/security/request";

function ticketReference() {
  return `SUP-${new Date().getUTCFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export async function POST(request: Request) {
  const session = await getAffiliateSession();
  if (!session) return NextResponse.json({ error: "Affiliate account configuration is incomplete." }, { status: 403 });
  const body = await readBoundedJson(request);
  if (!body.ok) return body.response;
  const parsed = supportTicketSchema.safeParse(body.data);
  if (!parsed.success) return NextResponse.json({ error: "Review the submitted request.", details: parsed.error.flatten() }, { status: 400 });
  const ticket = await prisma.supportTicket.create({ data: { ...parsed.data, reference: ticketReference(), affiliateId: session.affiliateId, submittedBy: session.userId } });
  return NextResponse.json({ id: ticket.id, reference: ticket.reference, status: ticket.status }, { status: 201 });
}
