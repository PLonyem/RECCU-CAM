import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAffiliateSession } from "@/lib/auth/affiliate-context";
import { portalBankingInquirySchema } from "@/lib/validation/portal";
import { readBoundedJson } from "@/lib/security/request";

function inquiryReference() {
  return `AB-${new Date().getUTCFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export async function POST(request: Request) {
  const session = await getAffiliateSession();
  if (!session) return NextResponse.json({ error: "Affiliate account configuration is incomplete." }, { status: 403 });
  const body = await readBoundedJson(request);
  if (!body.ok) return body.response;
  const parsed = portalBankingInquirySchema.safeParse(body.data);
  if (!parsed.success) return NextResponse.json({ error: "Review the submitted inquiry.", details: parsed.error.flatten() }, { status: 400 });
  const affiliate = await prisma.affiliate.findUnique({ where: { id: session.affiliateId } });
  if (!affiliate) return NextResponse.json({ error: "Affiliate record not found." }, { status: 404 });
  const inquiry = await prisma.affiliateBankingInquiry.create({
    data: {
      reference: inquiryReference(), affiliateId: affiliate.id, institution: affiliate.name,
      contactPerson: session.metadata.affiliateName ?? affiliate.name, email: affiliate.email ?? "Not provided",
      phone: affiliate.phone ?? "Not provided", role: "Authorized affiliate user", city: affiliate.city ?? affiliate.region,
      supportCategory: parsed.data.subject, message: parsed.data.message,
    },
  });
  return NextResponse.json({ id: inquiry.id, reference: inquiry.reference, status: inquiry.status }, { status: 201 });
}
