"use client";

import Link from "next/link";
import { ArrowRight, Clock, Shield, TrendingUp } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FadeUp } from "@/components/ui/FadeUp";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { localize, type LocalizedText } from "@/lib/i18n";
import { affiliates } from "@/lib/mock-data";

const affiliateCount = affiliates.filter((a) => a.isActive).length;

const whyItMatters: { icon: typeof Clock; title: LocalizedText; description: LocalizedText }[] = [
  {
    icon: Clock,
    title: { en: "Faster Reporting", fr: "Rapports Plus Rapides" },
    description: {
      en: "Credit union managers currently spend days preparing paper reports. Digital submission reduces this to hours, freeing time to serve members.",
      fr: "Les gestionnaires de coopératives passent actuellement des jours à préparer des rapports papier. La soumission numérique réduit ce délai à quelques heures, libérant du temps pour servir les membres.",
    },
  },
  {
    icon: Shield,
    title: { en: "Better Oversight", fr: "Meilleure Supervision" },
    description: {
      en: `Automated validation and real-time dashboards help League auditors identify risks early, protecting member savings across all ${affiliateCount} affiliates.`,
      fr: `La validation automatisée et les tableaux de bord en temps réel aident les auditeurs de la Ligue à identifier les risques rapidement, protégeant l'épargne des membres dans les ${affiliateCount} affiliées.`,
    },
  },
  {
    icon: TrendingUp,
    title: { en: "Stronger Credit Unions", fr: "Des Coopératives Plus Fortes" },
    description: {
      en: "When operations run smoothly, credit unions can focus on growth — reaching more farmers, traders, and families with affordable financial services.",
      fr: "Lorsque les opérations se déroulent sans accroc, les coopératives peuvent se concentrer sur la croissance — atteignant davantage d'agriculteurs, de commerçants et de familles avec des services financiers abordables.",
    },
  },
];

const phase1Features: LocalizedText[] = [
  {
    en: `Searchable directory of all ${affiliateCount}+ affiliate credit unions across all 10 regions`,
    fr: `Annuaire consultable des plus de ${affiliateCount} coopératives de crédit affiliées dans les 10 régions`,
  },
  {
    en: "Downloadable COBAC templates, circulars, and training materials",
    fr: "Modèles COBAC, circulaires et supports de formation téléchargeables",
  },
  {
    en: "Real-time news and announcements for the cooperative community",
    fr: "Actualités et annonces en temps réel pour la communauté coopérative",
  },
  {
    en: "Mobile-friendly design accessible to credit union managers in the field",
    fr: "Conception adaptée aux mobiles, accessible aux gestionnaires de coopératives sur le terrain",
  },
];

const phase2Features: LocalizedText[] = [
  {
    en: "Guided multi-step COBAC report processing with built-in validation",
    fr: "Traitement guidé des rapports COBAC en plusieurs étapes avec validation intégrée",
  },
  {
    en: "AI-powered math verification to catch errors before auditor review",
    fr: "Vérification mathématique assistée par IA pour détecter les erreurs avant l'examen par l'auditeur",
  },
  {
    en: "Real-time dashboards showing compliance status across all affiliates",
    fr: "Tableaux de bord en temps réel affichant l'état de conformité de toutes les affiliées",
  },
  {
    en: "Immutable audit trails and anomaly detection for financial integrity",
    fr: "Pistes d'audit inaltérables et détection d'anomalies pour l'intégrité financière",
  },
];

const phase3Features: LocalizedText[] = [
  {
    en: "Mobile tools for field auditors to record data from any location",
    fr: "Outils mobiles permettant aux auditeurs de terrain de saisir des données depuis n'importe quel lieu",
  },
  {
    en: "USSD-based access for areas with limited internet connectivity",
    fr: "Accès par USSD pour les zones à connectivité internet limitée",
  },
  {
    en: "Digital field audit tools with GPS verification and real-time evidence capture",
    fr: "Outils numériques d'audit de terrain avec vérification GPS et collecte de preuves en temps réel",
  },
  {
    en: "Integrated document management system for all League records",
    fr: "Système intégré de gestion documentaire pour l'ensemble des dossiers de la Ligue",
  },
];

export default function DigitalizationPage() {
  const { t, language } = useLanguage();

  return (
    <>
      <PageHero
        title={t("nav_services_digitalization")}
        subtitle={t("service_digitalization_subtitle").replace("{count}", String(affiliateCount))}
        breadcrumb={[
          { label: t("nav_home"), href: "/" },
          { label: t("nav_services"), href: "/services" },
          { label: t("nav_services_digitalization"), href: "/services/digitalization" },
        ]}
      />

      {/* SECTION 1: THE COMMITMENT */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4">
          <FadeUp>
            <blockquote className="border-l-4 border-accent-500 bg-accent-50 rounded-r-lg p-6 mb-8 italic text-lg text-gray-700">
              {language === "fr"
                ? "« CamCCUL pilote la digitalisation de ses coopératives de crédit affiliées, rationalisant les opérations et améliorant la prestation de services grâce à des technologies innovantes. »"
                : "“CamCCUL is spearheading the digitalization of its affiliate credit unions, streamlining operations and enhancing delivery through innovative technology.”"}
            </blockquote>
            <p className="text-sm text-gray-500 mb-8">
              {language === "fr" ? "— Charte des Services de CamCCUL" : "— CamCCUL Services Charter"}
            </p>
            <p className="text-gray-700 leading-relaxed">
              {language === "fr"
                ? "Cet engagement n'est pas qu'une simple déclaration. C'est un programme de transformation en plusieurs phases conçu pour faire entrer chaque coopérative de crédit — de Bamenda à Maroua — dans l'ère numérique. Notre objectif est simple : des rapports plus rapides, une meilleure supervision et des coopératives plus solides au service de millions de Camerounais."
                : "This commitment is not just a statement. It is a multi-phase transformation program designed to bring every credit union — from Bamenda to Maroua — into the digital age. Our goal is simple: faster reporting, better oversight, and stronger credit unions serving millions of Cameroonians."}
            </p>
          </FadeUp>
        </div>
      </section>

      {/* SECTION 2: OUR DIGITALIZATION PHASES */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeader
            align="center"
            title={language === "fr" ? "La Feuille de Route" : "The Roadmap"}
            subtitle={
              language === "fr"
                ? "Une approche progressive pour transformer le secteur de la finance coopérative du Cameroun."
                : "A phased approach to transforming Cameroon's cooperative finance sector."
            }
          />

          <div className="mt-12 max-w-4xl mx-auto px-4">
            {/* PHASE 1 */}
            <FadeUp index={0} className="border-l-4 border-green-500 bg-white rounded-r-xl p-6 mb-6 shadow-sm">
              <Badge className="bg-green-100 text-green-700">
                {language === "fr" ? "EN LIGNE" : "LIVE"}
              </Badge>
              <h3 className="font-display text-xl font-bold text-primary-900 mt-3">
                {language === "fr" ? "Phase 1 — Présence Numérique" : "Phase 1 — Digital Presence"}
              </h3>
              <p className="text-gray-600 mt-2">
                {language === "fr"
                  ? "Un site web public moderne et responsive servant de vitrine numérique de la Ligue. Fonctionnalités :"
                  : "A modern, responsive public website serving as the digital face of the League. Features include:"}
              </p>
              <ul className="mt-3 space-y-1 text-sm text-gray-600 list-disc list-inside">
                {phase1Features.map((feature) => (
                  <li key={feature.en}>{localize(feature, language)}</li>
                ))}
              </ul>
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 mt-4"
              >
                {language === "fr" ? "Explorer le Site" : "Explore the Website"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </FadeUp>

            {/* PHASE 2 */}
            <FadeUp index={1} className="border-l-4 border-amber-500 bg-white rounded-r-xl p-6 mb-6 shadow-sm">
              <Badge className="bg-amber-100 text-amber-700">
                {language === "fr" ? "EN DÉVELOPPEMENT" : "IN DEVELOPMENT"}
              </Badge>
              <h3 className="font-display text-xl font-bold text-primary-900 mt-3">
                {language === "fr" ? "Phase 2 — Système de Rapports Numériques" : "Phase 2 — Digital Reporting System"}
              </h3>
              <p className="text-gray-600 mt-2">
                {language === "fr"
                  ? "Un système de rapports interne et automatisé qui transformera la manière dont la Ligue traite les données financières des affiliées :"
                  : "An internal, automated reporting system that will transform how the League processes affiliate financial data:"}
              </p>
              <ul className="mt-3 space-y-1 text-sm text-gray-600 list-disc list-inside">
                {phase2Features.map((feature) => (
                  <li key={feature.en}>{localize(feature, language)}</li>
                ))}
              </ul>
            </FadeUp>

            {/* PHASE 3 */}
            <FadeUp index={2} className="border-l-4 border-gray-300 bg-white rounded-r-xl p-6 mb-6 shadow-sm">
              <Badge className="bg-gray-100 text-gray-600">
                {language === "fr" ? "PLANIFIÉE" : "PLANNED"}
              </Badge>
              <h3 className="font-display text-xl font-bold text-primary-900 mt-3">
                {language === "fr" ? "Phase 3 — Services Mobiles et de Terrain" : "Phase 3 — Mobile & Field Services"}
              </h3>
              <p className="text-gray-600 mt-2">
                {language === "fr"
                  ? "Étendre l'accès numérique aux coopératives de crédit les plus reculées et aux auditeurs de terrain :"
                  : "Extending digital access to the most remote credit unions and field auditors:"}
              </p>
              <ul className="mt-3 space-y-1 text-sm text-gray-600 list-disc list-inside">
                {phase3Features.map((feature) => (
                  <li key={feature.en}>{localize(feature, language)}</li>
                ))}
              </ul>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* SECTION 3: WHY DIGITALIZATION MATTERS */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4">
          <SectionHeader
            align="center"
            title={language === "fr" ? "Pourquoi C'est Important" : "Why It Matters"}
            subtitle={
              language === "fr"
                ? "La digitalisation n'est pas qu'une question de technologie — c'est une question de personnes."
                : "Digitalization is not just about technology — it's about people."
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {whyItMatters.map((item, index) => (
              <FadeUp key={item.title.en} index={index}>
                <Card className="p-8 h-full">
                  <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6 text-primary-700" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-primary-900">
                    {localize(item.title, language)}
                  </h3>
                  <p className="text-gray-600 mt-2 text-sm">
                    {localize(item.description, language)}
                  </p>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: CTA */}
      <section className="bg-primary-900 text-white py-16 text-center">
        <div className="max-w-3xl mx-auto px-4 flex flex-col items-center">
          <FadeUp className="flex flex-col items-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              {language === "fr" ? "Devenez Partenaire" : "Partner With Us"}
            </h2>
            <p className="text-gray-300 mt-4">
              {language === "fr"
                ? "Intéressé à soutenir la digitalisation du secteur des coopératives de crédit du Cameroun ? Nous accueillons favorablement les partenariats avec des organisations de développement, des fournisseurs de technologie et des acteurs de l'inclusion financière."
                : "Interested in supporting the digitalization of Cameroon's cooperative credit union sector? We welcome partnerships with development organizations, technology providers, and financial inclusion advocates."}
            </p>
            <Link
              href="/contact"
              className={cn(buttonVariants({ variant: "accent", size: "lg" }), "mt-8")}
            >
              {t("nav_contact")}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
