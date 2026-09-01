export const trainingCategorySlugs = [
  "governance-leadership",
  "microfinance-accounting",
  "credit-loan-management",
  "internal-control",
  "compliance",
  "risk-management",
  "entrepreneurship",
  "digital-financial-services",
  "customer-service",
  "cooperative-management",
] as const;

export type TrainingCategorySlug = (typeof trainingCategorySlugs)[number];

export interface TrainingCategory {
  id: string;
  slug: TrainingCategorySlug;
  title: string;
  summary: string;
}

export type TrainingLevel = "foundation" | "intermediate" | "advanced" | "all-levels";
export type TrainingFormat = "in-person" | "online" | "hybrid";
export type RegistrationStatus =
  | "schedule-pending"
  | "registration-open"
  | "waitlist"
  | "registration-closed";

export interface TrainingProgram {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: TrainingCategorySlug;
  audience: readonly string[];
  level: TrainingLevel;
  format: TrainingFormat | null;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  duration: string | null;
  facilitator: string | null;
  objectives: readonly string[];
  modules: readonly string[];
  capacity: number | null;
  registrationStatus: RegistrationStatus;
}

export const trainingCategories: readonly TrainingCategory[] = [
  {
    id: "category-governance-leadership",
    slug: "governance-leadership",
    title: "Governance & Leadership",
    summary: "Board stewardship, accountable leadership, and sound institutional direction.",
  },
  {
    id: "category-microfinance-accounting",
    slug: "microfinance-accounting",
    title: "Microfinance Accounting",
    summary: "Financial records, reporting discipline, and decision-ready information.",
  },
  {
    id: "category-credit-loan-management",
    slug: "credit-loan-management",
    title: "Credit & Loan Management",
    summary: "Responsible assessment, portfolio oversight, and member-focused credit practice.",
  },
  {
    id: "category-internal-control",
    slug: "internal-control",
    title: "Internal Control",
    summary: "Clear controls, segregation of duties, and dependable operational review.",
  },
  {
    id: "category-compliance",
    slug: "compliance",
    title: "Compliance",
    summary: "Practical compliance awareness and institution-wide responsibility.",
  },
  {
    id: "category-risk-management",
    slug: "risk-management",
    title: "Risk Management",
    summary: "Risk identification, proportionate response, and resilient operations.",
  },
  {
    id: "category-entrepreneurship",
    slug: "entrepreneurship",
    title: "Entrepreneurship",
    summary: "Enterprise fundamentals, financial capability, and sustainable growth planning.",
  },
  {
    id: "category-digital-financial-services",
    slug: "digital-financial-services",
    title: "Digital Financial Services",
    summary: "Responsible digital adoption, data stewardship, and service transformation.",
  },
  {
    id: "category-customer-service",
    slug: "customer-service",
    title: "Customer Service",
    summary: "Trust-building communication and consistent member service.",
  },
  {
    id: "category-cooperative-management",
    slug: "cooperative-management",
    title: "Cooperative Management",
    summary: "Member-centred operations, performance, and cooperative identity in practice.",
  },
];

// These are curriculum previews, not scheduled training offers. Operational fields
// remain null until RECCU-CAM verifies and publishes them.
export const trainingPrograms: readonly TrainingProgram[] = [
  {
    id: "program-cooperative-governance-foundations",
    slug: "cooperative-governance-foundations",
    title: "Cooperative Governance Foundations",
    summary:
      "A practical learning pathway for clearer oversight, accountable decisions, and effective board-management relationships.",
    category: "governance-leadership",
    audience: ["Board members", "Supervisory committees", "Institutional managers"],
    level: "foundation",
    format: null,
    location: null,
    startDate: null,
    endDate: null,
    duration: null,
    facilitator: null,
    objectives: [
      "Distinguish governance, oversight, and management responsibilities",
      "Apply cooperative principles to institutional decisions",
      "Strengthen meeting and accountability practices",
    ],
    modules: ["Cooperative identity", "Roles and accountability", "Meeting discipline"],
    capacity: null,
    registrationStatus: "schedule-pending",
  },
  {
    id: "program-microfinance-accounting-essentials",
    slug: "microfinance-accounting-essentials",
    title: "Microfinance Accounting Essentials",
    summary:
      "A foundation for accurate records, consistent controls, and financial information that supports institutional decisions.",
    category: "microfinance-accounting",
    audience: ["Accounting teams", "Operations staff", "Institutional managers"],
    level: "foundation",
    format: null,
    location: null,
    startDate: null,
    endDate: null,
    duration: null,
    facilitator: null,
    objectives: [
      "Connect daily records with institutional reporting",
      "Recognise common documentation and reconciliation gaps",
      "Support reliable review and decision-making",
    ],
    modules: ["Accounting workflow", "Reconciliation discipline", "Management reporting"],
    capacity: null,
    registrationStatus: "schedule-pending",
  },
  {
    id: "program-responsible-credit-practice",
    slug: "responsible-credit-practice",
    title: "Responsible Credit & Loan Management",
    summary:
      "A member-centred introduction to consistent assessment, clear communication, portfolio monitoring, and fair treatment.",
    category: "credit-loan-management",
    audience: ["Credit teams", "Operations staff", "Member-service teams"],
    level: "foundation",
    format: null,
    location: null,
    startDate: null,
    endDate: null,
    duration: null,
    facilitator: null,
    objectives: [
      "Use a consistent credit assessment workflow",
      "Communicate responsibilities clearly to members",
      "Identify portfolio signals that require follow-up",
    ],
    modules: ["Member needs", "Assessment workflow", "Portfolio follow-up"],
    capacity: null,
    registrationStatus: "schedule-pending",
  },
  {
    id: "program-internal-control-foundations",
    slug: "internal-control-foundations",
    title: "Internal Control Foundations",
    summary:
      "A practical introduction to preventive and detective controls across everyday cooperative financial operations.",
    category: "internal-control",
    audience: ["Internal control teams", "Operations staff", "Institutional managers"],
    level: "foundation",
    format: null,
    location: null,
    startDate: null,
    endDate: null,
    duration: null,
    facilitator: null,
    objectives: [
      "Recognise the purpose of core operational controls",
      "Map responsibilities and segregation of duties",
      "Document findings and follow-up actions clearly",
    ],
    modules: ["Control environment", "Operational safeguards", "Review and follow-up"],
    capacity: null,
    registrationStatus: "schedule-pending",
  },
];

export const featuredTrainingPrograms = trainingPrograms.slice(0, 3);

export const publishedTrainingEvents = trainingPrograms.filter(
  (program): program is TrainingProgram & { startDate: string } =>
    program.startDate !== null && program.registrationStatus !== "schedule-pending",
);

export function getTrainingCategory(slug: TrainingCategorySlug) {
  return trainingCategories.find((category) => category.slug === slug);
}

export const trainingLevelLabels: Record<TrainingLevel, string> = {
  foundation: "Foundation",
  intermediate: "Intermediate",
  advanced: "Advanced",
  "all-levels": "All levels",
};

export const trainingFormatLabels: Record<TrainingFormat, string> = {
  "in-person": "In person",
  online: "Online",
  hybrid: "Hybrid",
};
