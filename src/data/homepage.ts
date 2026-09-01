import {
  BadgeCheck,
  BookOpenCheck,
  Building2,
  CircleDollarSign,
  ClipboardCheck,
  FileCheck2,
  FileText,
  GraduationCap,
  HandCoins,
  Landmark,
  Laptop,
  LibraryBig,
  Network,
  Presentation,
  Scale,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface HomepageFeature {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
}

export const institutionalPillars: HomepageFeature[] = [
  {
    title: "Cooperative Financial Network",
    description: "A shared institutional platform connecting cooperative credit unions around responsible practice and collective progress.",
    icon: Network,
  },
  {
    title: "Financial Inclusion",
    description: "Supporting cooperative institutions as they widen responsible access to useful financial services in their communities.",
    icon: HandCoins,
  },
  {
    title: "Affiliate Development",
    description: "Strengthening institutional capability through structured support, shared services, and accountable cooperation.",
    icon: Building2,
  },
  {
    title: "Training & Capacity Building",
    description: "Developing the practical knowledge, leadership, and operational discipline that resilient institutions need.",
    icon: GraduationCap,
  },
];

export const homepageServices: HomepageFeature[] = [
  {
    title: "Supervision & Compliance",
    description: "Support for consistent governance, regulatory awareness, and responsible institutional practice.",
    icon: ShieldCheck,
    href: "/services/regulatory-supervision",
  },
  {
    title: "Audit & Internal Control",
    description: "Practical support for sound controls, accountable processes, and stronger institutional oversight.",
    icon: ClipboardCheck,
    href: "/services/financial-auditing",
  },
  {
    title: "Capacity Building",
    description: "Role-relevant learning designed around the realities of cooperative financial institutions.",
    icon: Presentation,
    href: "/services/capacity-building",
  },
  {
    title: "Affiliate Banking",
    description: "Structured network-based support focused on institutional liquidity, financial resilience, and cooperative growth.",
    icon: Landmark,
    href: "/services/affiliate-banking",
  },
  {
    title: "Digital Transformation",
    description: "Structured guidance for secure digital operations, responsible data use, and sustainable adoption.",
    icon: Laptop,
    href: "/services/digitalization",
  },
  {
    title: "Consultancy & Institutional Support",
    description: "Focused technical assistance for governance, operations, strategy, and institutional development.",
    icon: Sparkles,
    href: "/services/consultancy",
  },
];

export const vtimeTopics = [
  ["Governance", Scale],
  ["Accounting", CircleDollarSign],
  ["Internal Control", ClipboardCheck],
  ["Credit Management", HandCoins],
  ["Compliance", BadgeCheck],
  ["Entrepreneurship", Sparkles],
  ["Leadership", Users],
  ["Digital Finance", Laptop],
] as const;

export const knowledgePreview: HomepageFeature[] = [
  { title: "Regulatory Resources", description: "Source-labelled regulatory references.", icon: Scale, href: "/knowledge?category=regulatory-library" },
  { title: "Circulars", description: "Controlled notices with clear publication status.", icon: FileText, href: "/knowledge?category=reccu-cam-circulars" },
  { title: "Compliance Guidance", description: "Practical resources for responsible operations.", icon: FileCheck2, href: "/knowledge?category=compliance" },
  { title: "Publications", description: "Approved reports, research, and institutional material.", icon: LibraryBig, href: "/knowledge?category=reports-publications" },
  { title: "Training Resources", description: "Learning material prepared for VTIME participants.", icon: BookOpenCheck, href: "/vtime/resources" },
];

export const editorialPreviews = [
  {
    category: "Cooperative governance",
    title: "Why clear roles strengthen cooperative institutions",
    summary: "An editorial concept exploring practical accountability across boards, committees, and management teams.",
  },
  {
    category: "Institutional development",
    title: "Preparing people for responsible digital transformation",
    summary: "A proposed explainer on connecting process, data responsibility, staff capability, and member experience.",
  },
  {
    category: "Knowledge management",
    title: "What makes an institutional resource trustworthy?",
    summary: "A planned guide to document ownership, issuing authority, version control, review dates, and publication status.",
  },
] as const;
