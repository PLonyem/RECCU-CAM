import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateFlatInterest,
  calculateRequiredSavings,
  calculateSavingsShortfall,
  simulateLoan,
} from "./engine";
import type { ResolvedLoanPolicy } from "./types";

const basePolicy: ResolvedLoanPolicy = {
  productId: "product",
  productVersionId: "version",
  productCode: "TEST",
  productNameEn: "Test loan",
  productNameFr: "Prêt test",
  minimumAmount: 100_000,
  maximumAmount: 10_000_000,
  availableTerms: [3, 6, 12, 24, 36],
  interestRateBasisPoints: 1_200,
  interestPeriod: "annual",
  calculationMethod: "flat",
  requiredSavingsBasisPoints: 2_000,
  feeRules: [],
  effectiveFrom: "2026-01-01",
};

test("calculates required savings and shortfall using integer FCFA", () => {
  assert.equal(calculateRequiredSavings(1_500_000, 3_333), 499_950);
  assert.equal(calculateSavingsShortfall(499_950, 300_000), 199_950);
});

test("calculates annual flat interest", () => {
  assert.equal(calculateFlatInterest(500_000, 1_200, 12, "annual"), 60_000);
  assert.equal(calculateFlatInterest(500_000, 1_200, 6, "annual"), 30_000);
});

test("supports zero interest and closes the amortization balance", () => {
  const result = simulateLoan(
    { ...basePolicy, interestRateBasisPoints: 0, calculationMethod: "reducing_balance" },
    { requestedAmount: 100_000, termMonths: 3, savingsBalance: 20_000 }
  );
  assert.equal(result.totalInterest, 0);
  assert.equal(result.totalRepayment, 100_000);
  assert.equal(result.schedule.at(-1)?.closingBalance, 0);
});

test("applies a principal threshold tax to interest only", () => {
  const rule = {
    id: "tax",
    nameEn: "Configured tax",
    nameFr: "Taxe configurée",
    kind: "tax" as const,
    calculationType: "percentage" as const,
    rateBasisPoints: 1_925,
    calculationBase: "interest" as const,
    principalThreshold: 2_000_000,
    active: true,
  };
  const below = simulateLoan(
    { ...basePolicy, feeRules: [rule] },
    { requestedAmount: 1_999_999, termMonths: 12, savingsBalance: 1_000_000 }
  );
  const atThreshold = simulateLoan(
    { ...basePolicy, feeRules: [rule] },
    { requestedAmount: 2_000_000, termMonths: 12, savingsBalance: 1_000_000 }
  );
  assert.equal(below.totalTaxes, 0);
  assert.equal(atThreshold.totalInterest, 240_000);
  assert.equal(atThreshold.totalTaxes, 46_200);
});

test("reducing-balance schedule is deterministic and fully repaid", () => {
  const result = simulateLoan(
    { ...basePolicy, calculationMethod: "reducing_balance" },
    { requestedAmount: 5_000_000, termMonths: 24, savingsBalance: 1_000_000 }
  );
  assert.equal(result.schedule.length, 24);
  assert.equal(result.schedule.at(-1)?.closingBalance, 0);
  assert.equal(result.totalRepayment, 5_648_815);
});

test("affiliate policy override changes savings outcome", () => {
  const input = { requestedAmount: 10_000_000, termMonths: 12, savingsBalance: 2_500_000 };
  const network = simulateLoan({ ...basePolicy, maximumAmount: 10_000_000 }, input);
  const affiliate = simulateLoan(
    { ...basePolicy, maximumAmount: 10_000_000, requiredSavingsBasisPoints: 3_333 },
    input
  );
  assert.equal(network.eligibilityStatus, "potentially_eligible");
  assert.equal(affiliate.eligibilityStatus, "savings_shortfall");
});
