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
      { label: "Affiliate Banking", href: "/services/affiliate-banking", description: "Structured financial support for eligible affiliates." },
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
      { label: "Regulatory Library", href: "/knowledge?category=regulatory-library", description: "Source-labelled regulatory references." },
      { label: "Circulars", href: "/knowledge?category=reccu-cam-circulars", description: "Published institutional notices and circulars." },
      { label: "Publications", href: "/knowledge?category=reports-publications", description: "Research, reports, and network publications." },
      { label: "Compliance Resources", href: "/knowledge?category=compliance", description: "Practical compliance guidance and tools." },
      { label: "Downloads", href: "/resources", description: "Templates and approved downloadable resources." },
      { label: "FAQs", href: "/faq", description: "Answers to common platform questions." },
    ],
  },
  { label: "News & Events", href: "/news" },
  { label: "Contact", href: "/contact" },
] as const;

export const informationPages = {
  "/about/who-we-are": ["Who We Are", "About RECCU-CAM", "A fuller institutional profile is not currently available for public display."],
  "/about/history": ["Our History", "About RECCU-CAM", "A verified institutional timeline is not currently available for public display."],
  "/about/governance": ["Governance", "About RECCU-CAM", "Confirmed governance structures and responsibilities are not currently available for public display."],
  "/about/leadership": ["Leadership", "About RECCU-CAM", "Verified leadership profiles and responsibilities are not currently available for public display."],
  "/about/institutional-framework": ["Institutional Framework", "About RECCU-CAM", "Approved legal and institutional framework details require source confirmation before public display."],
  "/services/consultancy": ["Consultancy", "Services", "Confirmed consultancy areas and engagement guidance are not currently available for public display."],
  "/vtime/resources": ["VTIME Resources", "VTIME", "No approved public learning materials are currently listed."],
  "/privacy": ["Privacy", "Legal", "A reviewed RECCU-CAM privacy notice is not currently available for public display."],
  "/terms": ["Terms of Use", "Legal", "Reviewed terms for use of the RECCU-CAM platform are not currently available for public display."],
  "/accessibility": ["Accessibility", "Platform", "The platform supports keyboard navigation, visible focus, reduced motion, and semantic landmarks. A reviewed accessibility statement is not currently available."],
  "/sitemap": ["Sitemap", "Platform", "Use the navigation below to explore the current public sections of the RECCU-CAM platform."],
} as const;

export type InformationPath = keyof typeof informationPages;
