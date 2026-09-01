export interface NavigationChild {
  label: string;
  href: string;
  description: string;
}

export interface NavigationLink {
  label: string;
  href: string;
  children?: readonly NavigationChild[];
  align?: "left" | "right";
}

export const siteNavigation: readonly NavigationLink[] = [
  { label: "Home", href: "/" },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "Who We Are", href: "/about/who-we-are", description: "Our mandate, purpose, and cooperative identity." },
      { label: "Our History", href: "/about/history", description: "The milestones that shaped the network." },
      { label: "Governance", href: "/about/governance", description: "How oversight and accountability are structured." },
      { label: "Leadership", href: "/about/leadership", description: "Institutional leadership and responsibilities." },
      { label: "Institutional Framework", href: "/about/institutional-framework", description: "The legal and institutional foundation." },
    ],
  },
  {
    label: "Our Network",
    href: "/network/affiliates",
    children: [
      { label: "Affiliate Directory", href: "/network/affiliates", description: "Find participating credit unions." },
      { label: "Network Map", href: "/network/map", description: "Explore the network geographically." },
      { label: "Become an Affiliate", href: "/network/become-an-affiliate", description: "Learn about the affiliation pathway." },
    ],
  },
  {
    label: "Services",
    href: "/services",
    children: [
      { label: "Supervision & Compliance", href: "/services/regulatory-supervision", description: "Strengthening responsible cooperative operations." },
      { label: "Audit & Internal Control", href: "/services/financial-auditing", description: "Supporting sound controls and accountability." },
      { label: "Capacity Building", href: "/services/capacity-building", description: "Developing people and institutional capability." },
      { label: "Affiliate Banking", href: "/services/affiliate-banking", description: "Shared financial infrastructure for affiliates." },
      { label: "Digital Transformation", href: "/services/digitalization", description: "Practical pathways to digital readiness." },
      { label: "Consultancy", href: "/services/consultancy", description: "Specialist support for cooperative institutions." },
    ],
  },
  {
    label: "VTIME",
    href: "/vtime",
    children: [
      { label: "About VTIME", href: "/vtime", description: "The network learning and development platform." },
      { label: "Training Programs", href: "/vtime/programs", description: "Browse role-relevant learning pathways." },
      { label: "Training Calendar", href: "/vtime/calendar", description: "Review confirmed learning dates." },
      { label: "Registration", href: "/vtime/registration", description: "Register interest in a training program." },
      { label: "Resources", href: "/vtime/resources", description: "Learning materials and participant guidance." },
    ],
  },
  {
    label: "Knowledge Centre",
    href: "/knowledge",
    align: "right",
    children: [
      { label: "Regulatory Library", href: "/knowledge/regulatory-library", description: "Source-labelled regulatory references." },
      { label: "Circulars", href: "/knowledge/circulars", description: "Published institutional notices and circulars." },
      { label: "Publications", href: "/knowledge/publications", description: "Research, reports, and network publications." },
      { label: "Compliance Resources", href: "/knowledge/compliance-resources", description: "Practical compliance guidance and tools." },
      { label: "Downloads", href: "/resources", description: "Templates and approved downloadable resources." },
      { label: "FAQs", href: "/faq", description: "Answers to common platform questions." },
    ],
  },
  { label: "News & Events", href: "/news" },
  { label: "Contact", href: "/contact" },
] as const;

export const placeholderPages = {
  "/about/who-we-are": ["Who We Are", "About RECCU-CAM", "A fuller institutional profile is being prepared from verified RECCU-CAM source material."],
  "/about/history": ["Our History", "About RECCU-CAM", "A verified institutional timeline will be published here after review."],
  "/about/governance": ["Governance", "About RECCU-CAM", "Governance structures and responsibilities will be published after institutional confirmation."],
  "/about/leadership": ["Leadership", "About RECCU-CAM", "Verified leadership profiles and responsibilities will be published here."],
  "/about/institutional-framework": ["Institutional Framework", "About RECCU-CAM", "The approved legal and institutional framework will be presented here with source references."],
  "/network/become-an-affiliate": ["Become an Affiliate", "Our Network", "Eligibility, documentation, and the affiliation process are being prepared for publication."],
  "/services/consultancy": ["Consultancy", "Services", "Verified consultancy areas and engagement guidance will be published here."],
  "/vtime/registration": ["Training Registration", "VTIME", "Registration will open here when RECCU-CAM confirms program dates, venues, and participation terms."],
  "/vtime/resources": ["VTIME Resources", "VTIME", "Approved learning materials and participant resources will be made available here."],
  "/knowledge/regulatory-library": ["Regulatory Library", "Knowledge Centre", "Source-labelled regulations and supervisory references are being organized for publication."],
  "/knowledge/circulars": ["Circulars", "Knowledge Centre", "Approved circulars will appear here with issuer, date, version, and status information."],
  "/knowledge/publications": ["Publications", "Knowledge Centre", "Verified RECCU-CAM reports, research, and publications will be made available here."],
  "/knowledge/compliance-resources": ["Compliance Resources", "Knowledge Centre", "Practical, version-controlled compliance resources are being prepared."],
  "/privacy": ["Privacy", "Legal", "RECCU-CAM's reviewed privacy notice will be published here."],
  "/terms": ["Terms of Use", "Legal", "Reviewed terms for use of the RECCU-CAM platform will be published here."],
  "/accessibility": ["Accessibility", "Platform", "The platform is being developed for inclusive access. A detailed accessibility statement is being prepared."],
  "/sitemap": ["Sitemap", "Platform", "Use the navigation below to explore the current public sections of the RECCU-CAM platform."],
} as const;

export type PlaceholderPath = keyof typeof placeholderPages;

