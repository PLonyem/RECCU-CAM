import {
  Building2,
  ClipboardCheck,
  GraduationCap,
  Landmark,
  Laptop,
  LibraryBig,
  MapPinned,
  Presentation,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type ServiceAreaKey =
  | "supervisionCompliance"
  | "auditInternalControl"
  | "capacityBuilding"
  | "affiliateBanking"
  | "digitalTransformation"
  | "consultancy";

export interface ServiceArea {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  publicationStatus: "detailed" | "overview";
  relatedHref?: string;
  relatedLabel?: string;
}

export const serviceAreas = {
  supervisionCompliance: {
    title: "Supervision & Compliance",
    description: "Support for consistent governance, regulatory awareness, and responsible institutional practice.",
    href: "/services/regulatory-supervision",
    icon: ShieldCheck,
    publicationStatus: "overview",
    relatedHref: "/knowledge?category=compliance",
    relatedLabel: "Explore compliance resources",
  },
  auditInternalControl: {
    title: "Audit & Internal Control",
    description: "Practical support for sound controls, accountable processes, and stronger institutional oversight.",
    href: "/services/financial-auditing",
    icon: ClipboardCheck,
    publicationStatus: "overview",
    relatedHref: "/knowledge?category=internal-control",
    relatedLabel: "Explore internal-control resources",
  },
  capacityBuilding: {
    title: "Capacity Building",
    description: "Role-relevant learning designed around the realities of cooperative financial institutions.",
    href: "/services/capacity-building",
    icon: Presentation,
    publicationStatus: "overview",
    relatedHref: "/vtime",
    relatedLabel: "Explore VTIME",
  },
  affiliateBanking: {
    title: "Affiliate Banking",
    description: "Structured network-based support focused on institutional liquidity, financial resilience, and cooperative growth.",
    href: "/services/affiliate-banking",
    icon: Landmark,
    publicationStatus: "detailed",
  },
  digitalTransformation: {
    title: "Digital Transformation",
    description: "Structured guidance for secure digital operations, responsible data use, and sustainable adoption.",
    href: "/services/digitalization",
    icon: Laptop,
    publicationStatus: "overview",
    relatedHref: "/knowledge",
    relatedLabel: "Explore the Knowledge Centre",
  },
  consultancy: {
    title: "Consultancy & Institutional Support",
    description: "Focused technical assistance for governance, operations, strategy, and institutional development.",
    href: "/services/consultancy",
    icon: Sparkles,
    publicationStatus: "overview",
    relatedHref: "/contact",
    relatedLabel: "View contact guidance",
  },
} as const satisfies Record<ServiceAreaKey, ServiceArea>;

export const serviceAreaList: readonly ServiceArea[] = Object.values(serviceAreas);

export interface PlatformService {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  status?: "available" | "preview";
}

export const platformServices: PlatformService[] = [
  {
    title: "Network directory",
    description:
      "Explore a source-labelled directory of cooperative credit unions connected to the network.",
    href: "/network/affiliates",
    icon: Building2,
    status: "available",
  },
  {
    title: "Interactive network map",
    description:
      "See published affiliate locations in a focused map experience, with clear verification notes.",
    href: "/network/map",
    icon: MapPinned,
    status: "available",
  },
  {
    title: "Affiliate Banking",
    description:
      "Structured network-based support for institutional liquidity, financial resilience, and cooperative growth.",
    href: "/services/affiliate-banking",
    icon: Landmark,
    status: "preview",
  },
  {
    title: "VTIME learning",
    description:
      "A structured home for professional development, governance learning, and practical cooperative skills.",
    href: "/vtime",
    icon: GraduationCap,
    status: "preview",
  },
  {
    title: "Knowledge Centre",
    description:
      "Find verified policies, templates, explainers, and compliance resources as they are published.",
    href: "/knowledge",
    icon: LibraryBig,
    status: "preview",
  },
  {
    title: "Network governance",
    description:
      "Digital workflows designed to strengthen consistent reporting, accountability, and member service.",
    href: "/about",
    icon: ShieldCheck,
    status: "preview",
  },
];
