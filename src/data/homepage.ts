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
  Laptop,
  LibraryBig,
  Network,
  Scale,
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
