import type { ServiceCategory } from "./types";

/**
 * Network service taxonomy. These categories are filter vocabulary only;
 * inclusion here does not claim that any affiliate currently offers them.
 */
export const affiliateServiceCategories: readonly ServiceCategory[] = [
  {
    id: "supervision-compliance",
    name: "Supervision & Compliance",
    slug: "supervision-compliance",
    description: "Supervisory, governance, and compliance support.",
    active: true,
  },
  {
    id: "audit-internal-control",
    name: "Audit & Internal Control",
    slug: "audit-internal-control",
    description: "Audit readiness and internal-control support.",
    active: true,
  },
  {
    id: "capacity-building",
    name: "Capacity Building",
    slug: "capacity-building",
    description: "Professional and institutional capability development.",
    active: true,
  },
  {
    id: "affiliate-banking",
    name: "Affiliate Banking",
    slug: "affiliate-banking",
    description: "Shared financial infrastructure and operational support.",
    active: true,
  },
  {
    id: "digital-transformation",
    name: "Digital Transformation",
    slug: "digital-transformation",
    description: "Digital operations and responsible technology adoption.",
    active: true,
  },
  {
    id: "consultancy-institutional-support",
    name: "Consultancy & Institutional Support",
    slug: "consultancy-institutional-support",
    description: "Focused technical and institutional-development support.",
    active: true,
  },
];
