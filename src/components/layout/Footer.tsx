import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { BrandMark } from "@/components/brand/BrandMark";
import { Container } from "@/components/ui/Container";
import { institution } from "@/config/institution";

const groups = [
  {
    title: "Network",
    links: [
      ["Affiliate directory", "/network/affiliates"],
      ["Interactive map", "/network/map"],
      ["Affiliate Banking", "/services/affiliate-banking"],
    ],
  },
  {
    title: "Capability",
    links: [
      ["VTIME", "/vtime"],
      ["Programmes", "/vtime/programs"],
      ["Training calendar", "/vtime/calendar"],
      ["Knowledge Centre", "/knowledge"],
    ],
  },
  {
    title: "Institution",
    links: [
      ["About", "/about"],
      ["News", "/news"],
      ["Contact", "/contact"],
      ["Portal sign in", "/login"],
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="bg-primary-900 text-white print:hidden">
      <Container className="grid gap-12 py-16 lg:grid-cols-[1.35fr_2fr]">
        <div>
          <div className="flex items-center gap-3">
            <BrandMark className="bg-white text-primary-900" />
            <div>
              <p className="font-display text-xl font-bold">{institution.brandName}</p>
              <p className="text-xs text-primary-200">{institution.displayName}</p>
            </div>
          </div>
          <p className="mt-6 max-w-md text-sm leading-7 text-primary-200">{institution.platformStatement}</p>
          <p className="mt-5 flex items-center gap-2 text-sm text-primary-100">
            <MapPin className="h-4 w-4 text-accent-300" /> {institution.location.city}, {institution.location.country}
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {groups.map((group) => (
            <div key={group.title}>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-accent-300">{group.title}</h2>
              <ul className="mt-4 space-y-3">
                {group.links.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-primary-100 hover:text-white">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-3 py-5 text-xs text-primary-300 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {institution.displayName}. Institutional details are source-labelled.</p>
          <a href={institution.approval.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-white">
            Verify MINFI source <ArrowUpRight className="h-3 w-3" />
          </a>
        </Container>
      </div>
    </footer>
  );
}
