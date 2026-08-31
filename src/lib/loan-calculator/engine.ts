import type {
  AffordabilityResult,
  AmortizationRow,
  AppliedCharge,
  LoanFeeRule,
  LoanSimulationInput,
  LoanSimulationResult,
  ResolvedLoanPolicy,
} from "./types";

const BASIS_POINTS_PER_PERCENT = 100;
const BASIS_POINTS_PER_WHOLE = 10_000;

function money(value: number): number {
  if (!Number.isFinite(value)) throw new Error("A financial value is not finite.");
  return Math.max(0, Math.round(value));
}

function percentage(amount: number, basisPoints: number): number {
  return money((amount * basisPoints) / BASIS_POINTS_PER_WHOLE);
}

export function calculateRequiredSavings(principal: number, requiredSavingsBasisPoints: number) {
  return percentage(principal, requiredSavingsBasisPoints);
}

export function calculateSavingsShortfall(requiredSavings: number, currentSavings: number) {
  return money(Math.max(0, requiredSavings - currentSavings));
}

export function calculateFlatInterest(
  principal: number,
  rateBasisPoints: number,
  termMonths: number,
  period: "annual" | "monthly"
) {
  const periods = period === "annual" ? termMonths / 12 : termMonths;
  return percentage(principal * periods, rateBasisPoints);
}

function monthlyRate(rateBasisPoints: number, period: "annual" | "monthly") {
  const decimalRate = rateBasisPoints / BASIS_POINTS_PER_WHOLE;
  return period === "annual" ? decimalRate / 12 : decimalRate;
}

export function calculateMonthlyPayment(
  principal: number,
  rateBasisPoints: number,
  termMonths: number,
  period: "annual" | "monthly"
) {
  if (termMonths <= 0) throw new Error("Repayment term must be greater than zero.");
  const rate = monthlyRate(rateBasisPoints, period);
  if (rate === 0) return money(principal / termMonths);
  return money((principal * rate) / (1 - Math.pow(1 + rate, -termMonths)));
}

function baseForRule(rule: LoanFeeRule, principal: number, interest: number) {
  if (rule.calculationBase === "interest") return interest;
  if (rule.calculationBase === "principal_and_interest") return principal + interest;
  return principal;
}

export function calculateFees(rules: LoanFeeRule[], principal: number, interest: number): AppliedCharge[] {
  return rules
    .filter((rule) => rule.active && principal >= (rule.principalThreshold ?? 0))
    .map((rule) => {
      const raw = rule.calculationType === "fixed"
        ? money(rule.amount ?? 0)
        : percentage(baseForRule(rule, principal, interest), rule.rateBasisPoints ?? 0);
      const withMinimum = Math.max(raw, rule.minimumAmount ?? 0);
      const bounded = rule.maximumAmount == null ? withMinimum : Math.min(withMinimum, rule.maximumAmount);
      return { id: rule.id, nameEn: rule.nameEn, nameFr: rule.nameFr, kind: rule.kind, amount: money(bounded) };
    });
}

function addMonths(date: Date, count: number) {
  const result = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  result.setUTCMonth(result.getUTCMonth() + count);
  return result.toISOString().slice(0, 10);
}

function distribute(total: number, count: number, index: number) {
  const base = Math.floor(total / count);
  return base + (index < total % count ? 1 : 0);
}

export function generateAmortizationSchedule(
  principal: number,
  rateBasisPoints: number,
  termMonths: number,
  period: "annual" | "monthly",
  method: "flat" | "reducing_balance",
  totalCharges = 0,
  firstPaymentDate = new Date().toISOString().slice(0, 10)
): AmortizationRow[] {
  const rows: AmortizationRow[] = [];
  let balance = money(principal);
  const rate = monthlyRate(rateBasisPoints, period);
  const flatTotalInterest = calculateFlatInterest(principal, rateBasisPoints, termMonths, period);
  const reducingPayment = calculateMonthlyPayment(principal, rateBasisPoints, termMonths, period);

  for (let index = 0; index < termMonths; index += 1) {
    const openingBalance = balance;
    const interest = method === "flat"
      ? distribute(flatTotalInterest, termMonths, index)
      : money(openingBalance * rate);
    const scheduledPrincipal = method === "flat"
      ? distribute(principal, termMonths, index)
      : Math.max(0, reducingPayment - interest);
    const principalPayment = index === termMonths - 1 ? openingBalance : Math.min(openingBalance, scheduledPrincipal);
    const fees = distribute(totalCharges, termMonths, index);
    balance = money(openingBalance - principalPayment);
    rows.push({
      paymentNumber: index + 1,
      paymentDate: addMonths(new Date(`${firstPaymentDate}T00:00:00.000Z`), index),
      openingBalance,
      principal: principalPayment,
      interest,
      fees,
      payment: principalPayment + interest + fees,
      closingBalance: balance,
    });
  }
  return rows;
}

export function calculateAffordability(
  profile: LoanSimulationInput["financialProfile"],
  monthlyPayment: number,
  configuredCeilingBasisPoints?: number
): AffordabilityResult {
  const supplied = !!profile && Object.values(profile).some((value) => value != null);
  if (!supplied) {
    return {
      supplied: false,
      totalMonthlyIncome: 0,
      existingCommitments: 0,
      estimatedNewLoanPayment: monthlyPayment,
      totalMonthlyDebtCommitments: 0,
      disposableIncome: 0,
      repaymentToIncomeBasisPoints: null,
      rating: "not_available",
    };
  }
  const income = money((profile?.monthlyNetIncome ?? 0) + (profile?.otherMonthlyIncome ?? 0));
  const existing = money(
    (profile?.existingLoanRepayments ?? 0) +
    (profile?.housingObligations ?? 0) +
    (profile?.otherCommitments ?? 0)
  );
  const totalCommitments = existing + monthlyPayment;
  const ratio = income > 0 ? money((totalCommitments / income) * BASIS_POINTS_PER_WHOLE) : null;
  const ceiling = configuredCeilingBasisPoints;
  const rating = ratio == null
    ? "high"
    : ceiling == null
      ? ratio <= 3_000 ? "comfortable" : ratio <= 4_500 ? "moderate" : "high"
      : ratio <= Math.round(ceiling * 0.75) ? "comfortable" : ratio <= ceiling ? "moderate" : "high";
  return {
    supplied: true,
    totalMonthlyIncome: income,
    existingCommitments: existing,
    estimatedNewLoanPayment: monthlyPayment,
    totalMonthlyDebtCommitments: totalCommitments,
    disposableIncome: income - totalCommitments,
    repaymentToIncomeBasisPoints: ratio,
    rating,
  };
}

export function validateLoanPolicy(policy: ResolvedLoanPolicy, input: LoanSimulationInput) {
  const errors: string[] = [];
  if (!Number.isInteger(input.requestedAmount) || input.requestedAmount < policy.minimumAmount) {
    errors.push(`Loan amount must be at least ${policy.minimumAmount}.`);
  }
  if (input.requestedAmount > policy.maximumAmount) errors.push(`Loan amount must not exceed ${policy.maximumAmount}.`);
  if (!policy.availableTerms.includes(input.termMonths)) errors.push("The selected repayment term is unavailable for this product.");
  if (!Number.isInteger(input.savingsBalance) || input.savingsBalance < 0) errors.push("Savings balance must be a non-negative whole FCFA amount.");
  return errors;
}

export function simulateLoan(policy: ResolvedLoanPolicy, input: LoanSimulationInput): LoanSimulationResult {
  const errors = validateLoanPolicy(policy, input);
  if (errors.length) throw new Error(errors.join(" "));

  const initialSchedule = generateAmortizationSchedule(
    input.requestedAmount,
    policy.interestRateBasisPoints,
    input.termMonths,
    policy.interestPeriod,
    policy.calculationMethod,
    0,
    input.firstPaymentDate
  );
  const totalInterest = initialSchedule.reduce((sum, row) => sum + row.interest, 0);
  const charges = calculateFees(policy.feeRules, input.requestedAmount, totalInterest);
  const totalFees = charges.filter((charge) => charge.kind === "fee").reduce((sum, charge) => sum + charge.amount, 0);
  const totalTaxes = charges.filter((charge) => charge.kind === "tax").reduce((sum, charge) => sum + charge.amount, 0);
  const totalInsurance = charges.filter((charge) => charge.kind === "insurance").reduce((sum, charge) => sum + charge.amount, 0);
  const totalCharges = totalFees + totalTaxes + totalInsurance;
  const schedule = generateAmortizationSchedule(
    input.requestedAmount,
    policy.interestRateBasisPoints,
    input.termMonths,
    policy.interestPeriod,
    policy.calculationMethod,
    totalCharges,
    input.firstPaymentDate
  );
  const requiredSavings = calculateRequiredSavings(input.requestedAmount, policy.requiredSavingsBasisPoints);
  const savingsGap = calculateSavingsShortfall(requiredSavings, input.savingsBalance);
  const monthlyPayment = Math.max(...schedule.map((row) => row.payment));
  const affordability = calculateAffordability(input.financialProfile, monthlyPayment, policy.affordabilityBasisPoints);
  const additionalInformation = affordability.supplied && affordability.totalMonthlyIncome <= 0;

  return {
    requestedAmount: input.requestedAmount,
    termMonths: input.termMonths,
    monthlyPayment,
    totalInterest,
    totalFees,
    totalTaxes,
    totalInsurance,
    totalCharges,
    borrowingCost: totalInterest + totalCharges,
    totalRepayment: input.requestedAmount + totalInterest + totalCharges,
    requiredSavings,
    savingsGap,
    savingsProgressBasisPoints: requiredSavings === 0
      ? BASIS_POINTS_PER_WHOLE
      : Math.min(BASIS_POINTS_PER_WHOLE, money((input.savingsBalance / requiredSavings) * BASIS_POINTS_PER_WHOLE)),
    eligibilityStatus: savingsGap > 0
      ? "savings_shortfall"
      : additionalInformation
        ? "additional_information"
        : "potentially_eligible",
    charges,
    affordability,
    schedule,
  };
}

export const basisPointsToPercent = (basisPoints: number) => basisPoints / BASIS_POINTS_PER_PERCENT;
