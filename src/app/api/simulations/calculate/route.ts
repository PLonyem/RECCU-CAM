import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { simulateLoan, validateLoanPolicy } from "@/lib/loan-calculator/engine";
import { resolveLoanPolicy } from "@/lib/loan-calculator/policy";
import { simulationRequestSchema } from "@/lib/loan-calculator/validation";
import type { Prisma } from "@/generated/prisma/client";
import { checkSimulationRateLimit } from "@/lib/loan-calculator/rate-limit";

function simulationReference() {
  const year = new Date().getUTCFullYear().toString().slice(-2);
  const random = crypto.randomUUID().replaceAll("-", "").slice(0, 5).toUpperCase();
  return `CAM-${year}-${random}`;
}

export async function POST(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const rateLimit = checkSimulationRateLimit(forwardedFor || "anonymous");
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many simulation requests. Please wait and try again." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }
  const body = await request.json().catch(() => null);
  const parsed = simulationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid simulation details.", details: parsed.error.flatten() }, { status: 400 });
  }
  const { productId, affiliateId, language, ...input } = parsed.data;
  const policy = await resolveLoanPolicy(productId, affiliateId);
  if (!policy) {
    return NextResponse.json({ error: "This loan product does not currently have an active published policy." }, { status: 404 });
  }
  const policyErrors = validateLoanPolicy(policy, input);
  if (policyErrors.length) return NextResponse.json({ error: policyErrors[0], details: policyErrors }, { status: 400 });

  const result = simulateLoan(policy, input);
  const reference = simulationReference();
  await prisma.loanSimulation.create({
    data: {
      reference,
      loanProductId: policy.productId,
      loanProductVersionId: policy.productVersionId,
      affiliateId: policy.affiliateId,
      language,
      requestedAmount: input.requestedAmount,
      termMonths: input.termMonths,
      savingsBalance: input.savingsBalance,
      policySnapshot: policy as unknown as Prisma.InputJsonValue,
      inputSnapshot: input as unknown as Prisma.InputJsonValue,
      resultSnapshot: result as unknown as Prisma.InputJsonValue,
      eligibilityStatus: result.eligibilityStatus,
    },
  });
  return NextResponse.json({ reference, policy, result });
}
