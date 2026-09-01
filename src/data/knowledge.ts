export interface KnowledgeCollection {
  slug: string;
  title: string;
  description: string;
  publicationStatus: "source-available" | "awaiting-publication";
  href?: string;
  source?: string;
}

export const knowledgeCollections: KnowledgeCollection[] = [
  {
    slug: "institutional-reference",
    title: "Institutional reference",
    description:
      "The public MINFI listing used to verify RECCU-CAM's legal name, network classification, location, and approval order.",
    publicationStatus: "source-available",
    href: "https://minfi.gov.cm/liste-des-etablissements-de-microfinance-agrees-au-31-decembre-2021/amp/",
    source: "Ministry of Finance, Cameroon",
  },
  {
    slug: "network-policies",
    title: "Network policies and circulars",
    description:
      "Approved network documents will appear here after ownership, version, and publication status are confirmed.",
    publicationStatus: "awaiting-publication",
  },
  {
    slug: "reporting-templates",
    title: "Reporting templates",
    description:
      "Controlled templates will be published with effective dates and version history to prevent accidental use of obsolete files.",
    publicationStatus: "awaiting-publication",
  },
  {
    slug: "member-education",
    title: "Member education",
    description:
      "Plain-language explainers will help cooperative members understand ownership, participation, and responsible financial choices.",
    publicationStatus: "awaiting-publication",
  },
];
