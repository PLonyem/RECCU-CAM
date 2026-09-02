import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { simulateLoan, validateLoanPolicy } from "@/lib/loan-calculator/engine";
import { resolveLoanPolicy } from "@/lib/loan-calculator/policy";
import { simulationRequestSchema } from "@/lib/loan-calculator/validation";
import type { Prisma } from "@/generated/prisma/client";
import { enforceRateLimit, readBoundedJson } from "@/lib/security/request";

function simulationReference() {
  const year = new Date().getUTCFullYear().toString().slice(-2);
  const random = crypto.randomUUID().replaceAll("-", "").slice(0, 5).toUpperCase();
  return `CAM-${year}-${random}`;
}

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, {
    scope: "loan-simulation",
    limit: 20,
    windowMs: 60_000,
  });
  if (limited) return limited;
  const bodyResult = await readBoundedJson(request);
  if (!bodyResult.ok) return bodyResult.response;
  const body = bodyResult.data;
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
