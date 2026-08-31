import type { Metadata } from "next";
import { LoanCalculatorClient } from "./LoanCalculatorClient";

export const metadata: Metadata = {
  title: "Simple Loan Calculator | CamCCUL",
  description:
    "Estimate a potential flat-rate loan repayment, required savings balance, and total repayment before visiting your affiliated credit union.",
};

export default function LoanCalculatorPage() {
  return <LoanCalculatorClient />;
}
