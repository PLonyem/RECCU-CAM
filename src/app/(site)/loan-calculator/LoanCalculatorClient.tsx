"use client";

import Image from "next/image";
import { useState } from "react";
import { Calculator, ChevronDown, Download, Lightbulb } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

const REPAYMENT_TERMS = [6, 12, 18, 24, 36] as const;

const LOAN_PRODUCTS = [
  {
    id: "regular",
    label: { en: "Regular Member Loan", fr: "Prêt ordinaire aux membres" },
    description: { en: "Everyday personal and household needs", fr: "Besoins personnels et familiaux courants" },
    savingsRate: 0.2,
  },
  {
    id: "agricultural",
    label: { en: "Agricultural Loan", fr: "Prêt agricole" },
    description: { en: "Farming, inputs and seasonal production", fr: "Agriculture, intrants et production saisonnière" },
    savingsRate: 0.2,
  },
  {
    id: "business",
    label: { en: "Business / Development Loan", fr: "Prêt commercial / développement" },
    description: { en: "Business growth and productive investment", fr: "Croissance d’entreprise et investissement productif" },
    savingsRate: 0.3333,
  },
  {
    id: "emergency",
    label: { en: "Emergency Loan", fr: "Prêt d’urgence" },
    description: { en: "Urgent and unexpected financial needs", fr: "Besoins financiers urgents et imprévus" },
    savingsRate: 0.3333,
  },
] as const;

type LoanProductId = (typeof LOAN_PRODUCTS)[number]["id"];

interface LoanResult {
  loanProductId: LoanProductId;
  savingsRate: number;
  principal: number;
  termMonths: number;
  annualRate: number;
  monthlyPayment: number;
  requiredSavings: number;
  totalInterest: number;
  totalRepayment: number;
  calculatedAt: string;
}

const copy = {
  en: {
    eyebrow: "CAMCCUL FINANCIAL TOOLS",
    title: "Simple Loan Calculator",
    subtitle:
      "Estimate your monthly payment and the savings balance you may need before applying through your own credit union.",
    calculatorTitle: "Estimate Your Loan",
    calculatorIntro: "Enter a few details to receive a simple flat-rate estimate.",
    loanType: "Choose a Loan Type",
    loanTypeIntro: "The selected product determines the indicative savings requirement.",
    savingsRequired: "savings required",
    amount: "Loan Amount (FCFA)",
    amountPlaceholder: "e.g., 2,500,000",
    period: "Repayment Period",
    months: "months",
    rate: "Annual Interest Rate (%)",
    method: "Calculation Method",
    flatRate: "Flat rate",
    calculate: "Calculate",
    amountError: "Enter a loan amount greater than zero.",
    rateError: "Enter a valid interest rate.",
    monthlyPayment: "Estimated Monthly Payment",
    requiredSavings: "Required Savings Balance",
    totalRepayment: "Total Repayment",
    savingsNoteLead:
      "Your credit union may require this savings balance before granting the loan. This estimate uses the selected product’s",
    savingsNoteTail: "savings policy; final requirements are set by your credit union.",
    nextStep: "Next Step",
    nextStepLead: "Go to the credit union where you already have an account.",
    nextStepBody:
      "Present your loan estimate to the credit union staff to begin your application process.",
    trustNote:
      "CamCCUL does not issue loans directly. Loans are provided by your affiliated credit union under their policies and approval.",
    downloadEstimate: "Download Loan Estimate",
    downloadingEstimate: "Preparing PDF...",
    downloadError: "The loan estimate could not be downloaded. Please try again.",
    estimatePreview: "Loan Estimate Preview",
    estimateReference: "Estimate Reference",
    estimateDate: "Date",
    preparedFor: "Prepared for",
    loanApplicant: "Loan Applicant",
    loanEstimate: "Loan Estimate",
    loanAmount: "Loan Amount",
    loanProduct: "Loan Type",
    repaymentPeriod: "Repayment Period",
    interestRate: "Interest Rate",
    annualFlatRate: "annual (flat rate)",
    totalInterest: "Total Interest",
    estimateNextStepBody: "Present this estimate to begin your loan application.",
    planningDisclaimer: "This estimate is for planning purposes only.",
    approvalDisclaimer: "It does not constitute loan approval or a guarantee of eligibility.",
    termsDisclaimer: "Final terms are determined by the credit union under their policies.",
  },
  fr: {
    eyebrow: "OUTILS FINANCIERS CAMCCUL",
    title: "Calculateur de prêt simple",
    subtitle:
      "Estimez votre mensualité et le solde d’épargne dont vous pourriez avoir besoin avant de faire une demande auprès de votre propre coopérative.",
    calculatorTitle: "Estimez votre prêt",
    calculatorIntro: "Saisissez quelques informations pour obtenir une estimation simple à taux fixe.",
    loanType: "Choisissez un type de prêt",
    loanTypeIntro: "Le produit sélectionné détermine l’exigence indicative d’épargne.",
    savingsRequired: "d’épargne requise",
    amount: "Montant du prêt (FCFA)",
    amountPlaceholder: "ex. 2 500 000",
    period: "Durée de remboursement",
    months: "mois",
    rate: "Taux d’intérêt annuel (%)",
    method: "Méthode de calcul",
    flatRate: "Taux fixe",
    calculate: "Calculer",
    amountError: "Saisissez un montant de prêt supérieur à zéro.",
    rateError: "Saisissez un taux d’intérêt valide.",
    monthlyPayment: "Mensualité estimée",
    requiredSavings: "Solde d’épargne requis",
    totalRepayment: "Remboursement total",
    savingsNoteLead:
      "Votre coopérative peut exiger ce solde d’épargne avant d’accorder le prêt. Cette estimation utilise la politique d’épargne de",
    savingsNoteTail: "du produit sélectionné ; les exigences finales sont fixées par votre coopérative.",
    nextStep: "Prochaine étape",
    nextStepLead: "Rendez-vous à la coopérative où vous avez déjà un compte.",
    nextStepBody:
      "Présentez votre estimation au personnel de la coopérative pour commencer votre demande de prêt.",
    trustNote:
      "CamCCUL n’accorde pas directement de prêts. Les prêts sont accordés par votre coopérative affiliée selon ses politiques et sous réserve de son approbation.",
    downloadEstimate: "Télécharger l’estimation du prêt",
    downloadingEstimate: "Préparation du PDF...",
    downloadError: "Impossible de télécharger l’estimation du prêt. Veuillez réessayer.",
    estimatePreview: "Aperçu de l’estimation du prêt",
    estimateReference: "Référence de l’estimation",
    estimateDate: "Date",
    preparedFor: "Préparé pour",
    loanApplicant: "Demandeur de prêt",
    loanEstimate: "Estimation du prêt",
    loanAmount: "Montant du prêt",
    loanProduct: "Type de prêt",
    repaymentPeriod: "Durée de remboursement",
    interestRate: "Taux d’intérêt",
    annualFlatRate: "annuel (taux fixe)",
    totalInterest: "Intérêts totaux",
    estimateNextStepBody: "Présentez cette estimation pour commencer votre demande de prêt.",
    planningDisclaimer: "Cette estimation est fournie uniquement à des fins de planification.",
    approvalDisclaimer: "Elle ne constitue ni une approbation de prêt ni une garantie d’éligibilité.",
    termsDisclaimer: "Les conditions finales sont déterminées par la coopérative selon ses politiques.",
  },
} as const;

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function formatSavingsRate(rate: number) {
  return `${Number((rate * 100).toFixed(2))}%`;
}

function createEstimateReference(year: number) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const values = new Uint32Array(4);
  crypto.getRandomValues(values);
  const suffix = Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
  return `CAM-${year}-${suffix}`;
}

async function loadCamcculLogoDataUrl() {
  const response = await fetch("/logo.jpg");
  if (!response.ok) throw new Error("CamCCUL logo could not be loaded.");
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function LoanEstimateDocument({
  result,
  productName,
  reference,
  locale,
  c,
  formatCurrency,
}: {
  result: LoanResult;
  productName: string;
  reference: string | null;
  locale: string;
  c: (typeof copy)[keyof typeof copy];
  formatCurrency: (value: number) => string;
}) {
  const displayReference = reference ?? `CAM-${new Date(result.calculatedAt).getFullYear()}-XXXX`;
  const displayDate = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(result.calculatedAt));
  const rows = [
    [c.loanProduct, productName],
    [c.loanAmount, formatCurrency(result.principal)],
    [c.repaymentPeriod, `${result.termMonths} ${c.months}`],
    [c.interestRate, `${result.annualRate}% ${c.annualFlatRate}`],
    [c.monthlyPayment, formatCurrency(result.monthlyPayment)],
    [c.requiredSavings, formatCurrency(result.requiredSavings)],
    [c.totalInterest, formatCurrency(result.totalInterest)],
    [c.totalRepayment, formatCurrency(result.totalRepayment)],
  ];

  return (
    <article
      className="loan-estimate-page relative mx-auto max-w-3xl overflow-hidden rounded-sm border border-gray-200 bg-white px-5 py-8 text-gray-900 shadow-xl sm:px-10 md:px-14 md:py-12"
      aria-label={c.estimatePreview}
    >
      <div className="loan-estimate-watermark pointer-events-none absolute left-1/2 top-1/2 z-0 select-none whitespace-nowrap font-display text-[clamp(4rem,15vw,7.5rem)] font-bold text-primary-900">
        CamCCUL
      </div>

      <div className="relative z-10">
        <header className="loan-estimate-header relative border-b border-gray-300 pb-7 text-center">
          <div className="loan-estimate-logo mx-auto mb-4 flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-sm md:absolute md:left-0 md:top-0 md:mb-0">
            <Image
              src="/logo.jpg"
              alt="CamCCUL logo"
              width={106}
              height={90}
              className="h-full w-full object-contain"
            />
          </div>
          <p className="font-display text-sm font-bold text-primary-900 sm:text-base">
            CAMCCUL — Cameroon Cooperative Credit Union League
          </p>
          <h2 className="font-display mt-4 text-2xl font-extrabold uppercase tracking-[0.22em] text-gray-950 sm:text-3xl">
            {c.loanEstimate}
          </h2>
        </header>

        <section className="grid gap-2 py-7 text-sm sm:grid-cols-2">
          <p>
            <span className="text-gray-500">{c.estimateReference}: </span>
            <span className="font-mono font-semibold text-gray-900">{displayReference}</span>
          </p>
          <p className="sm:text-right">
            <span className="text-gray-500">{c.estimateDate}: </span>
            <span className="font-semibold text-gray-900">{displayDate}</span>
          </p>
          <p className="sm:col-span-2">
            <span className="text-gray-500">{c.preparedFor}: </span>
            <span className="font-semibold text-gray-900">{c.loanApplicant}</span>
          </p>
        </section>

        <table className="w-full border-collapse text-sm">
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label} className="border-b border-gray-200 last:border-b-0">
                <th scope="row" className="w-1/2 py-3 pr-3 text-left font-normal text-gray-500">
                  {label}
                </th>
                <td className="py-3 text-right font-bold text-gray-950">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <section className="mt-8 border-l-4 border-primary-500 bg-primary-50 px-5 py-4">
          <h3 className="font-display text-lg font-bold text-primary-900">{c.nextStep}</h3>
          <p className="mt-2 font-semibold text-gray-800">{c.nextStepLead}</p>
          <p className="mt-1 text-sm text-gray-600">{c.estimateNextStepBody}</p>
        </section>

        <section className="mt-8 space-y-1 text-xs leading-5 text-gray-500">
          <p>{c.planningDisclaimer}</p>
          <p>{c.approvalDisclaimer}</p>
          <p>{c.termsDisclaimer}</p>
        </section>

        <footer className="mt-10 border-t border-gray-300 pt-5 text-center text-xs leading-5 text-gray-500">
          <p className="font-semibold text-primary-900">Cameroon Cooperative Credit Union League</p>
          <p>Commercial Avenue, Bamenda · +237 233 36 11 82 · info@camccul.cm</p>
        </footer>
      </div>
    </article>
  );
}

export function LoanCalculatorClient() {
  const { language } = useLanguage();
  const c = copy[language];
  const locale = language === "fr" ? "fr-FR" : "en-US";

  const [selectedLoanProductId, setSelectedLoanProductId] = useState<LoanProductId>("regular");
  const [amount, setAmount] = useState("");
  const [term, setTerm] = useState<(typeof REPAYMENT_TERMS)[number]>(12);
  const [interestRate, setInterestRate] = useState("18");
  const [result, setResult] = useState<LoanResult | null>(null);
  const [estimateReference, setEstimateReference] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [calculatorError, setCalculatorError] = useState("");
  const selectedLoanProduct =
    LOAN_PRODUCTS.find((product) => product.id === selectedLoanProductId) ?? LOAN_PRODUCTS[0];
  const resultLoanProduct = result
    ? LOAN_PRODUCTS.find((product) => product.id === result.loanProductId) ?? LOAN_PRODUCTS[0]
    : selectedLoanProduct;

  const formattedAmount = amount
    ? new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(Number(amount))
    : "";

  function formatCurrency(value: number) {
    return `FCFA ${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(
      Math.round(value)
    )}`;
  }

  function calculateLoan() {
    const principal = Number(amount);
    const annualRate = Number(interestRate);

    if (!Number.isFinite(principal) || principal <= 0) {
      setCalculatorError(c.amountError);
      setResult(null);
      return;
    }

    if (!Number.isFinite(annualRate) || annualRate < 0) {
      setCalculatorError(c.rateError);
      setResult(null);
      return;
    }

    const totalInterest = principal * (annualRate / 100) * (term / 12);
    const totalRepayment = principal + totalInterest;

    setCalculatorError("");
    setEstimateReference(createEstimateReference(new Date().getFullYear()));
    setResult({
      loanProductId: selectedLoanProduct.id,
      savingsRate: selectedLoanProduct.savingsRate,
      principal,
      termMonths: term,
      annualRate,
      monthlyPayment: totalRepayment / term,
      requiredSavings: principal * selectedLoanProduct.savingsRate,
      totalInterest,
      totalRepayment,
      calculatedAt: new Date().toISOString(),
    });
  }

  async function downloadEstimate() {
    if (!result) return;

    const reference = estimateReference ?? createEstimateReference(new Date().getFullYear());
    if (!estimateReference) setEstimateReference(reference);
    setIsDownloading(true);
    setCalculatorError("");

    try {
      const { downloadLoanEstimatePdf } = await import("@/lib/loan-estimate-pdf");
      const logoDataUrl = await loadCamcculLogoDataUrl();
      const displayDate = new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(result.calculatedAt));

      downloadLoanEstimatePdf({
        logoDataUrl,
        reference,
        referenceLabel: c.estimateReference,
        date: displayDate,
        dateLabel: c.estimateDate,
        preparedFor: c.loanApplicant,
        preparedForLabel: c.preparedFor,
        title: c.loanEstimate,
        rows: [
          { label: c.loanProduct, value: resultLoanProduct.label[language] },
          { label: c.loanAmount, value: formatCurrency(result.principal) },
          { label: c.repaymentPeriod, value: `${result.termMonths} ${c.months}` },
          { label: c.interestRate, value: `${result.annualRate}% ${c.annualFlatRate}` },
          { label: c.monthlyPayment, value: formatCurrency(result.monthlyPayment) },
          { label: c.requiredSavings, value: formatCurrency(result.requiredSavings) },
          { label: c.totalInterest, value: formatCurrency(result.totalInterest) },
          { label: c.totalRepayment, value: formatCurrency(result.totalRepayment) },
        ],
        nextStepHeading: c.nextStep,
        nextStepLead: c.nextStepLead,
        nextStepBody: c.estimateNextStepBody,
        disclaimers: [c.planningDisclaimer, c.approvalDisclaimer, c.termsDisclaimer],
      });
    } catch (error) {
      console.error("Loan estimate PDF generation failed:", error);
      setCalculatorError(c.downloadError);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="bg-gray-50">
      <section className="bg-primary-900 px-4 py-14 text-white md:py-18">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-200">
            {c.eyebrow}
          </p>
          <h1 className="font-display mt-3 text-3xl font-bold md:text-5xl">{c.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-primary-100 md:text-base">
            {c.subtitle}
          </p>
        </div>
      </section>

      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Calculator className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-primary-900">
                  {c.calculatorTitle}
                </h2>
                <p className="mt-1 text-sm text-gray-600">{c.calculatorIntro}</p>
              </div>
            </div>

            <div className="mt-8">
              <label htmlFor="loan-product" className="font-display text-base font-bold text-primary-900">
                {c.loanType}
              </label>
              <p className="mt-1 text-sm text-gray-500">{c.loanTypeIntro}</p>
              <div className="relative mt-4 max-w-2xl">
                <select
                  id="loan-product"
                  value={selectedLoanProductId}
                  onChange={(event) => {
                    setSelectedLoanProductId(event.target.value as LoanProductId);
                    setResult(null);
                    setEstimateReference(null);
                  }}
                  className="h-12 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 pr-11 text-base font-medium text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                >
                  {LOAN_PRODUCTS.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.label[language]} — {formatSavingsRate(product.savingsRate)} {c.savingsRequired}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <div className="mt-3 max-w-2xl rounded-lg border border-primary-100 bg-primary-50 px-4 py-3">
                <p className="text-sm text-gray-700">{selectedLoanProduct.description[language]}</p>
                <p className="mt-1 text-xs font-semibold text-primary-700">
                  {formatSavingsRate(selectedLoanProduct.savingsRate)} {c.savingsRequired}
                </p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">{c.amount}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formattedAmount}
                  onChange={(event) => {
                    setAmount(digitsOnly(event.target.value));
                    setResult(null);
                  }}
                  placeholder={c.amountPlaceholder}
                  className="mt-2 h-12 w-full rounded-lg border border-gray-300 px-4 text-base text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">{c.rate}</span>
                <div className="relative mt-2">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={interestRate}
                    onChange={(event) => {
                      setInterestRate(event.target.value);
                      setResult(null);
                    }}
                    className="h-12 w-full rounded-lg border border-gray-300 px-4 pr-10 text-base text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    %
                  </span>
                </div>
              </label>
            </div>

            <fieldset className="mt-6">
              <legend className="text-sm font-medium text-gray-700">{c.period}</legend>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
                {REPAYMENT_TERMS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={term === option}
                    onClick={() => {
                      setTerm(option);
                      setResult(null);
                    }}
                    className={cn(
                      "min-h-11 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
                      term === option
                        ? "border-primary-500 bg-primary-500 text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:border-primary-300 hover:text-primary-600"
                    )}
                  >
                    {option} {c.months}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-6 flex flex-col gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {c.method}
                </p>
                <p className="mt-1 font-medium text-gray-800">{c.flatRate}</p>
              </div>
              <button
                type="button"
                onClick={calculateLoan}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-6 font-semibold text-white transition-colors hover:bg-primary-600 sm:w-auto"
              >
                <Calculator className="h-5 w-5" aria-hidden="true" />
                {c.calculate}
              </button>
            </div>

            {calculatorError && (
              <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                {calculatorError}
              </p>
            )}

            {result && (
              <div className="mt-8" aria-live="polite">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-primary-100 bg-primary-50 p-5">
                    <p className="text-sm text-primary-700">{c.monthlyPayment}</p>
                    <p className="mt-2 text-xl font-bold text-primary-900">
                      {formatCurrency(result.monthlyPayment)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-primary-200 bg-primary-50 p-5">
                    <p className="text-sm text-primary-700">{c.requiredSavings}</p>
                    <p className="mt-2 text-xl font-bold text-primary-900">
                      {formatCurrency(result.requiredSavings)}
                    </p>
                    <p className="mt-3 text-xs leading-5 text-gray-500">
                      {c.savingsNoteLead} {formatSavingsRate(result.savingsRate)} {c.savingsNoteTail}
                    </p>
                  </div>

                  <div className="rounded-xl border border-primary-100 bg-primary-50 p-5">
                    <p className="text-sm text-primary-700">{c.totalRepayment}</p>
                    <p className="mt-2 text-xl font-bold text-primary-900">
                      {formatCurrency(result.totalRepayment)}
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>

          {result && (
            <section>
              <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                {c.estimatePreview}
              </p>
              <LoanEstimateDocument
                result={result}
                productName={resultLoanProduct.label[language]}
                reference={estimateReference}
                locale={locale}
                c={c}
                formatCurrency={formatCurrency}
              />
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={downloadEstimate}
                  disabled={isDownloading}
                  aria-busy={isDownloading}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-6 font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
                >
                  <Download className="h-5 w-5" aria-hidden="true" />
                  {isDownloading ? c.downloadingEstimate : c.downloadEstimate}
                </button>
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-primary-200 bg-primary-50 p-8 text-center">
            <Lightbulb className="mx-auto h-8 w-8 text-primary-500" aria-hidden="true" />
            <h2 className="font-display mt-4 text-2xl font-bold text-primary-900">
              {c.nextStep}
            </h2>
            <p className="mt-3 text-lg text-gray-700">{c.nextStepLead}</p>
            <p className="mx-auto mt-2 max-w-2xl text-gray-600">{c.nextStepBody}</p>
            <div className="mx-auto my-6 h-px max-w-2xl bg-primary-200" aria-hidden="true" />
            <p className="mx-auto max-w-2xl text-sm italic leading-6 text-gray-500">
              {c.trustNote}
            </p>
          </section>
        </div>
      </section>
    </div>
  );
}
