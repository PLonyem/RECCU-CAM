import {
  Building2,
  GraduationCap,
  Landmark,
  LibraryBig,
  MapPinned,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

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
      "Explore a source-labelled starter directory of cooperative credit unions connected to the network.",
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
