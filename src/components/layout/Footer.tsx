"use client";

import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { BrandMark } from "@/components/brand/BrandMark";
import { Container } from "@/components/ui/Container";
import { institution } from "@/config/institution";
import type { SiteSettings } from "@/generated/prisma/client";
import { useLanguage } from "@/context/LanguageContext";

const footerGroups = [
  {
    title: "Network",
    links: [
      ["Network Overview", "/network"],
      ["Affiliate Directory", "/network/affiliates"],
      ["Network Map", "/network/map"],
      ["Become an Affiliate", "/network/become-an-affiliate"],
    ],
  },
  {
    title: "Services",
    links: [
      ["Services Overview", "/services"],
      ["Supervision & Compliance", "/services/regulatory-supervision"],
      ["Audit & Internal Control", "/services/financial-auditing"],
      ["Capacity Building", "/services/capacity-building"],
      ["Affiliate Banking", "/services/affiliate-banking"],
      ["Digital Transformation", "/services/digitalization"],
      ["Consultancy", "/services/consultancy"],
    ],
  },
  {
    title: "Resources",
    links: [
      ["FAQs", "/faq"],
    ],
  },
] as const;

export function Footer({ settings }: { settings?: SiteSettings | null }) {
  const { t, tText } = useLanguage();
  const address = settings?.address || (institution.contact.streetAddress
    ? `${institution.contact.streetAddress}, ${institution.location.city}, ${institution.location.country}`
    : `${tText("Address not published")} — ${institution.location.city}, ${institution.location.country}`);

  return (
    <footer className="public-footer text-white print:hidden">
      <Container className="grid gap-10 py-section-sm md:grid-cols-2 xl:grid-cols-[1.3fr_repeat(4,1fr)]">
        <section aria-labelledby="footer-reccu-cam">
          <div className="flex items-center gap-3">
            <BrandMark className="bg-white text-institutional shadow-none" />
            <div>
              <h2 id="footer-reccu-cam" className="font-display text-xl font-bold">{settings?.siteName || "RECCU-CAM"}</h2>
              <p className="mt-1 text-xs text-primary-200">{settings?.fullName || institution.displayName}</p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-7 text-primary-100">{tText(institution.platformStatement)}</p>
          <Link href="/about" className="public-accent mt-5 inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
            {tText("About the institution")} <ArrowUpRight className="h-4 w-4" />
          </Link>
        </section>

        {footerGroups.map((group) => (
          <nav key={group.title} aria-labelledby={`footer-${group.title.toLowerCase()}`}>
            <h2 id={`footer-${group.title.toLowerCase()}`} className="public-accent text-meta uppercase">{tText(group.title)}</h2>
            <ul className="mt-4 space-y-3">
              {group.links.map(([label, href]) => (
                <li key={`${href}-${label}`}>
                  <Link href={href} className="rounded-sm text-sm text-primary-100 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                    {tText(label)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <section aria-labelledby="footer-contact">
          <h2 id="footer-contact" className="public-accent text-meta uppercase">{tText("Contact")}</h2>
          <address className="mt-4 space-y-4 not-italic text-sm leading-6 text-primary-100">
            <p className="flex gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-300" /><span>{address}</span></p>
            <p className="flex gap-2.5"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent-300" /><span>{settings?.email || institution.contact.email || tText("Email not published")}</span></p>
            <p className="flex gap-2.5"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent-300" /><span>{settings?.phone || institution.contact.phone || tText("Phone not published")}</span></p>
          </address>
          <Link href="/contact" className="mt-5 inline-flex rounded-sm text-sm font-semibold text-white underline decoration-accent-300 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
            {tText("Contact RECCU-CAM")}
          </Link>
        </section>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-4 py-5 text-xs text-primary-200 lg:flex-row lg:items-center lg:justify-between">
          <p>© {new Date().getFullYear()} {institution.displayName}. {t("common.rightsReserved")}</p>
          <nav aria-label={t("common.legalAndAccessibility")} className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/privacy" className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">{tText("Privacy")}</Link>
            <Link href="/terms" className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">{tText("Terms")}</Link>
            <Link href="/accessibility" className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">{tText("Accessibility")}</Link>
            <Link href="/sitemap" className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">{tText("Sitemap")}</Link>
          </nav>
        </Container>
      </div>
    </footer>
  );
}
