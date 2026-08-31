"use client";

import { Eye, Monitor, AlertTriangle, Shield } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { FadeUp } from "@/components/ui/FadeUp";
import { useLanguage } from "@/context/LanguageContext";
import { localize, type LocalizedText } from "@/lib/i18n";
import { affiliates } from "@/lib/mock-data";

const affiliateCount = affiliates.filter((a) => a.isActive).length;

const supervisoryAreas: LocalizedText[] = [
  { en: "Capital Adequacy", fr: "Adéquation des Fonds Propres" },
  { en: "Liquidity Management", fr: "Gestion de la Liquidité" },
  { en: "Asset Quality Review", fr: "Examen de la Qualité des Actifs" },
  { en: "Governance Assessment", fr: "Évaluation de la Gouvernance" },
  { en: "Internal Controls Audit", fr: "Audit des Contrôles Internes" },
  { en: "AML/CFT Compliance", fr: "Conformité LBC/FT" },
  { en: "Risk Management", fr: "Gestion des Risques" },
  { en: "Member Protection", fr: "Protection des Membres" },
];

const approach: { icon: typeof Eye; title: LocalizedText; description: LocalizedText }[] = [
  {
    icon: Eye,
    title: { en: "On-Site Inspections", fr: "Inspections sur Site" },
    description: {
      en: "Our League auditors conduct regular physical visits to every affiliate credit union, verifying financial records, counting cash, reviewing loan files, and assessing operational controls firsthand.",
      fr: "Les auditeurs de la Ligue effectuent régulièrement des visites physiques à chaque coopérative de crédit affiliée, vérifiant les dossiers financiers, comptant les liquidités, examinant les dossiers de prêts et évaluant directement les contrôles opérationnels.",
    },
  },
  {
    icon: Monitor,
    title: { en: "Off-Site Surveillance", fr: "Surveillance à Distance" },
    description: {
      en: "We continuously monitor financial data submitted by affiliates, tracking key indicators like liquidity ratios, non-performing loan levels, and capital adequacy against COBAC thresholds.",
      fr: "Nous surveillons en continu les données financières soumises par les affiliées, en suivant des indicateurs clés tels que les ratios de liquidité, le niveau des prêts non performants et l'adéquation des fonds propres par rapport aux seuils de la COBAC.",
    },
  },
  {
    icon: AlertTriangle,
    title: { en: "Early Warning System", fr: "Système d'Alerte Précoce" },
    description: {
      en: "When an affiliate shows signs of financial stress — declining liquidity, rising defaults, governance weaknesses — we intervene early with corrective measures and enhanced supervision.",
      fr: "Lorsqu'une affiliée montre des signes de tension financière — baisse de liquidité, hausse des impayés, faiblesses de gouvernance — nous intervenons rapidement avec des mesures correctives et une supervision renforcée.",
    },
  },
];

export default function RegulatorySupervisionPage() {
  const { t, language } = useLanguage();

  return (
    <>
      <PageHero
        title={t("nav_services_regulatory")}
        subtitle={t("service_regulatory_subtitle").replace("{count}", String(affiliateCount))}
        breadcrumb={[
          { label: t("nav_home"), href: "/" },
          { label: t("nav_services"), href: "/services" },
          { label: t("nav_services_regulatory"), href: "/services/regulatory-supervision" },
        ]}
      />

      {/* SECTION 1: OVERVIEW */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4">
          <FadeUp className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="font-display text-2xl font-bold text-primary-900 mb-4">
                {language === "fr"
                  ? "Protéger l'Épargne des Membres par une Supervision Rigoureuse"
                  : "Safeguarding Member Savings Through Rigorous Oversight"}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {language === "fr"
                  ? "En tant qu'organe suprême de supervision des coopératives de crédit au Cameroun, CamCCUL veille à ce que chaque affiliée opère en conformité avec la réglementation de la COBAC et les meilleures pratiques internationales. Notre cadre de supervision est conçu pour protéger les dépôts des membres, maintenir la stabilité financière et promouvoir la confiance dans le secteur financier coopératif."
                  : "As the apex supervisory body for cooperative credit unions in Cameroon, CamCCUL is responsible for ensuring that every affiliate operates in compliance with COBAC regulations and international best practices. Our supervision framework is designed to protect member deposits, maintain financial stability, and promote confidence in the cooperative financial sector."}
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                {language === "fr"
                  ? "Grâce à des inspections régulières sur site, une surveillance à distance et un suivi continu, nous évaluons la santé financière, les structures de gouvernance et l'intégrité opérationnelle de chaque coopérative de crédit. La détection précoce des risques nous permet d'intervenir avant que les problèmes ne s'aggravent, protégeant ainsi les coopératives individuelles et l'écosystème financier dans son ensemble."
                  : "Through regular on-site inspections, off-site surveillance, and continuous monitoring, we assess the financial health, governance structures, and operational integrity of each credit union. Early detection of risks allows us to intervene before issues escalate, safeguarding both individual credit unions and the broader financial ecosystem."}
              </p>
              <p className="text-gray-700 leading-relaxed">
                {language === "fr"
                  ? "Notre supervision réglementaire couvre l'adéquation des fonds propres, la gestion de la liquidité, la qualité des actifs, la gouvernance, les contrôles internes et la conformité en matière de lutte contre le blanchiment d'argent. Nous collaborons étroitement avec la COBAC et le Ministère des Finances pour aligner nos pratiques de supervision sur les normes nationales et régionales."
                  : "Our regulatory supervision covers capital adequacy, liquidity management, asset quality, governance, internal controls, and anti-money laundering compliance. We work closely with COBAC and the Ministry of Finance to align our supervisory practices with national and regional standards."}
              </p>
            </div>
            <div className="md:col-span-1">
              <div className="bg-gray-50 rounded-xl p-6 sticky top-24">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {language === "fr" ? "Principaux Domaines de Supervision" : "Key Supervisory Areas"}
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  {supervisoryAreas.map((area) => (
                    <li key={area.en}>{localize(area, language)}</li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* SECTION 2: HOW WE SUPERVISE */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <SectionHeader
            align="center"
            title={language === "fr" ? "Notre Approche de Supervision" : "Our Supervisory Approach"}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {approach.map((item, index) => (
              <FadeUp key={item.title.en} index={index}>
                <Card className="p-6 h-full">
                  <div className="rounded-full p-3 h-12 w-12 bg-primary-100 text-primary-600 flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-primary-900 mb-2">
                    {localize(item.title, language)}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {localize(item.description, language)}
                  </p>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: COBAC COMPLIANCE */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <FadeUp>
            <Shield className="h-16 w-16 text-accent-600 mx-auto mb-6" />
            <h2 className="font-display text-2xl font-bold text-primary-900 mb-4">
              {language === "fr" ? "Conforme aux Normes de la COBAC" : "Aligned with COBAC Standards"}
            </h2>
            <p className="max-w-3xl mx-auto text-gray-600">
              {language === "fr"
                ? "Le cadre de supervision de CamCCUL est pleinement aligné sur la réglementation de la COBAC (Commission Bancaire de l'Afrique Centrale) régissant les établissements de microfinance dans la zone CEMAC. Nos modèles de rapports, procédures d'audit et listes de contrôle de conformité sont régulièrement mis à jour pour refléter l'évolution des exigences réglementaires. Cela garantit que chaque coopérative de crédit affiliée à CamCCUL respecte les normes les plus strictes de gouvernance financière en Afrique Centrale."
                : "CamCCUL's supervisory framework is fully aligned with COBAC (Commission Bancaire de l'Afrique Centrale) regulations governing microfinance institutions in the CEMAC region. Our reporting templates, audit procedures, and compliance checklists are regularly updated to reflect evolving regulatory requirements. This ensures that every CamCCUL-affiliated credit union meets the highest standards of financial governance in Central Africa."}
            </p>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
