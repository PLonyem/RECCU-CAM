export type InterestPeriod = "annual" | "monthly";
export type CalculationMethod = "flat" | "reducing_balance";
export type FeeKind = "fee" | "tax" | "insurance";
export type FeeCalculationBase = "principal" | "interest" | "principal_and_interest";

export interface LoanFeeRule {
  id: string;
  nameEn: string;
  nameFr: string;
  descriptionEn?: string;
  descriptionFr?: string;
  kind: FeeKind;
  calculationType: "fixed" | "percentage";
  amount?: number;
  rateBasisPoints?: number;
  calculationBase: FeeCalculationBase;
  principalThreshold?: number;
  minimumAmount?: number;
  maximumAmount?: number;
  active: boolean;
}

export interface ResolvedLoanPolicy {
  productId: string;
  productVersionId: string;
  productCode: string;
  productNameEn: string;
  productNameFr: string;
  affiliateId?: string;
  affiliateName?: string;
  minimumAmount: number;
  maximumAmount: number;
  availableTerms: number[];
  interestRateBasisPoints: number;
  interestPeriod: InterestPeriod;
  calculationMethod: CalculationMethod;
  requiredSavingsBasisPoints: number;
  affordabilityBasisPoints?: number;
  feeRules: LoanFeeRule[];
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface FinancialProfile {
  monthlyNetIncome?: number;
  otherMonthlyIncome?: number;
  existingLoanRepayments?: number;
  housingObligations?: number;
  otherCommitments?: number;
}

export interface LoanSimulationInput {
  requestedAmount: number;
  termMonths: number;
  savingsBalance: number;
  firstPaymentDate?: string;
  financialProfile?: FinancialProfile;
}

export interface AmortizationRow {
  paymentNumber: number;
  paymentDate: string;
  openingBalance: number;
  principal: number;
  interest: number;
  fees: number;
  payment: number;
  closingBalance: number;
}

export interface AffordabilityResult {
  supplied: boolean;
  totalMonthlyIncome: number;
  existingCommitments: number;
  estimatedNewLoanPayment: number;
  totalMonthlyDebtCommitments: number;
  disposableIncome: number;
  repaymentToIncomeBasisPoints: number | null;
  rating: "comfortable" | "moderate" | "high" | "not_available";
}

export interface AppliedCharge {
  id: string;
  nameEn: string;
  nameFr: string;
  kind: FeeKind;
  amount: number;
}

export interface LoanSimulationResult {
  requestedAmount: number;
  termMonths: number;
  monthlyPayment: number;
  totalInterest: number;
  totalFees: number;
  totalTaxes: number;
  totalInsurance: number;
  totalCharges: number;
  borrowingCost: number;
  totalRepayment: number;
  requiredSavings: number;
  savingsGap: number;
  savingsProgressBasisPoints: number;
  eligibilityStatus: "potentially_eligible" | "savings_shortfall" | "additional_information";
  charges: AppliedCharge[];
  affordability: AffordabilityResult;
  schedule: AmortizationRow[];
}
