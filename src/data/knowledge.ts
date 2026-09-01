export const knowledgeCategorySlugs = [
  "regulatory-library",
  "cobac-resources",
  "cemac-resources",
  "minfi-notices",
  "reccu-cam-circulars",
  "governance",
  "compliance",
  "internal-control",
  "aml-cft",
  "credit-management",
  "accounting",
  "training-materials",
  "reports-publications",
] as const;

export type KnowledgeCategorySlug = (typeof knowledgeCategorySlugs)[number];

export interface KnowledgeCategory {
  id: string;
  slug: KnowledgeCategorySlug;
  title: string;
  description: string;
}

export type KnowledgeDocumentType =
  | "Regulation"
  | "Circular"
  | "Notice"
  | "Report"
  | "Guide"
  | "Template"
  | "Publication"
  | "Training Material"
  | "Web Resource";

export type KnowledgeAccessLevel = "public" | "affiliate-only" | "staff-only";
export type KnowledgeSort = "newest" | "oldest" | "alphabetical";

export interface KnowledgeDocument {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: KnowledgeCategorySlug;
  issuingAuthority: string | null;
  publicationDate: string | null;
  updatedDate: string | null;
  documentType: KnowledgeDocumentType;
  fileSize: string | null;
  accessLevel: KnowledgeAccessLevel;
  tags: readonly string[];
  fileUrl: string | null;
  featured: boolean;
  version: string | null;
}

export interface KnowledgeFilters {
  query?: string;
  category?: KnowledgeCategorySlug | "";
  issuingAuthority?: string;
  year?: string;
  documentType?: KnowledgeDocumentType | "";
  accessLevel?: KnowledgeAccessLevel | "";
  sort?: KnowledgeSort;
}

export const knowledgeCategories: readonly KnowledgeCategory[] = [
  {
    id: "category-regulatory-library",
    slug: "regulatory-library",
    title: "Regulatory Library",
    description: "Source-labelled regulatory references and institutional requirements.",
  },
  {
    id: "category-cobac-resources",
    slug: "cobac-resources",
    title: "COBAC Resources",
    description: "Published supervisory resources attributed to COBAC.",
  },
  {
    id: "category-cemac-resources",
    slug: "cemac-resources",
    title: "CEMAC Resources",
    description: "Published regional instruments and institutional references.",
  },
  {
    id: "category-minfi-notices",
    slug: "minfi-notices",
    title: "MINFI Notices",
    description: "Public notices and reference material issued by Cameroon's Ministry of Finance.",
  },
  {
    id: "category-reccu-cam-circulars",
    slug: "reccu-cam-circulars",
    title: "RECCU-CAM Circulars",
    description: "Approved network circulars with clear ownership and publication status.",
  },
  {
    id: "category-governance",
    slug: "governance",
    title: "Governance",
    description: "Resources for stewardship, oversight, accountability, and cooperative leadership.",
  },
  {
    id: "category-compliance",
    slug: "compliance",
    title: "Compliance",
    description: "Practical materials supporting institution-wide compliance responsibilities.",
  },
  {
    id: "category-internal-control",
    slug: "internal-control",
    title: "Internal Control",
    description: "Control frameworks, operational safeguards, and review resources.",
  },
  {
    id: "category-aml-cft",
    slug: "aml-cft",
    title: "AML/CFT",
    description: "Approved resources concerning anti-money laundering and counter-terrorist financing.",
  },
  {
    id: "category-credit-management",
    slug: "credit-management",
    title: "Credit Management",
    description: "Responsible credit assessment, monitoring, and portfolio-management materials.",
  },
  {
    id: "category-accounting",
    slug: "accounting",
    title: "Accounting",
    description: "Financial reporting, recordkeeping, and accounting resources.",
  },
  {
    id: "category-training-materials",
    slug: "training-materials",
    title: "Training Materials",
    description: "Approved professional learning and participant resources.",
  },
  {
    id: "category-reports-publications",
    slug: "reports-publications",
    title: "Reports & Publications",
    description: "Source-labelled research, reports, and institutional publications.",
  },
];

// Only records with a verified public source belong in this collection.
// Restricted documents are deliberately absent from the prototype dataset.
export const knowledgeDocuments: readonly KnowledgeDocument[] = [
  {
    id: "minfi-emf-list-2021",
    slug: "minfi-approved-microfinance-institutions-2021",
    title: "MINFI list of approved microfinance institutions at 31 December 2021",
    description:
      "The public MINFI listing used to verify RECCU-CAM's legal name, network classification, location, approval order, and the institutions recorded under its network at 31 December 2021.",
    category: "minfi-notices",
    issuingAuthority: "Ministry of Finance, Cameroon",
    publicationDate: null,
    updatedDate: null,
    documentType: "Web Resource",
    fileSize: null,
    accessLevel: "public",
    tags: ["MINFI", "microfinance institutions", "Cameroon", "institutional reference"],
    fileUrl:
      "https://minfi.gov.cm/liste-des-etablissements-de-microfinance-agrees-au-31-decembre-2021/amp/",
    featured: true,
    version: null,
  },
];

export const publicKnowledgeDocuments = knowledgeDocuments.filter(
  (document) => document.accessLevel === "public",
);

export const knowledgeDocumentTypes: readonly KnowledgeDocumentType[] = [
  "Regulation",
  "Circular",
  "Notice",
  "Report",
  "Guide",
  "Template",
  "Publication",
  "Training Material",
  "Web Resource",
];

export const knowledgeAccessLevelLabels: Record<KnowledgeAccessLevel, string> = {
  public: "Public",
  "affiliate-only": "Affiliate Only",
  "staff-only": "Staff Only",
};

export const knowledgeSortLabels: Record<KnowledgeSort, string> = {
  newest: "Newest",
  oldest: "Oldest",
  alphabetical: "Alphabetical",
};

export function getKnowledgeCategory(slug: KnowledgeCategorySlug) {
  return knowledgeCategories.find((category) => category.slug === slug);
}

export function getPublicKnowledgeDocumentBySlug(slug: string) {
  return publicKnowledgeDocuments.find((document) => document.slug === slug);
}

export function getKnowledgeFilterOptions(documents: readonly KnowledgeDocument[] = publicKnowledgeDocuments) {
  const authorities = [...new Set(documents.flatMap((document) =>
    document.issuingAuthority ? [document.issuingAuthority] : [],
  ))].sort((a, b) => a.localeCompare(b));
  const years = [...new Set(documents.flatMap((document) => {
    const date = document.publicationDate ?? document.updatedDate;
    return date ? [date.slice(0, 4)] : [];
  }))].sort((a, b) => Number(b) - Number(a));
  const documentTypes = [...new Set(documents.map((document) => document.documentType))].sort(
    (a, b) => a.localeCompare(b),
  );
  return { authorities, years, documentTypes };
}

export function filterKnowledgeDocuments(
  documents: readonly KnowledgeDocument[],
  filters: KnowledgeFilters,
) {
  const query = filters.query?.trim().toLocaleLowerCase() ?? "";
  const filtered = documents.filter((document) => {
    const category = getKnowledgeCategory(document.category);
    const searchableText = [
      document.title,
      document.description,
      category?.title,
      document.issuingAuthority,
      document.documentType,
      ...document.tags,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();
    const effectiveDate = document.publicationDate ?? document.updatedDate;

    if (query && !searchableText.includes(query)) return false;
    if (filters.category && document.category !== filters.category) return false;
    if (filters.issuingAuthority && document.issuingAuthority !== filters.issuingAuthority) return false;
    if (filters.year && effectiveDate?.slice(0, 4) !== filters.year) return false;
    if (filters.documentType && document.documentType !== filters.documentType) return false;
    if (filters.accessLevel && document.accessLevel !== filters.accessLevel) return false;
    return true;
  });

  return [...filtered].sort((a, b) => compareKnowledgeDocuments(a, b, filters.sort ?? "newest"));
}

export function getRelatedKnowledgeDocuments(document: KnowledgeDocument, limit = 3) {
  return publicKnowledgeDocuments
    .filter((candidate) => candidate.id !== document.id)
    .map((candidate) => ({
      candidate,
      score:
        (candidate.category === document.category ? 2 : 0) +
        candidate.tags.filter((tag) => document.tags.includes(tag)).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.candidate.title.localeCompare(b.candidate.title))
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

function compareKnowledgeDocuments(a: KnowledgeDocument, b: KnowledgeDocument, sort: KnowledgeSort) {
  if (sort === "alphabetical") return a.title.localeCompare(b.title);
  const aDate = a.publicationDate ?? a.updatedDate;
  const bDate = b.publicationDate ?? b.updatedDate;
  if (!aDate && !bDate) return a.title.localeCompare(b.title);
  if (!aDate) return 1;
  if (!bDate) return -1;
  return sort === "oldest" ? aDate.localeCompare(bDate) : bDate.localeCompare(aDate);
}

export function formatKnowledgeDate(date: string | null) {
  if (!date) return "Not published";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
