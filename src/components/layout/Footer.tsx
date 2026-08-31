"use client";

import Link from "next/link";
import Image from "next/image";
import { Building2, MapPin, Mail } from "lucide-react";
import { contactInfo } from "@/lib/mock-data";
import { useLanguage } from "@/context/LanguageContext";
import { localize, type TranslationKey } from "@/lib/i18n";
import { SocialIcon } from "@/components/ui/SocialIcon";
import logo from "../../../public/logo.jpg";

const CAMCCUL_FACEBOOK_URL = "https://www.facebook.com/CamCCUL/";
const CAMCCUL_YOUTUBE_URL = "https://www.youtube.com/@camerooncooperativecreditunion";

const quickLinks: { key: TranslationKey; href: string }[] = [
  { key: "footer_link_home", href: "/" },
  { key: "footer_link_about", href: "/about" },
  { key: "footer_link_services", href: "/services" },
  { key: "footer_link_affiliates", href: "/affiliates" },
  { key: "footer_link_resources", href: "/resources" },
  { key: "footer_link_news", href: "/news" },
  { key: "footer_link_contact", href: "/contact" },
];

const resourceLinks: { key: TranslationKey; href: string }[] = [
  { key: "footer_resource_cobac", href: "/resources" },
  { key: "footer_resource_training", href: "/resources" },
  { key: "footer_resource_faq", href: "/faq" },
];

export function Footer() {
  const { t, language } = useLanguage();
  const [addressLine1, addressLine2] = contactInfo.address.split(" — ");

  return (
    <footer className="print:hidden bg-primary-900 text-white pt-16 pb-8">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-md bg-white flex items-center justify-center overflow-hidden p-1 shrink-0">
                <Image src={logo} alt="CamCCUL logo" className="h-full w-full object-contain" />
              </div>
              <span className="font-display font-bold text-lg">CamCCUL</span>
            </div>
            <p className="text-sm text-primary-200 mt-2">{t("footer_tagline")}</p>
            <p className="text-sm text-primary-200 mt-2">{t("footer_about")}</p>

            <form onSubmit={(e) => e.preventDefault()} className="mt-4">
              <label
                htmlFor="newsletter-email"
                className="text-xs font-semibold uppercase tracking-wider text-primary-200"
              >
                {t("newsletter_heading")}
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  placeholder={t("newsletter_placeholder")}
                  className="min-w-0 flex-1 rounded-lg bg-primary-800 border border-primary-700 px-3 py-2 text-sm text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-lg bg-white hover:bg-primary-50 text-primary-700 text-sm font-medium px-4 py-2 transition-colors"
                >
                  {t("newsletter_button")}
                </button>
              </div>
            </form>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">
              {t("footer_quick_links")}
            </h3>
            {quickLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className="text-sm text-primary-200 hover:text-white transition-colors block mb-2"
              >
                {t(link.key)}
              </Link>
            ))}
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">
              {t("footer_resources")}
            </h3>
            {resourceLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className="text-sm text-primary-200 hover:text-white transition-colors block mb-2"
              >
                {t(link.key)}
              </Link>
            ))}
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">
              {t("footer_contact")}
            </h3>
            <div className="flex items-start gap-2 text-sm text-primary-200 mb-2">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p>{addressLine1}</p>
                {addressLine2 && <p>{addressLine2}</p>}
              </div>
            </div>
            <a
              href={`mailto:${contactInfo.email}`}
              className="flex items-center gap-2 text-sm text-primary-200 hover:text-white transition-colors"
            >
              <Mail className="h-4 w-4 shrink-0" />
              {t("contact_label_email")}
            </a>

            <div className="my-3 border-t border-primary-700" />

            <p className="text-sm text-primary-200">
              {localize(contactInfo.officeHours, language)}
            </p>

            <div className="border-t border-primary-700 my-4" />

            <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">
              {t("footer_follow_us")}
            </h4>
            <div className="flex items-center gap-3">
              <SocialIcon platform="facebook" href={CAMCCUL_FACEBOOK_URL} />
              <SocialIcon platform="twitter" href="#" />
              <SocialIcon platform="linkedin" href="#" />
              <SocialIcon platform="youtube" href={CAMCCUL_YOUTUBE_URL} />
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            href="/affiliates"
            className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium text-center w-full max-w-md mx-auto transition-colors"
          >
            <Building2 className="h-5 w-5" aria-hidden="true" />
            {t("nav_find_credit_union")}
          </Link>
        </div>

        <div className="border-t border-primary-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-primary-200 gap-4">
          <p>{t("footer_copyright")}</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              {t("footer_privacy")}
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              {t("footer_terms")}
            </Link>
            <Link href="/security" className="hover:text-white transition-colors">
              {t("footer_security")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
