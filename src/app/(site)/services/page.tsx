"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Shield, FileSearch, GraduationCap, Network, ArrowRight } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Card } from "@/components/ui/Card";
import { FadeUp } from "@/components/ui/FadeUp";
import { services, affiliates } from "@/lib/mock-data";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/i18n";

const affiliateCount = affiliates.filter((a) => a.isActive).length;

const serviceIcons: Record<string, LucideIcon> = {
  Shield,
  FileSearch,
  GraduationCap,
  Network,
};

const serviceTranslationKeys: Record<string, { titleKey: TranslationKey; descriptionKey: TranslationKey }> = {
  "/services/regulatory-supervision": {
    titleKey: "nav_services_regulatory",
    descriptionKey: "home_service_regulatory_desc",
  },
  "/services/financial-auditing": {
    titleKey: "nav_services_auditing",
    descriptionKey: "home_service_auditing_desc",
  },
  "/services/capacity-building": {
    titleKey: "nav_services_capacity",
    descriptionKey: "home_service_capacity_desc",
  },
  "/services/digitalization": {
    titleKey: "nav_services_digitalization",
    descriptionKey: "home_service_digitalization_desc",
  },
};

export default function ServicesPage() {
  const { t } = useLanguage();

  return (
    <>
      <PageHero
        title={t("services_page_title")}
        subtitle={t("services_page_subtitle").replace("{count}", String(affiliateCount))}
        breadcrumb={[
          { label: t("nav_home"), href: "/" },
          { label: t("nav_services"), href: "/services" },
        ]}
      />

      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => {
              const Icon = serviceIcons[service.icon] ?? Shield;
              const translation = serviceTranslationKeys[service.href];
              return (
                <FadeUp key={service.href} index={index}>
                  <Card className="p-8 flex flex-col h-full">
                    <div className="rounded-full p-3 h-12 w-12 bg-primary-100 text-primary-600 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h2 className="font-display text-xl font-bold text-primary-900 mb-3">
                      {translation ? t(translation.titleKey) : service.title}
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1">
                      {(translation ? t(translation.descriptionKey) : service.description).replace(
                        "{count}",
                        String(affiliateCount)
                      )}
                    </p>
                    <Link
                      href={service.href}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      {t("services_learn_more")}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Card>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
