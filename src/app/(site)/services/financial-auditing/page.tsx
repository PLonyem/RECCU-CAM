"use client";

import { ClipboardCheck, FileSearch, FileText, Building2 } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { FadeUp } from "@/components/ui/FadeUp";
import { useLanguage } from "@/context/LanguageContext";
import { localize, type LocalizedText } from "@/lib/i18n";

const auditCoverage: LocalizedText[] = [
  { en: "Financial Statement Audit", fr: "Audit des États Financiers" },
  { en: "Loan Portfolio Review", fr: "Examen du Portefeuille de Prêts" },
  { en: "Asset Verification", fr: "Vérification des Actifs" },
  { en: "Internal Controls Testing", fr: "Test des Contrôles Internes" },
  { en: "Cash Count Verification", fr: "Vérification des Encaisses" },
  { en: "Member Share Reconciliation", fr: "Rapprochement des Parts Sociales" },
  { en: "Income & Expense Analysis", fr: "Analyse des Revenus et Dépenses" },
  { en: "Regulatory Compliance Check", fr: "Vérification de la Conformité Réglementaire" },
];

const methodology: { icon: typeof ClipboardCheck; title: LocalizedText; description: LocalizedText }[] = [
  {
    icon: ClipboardCheck,
    title: { en: "Risk-Based Auditing", fr: "Audit Basé sur le Risque" },
    description: {
      en: "We prioritize audit resources based on risk profiles. Credit unions with larger portfolios, past compliance issues, or rapid growth receive more frequent and intensive audits to catch problems early.",
      fr: "Nous priorisons les ressources d'audit selon les profils de risque. Les coopératives ayant des portefeuilles plus importants, des antécédents de non-conformité ou une croissance rapide font l'objet d'audits plus fréquents et plus poussés afin de détecter les problèmes rapidement.",
    },
  },
  {
    icon: FileSearch,
    title: { en: "Comprehensive Review", fr: "Examen Complet" },
    description: {
      en: "Every audit covers financial statements, loan documentation, cash management, member records, governance minutes, and internal policies. Nothing is taken at face value — we verify everything independently.",
      fr: "Chaque audit couvre les états financiers, la documentation des prêts, la gestion des liquidités, les dossiers des membres, les procès-verbaux de gouvernance et les politiques internes. Rien n'est pris pour acquis — nous vérifions tout de manière indépendante.",
    },
  },
  {
    icon: FileText,
    title: { en: "Actionable Reporting", fr: "Rapports Exploitables" },
    description: {
      en: "Our audit reports don't just identify problems — they provide clear, practical recommendations. We work with credit union management to develop remediation plans and track implementation through follow-up reviews.",
      fr: "Nos rapports d'audit ne se contentent pas d'identifier les problèmes — ils fournissent des recommandations claires et pratiques. Nous collaborons avec la direction des coopératives pour élaborer des plans de redressement et suivre leur mise en œuvre grâce à des examens de suivi.",
    },
  },
];

export default function FinancialAuditingPage() {
  const { t, language } = useLanguage();

  return (
    <>
      <PageHero
        title={t("nav_services_auditing")}
        subtitle={t("service_auditing_subtitle")}
        breadcrumb={[
          { label: t("nav_home"), href: "/" },
          { label: t("nav_services"), href: "/services" },
          { label: t("nav_services_auditing"), href: "/services/financial-auditing" },
        ]}
      />

      {/* SECTION 1: OVERVIEW */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4">
          <FadeUp className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="font-display text-2xl font-bold text-primary-900 mb-4">
                {language === "fr" ? "Une Transparence Digne de Confiance" : "Transparency You Can Trust"}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {language === "fr"
                  ? "L'audit financier est la pierre angulaire de la confiance au sein du mouvement des coopératives de crédit. Chez CamCCUL, notre équipe d'audit mène des examens approfondis et indépendants des états financiers, des contrôles internes et des procédures opérationnelles de chaque affiliée. Nos audits garantissent aux membres, régulateurs et partenaires que les fonds des coopératives sont gérés de manière responsable et transparente."
                  : "Financial auditing is the cornerstone of trust in the cooperative credit union movement. At CamCCUL, our audit team conducts thorough, independent examinations of every affiliate's financial statements, internal controls, and operational procedures. Our audits provide assurance to members, regulators, and partners that credit union funds are managed responsibly and transparently."}
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                {language === "fr"
                  ? "Nous allons au-delà de la simple vérification des chiffres. Nos auditeurs évaluent la qualité des portefeuilles de prêts, vérifient l'existence et l'évaluation des actifs, testent les environnements de contrôle interne et évaluent la conformité à la fois avec la réglementation de la COBAC et les politiques propres à chaque coopérative. Chaque audit se conclut par des recommandations concrètes d'amélioration."
                  : "We go beyond checking numbers. Our auditors assess the quality of loan portfolios, verify the existence and valuation of assets, test internal control environments, and evaluate compliance with both COBAC regulations and each credit union's own policies. Every audit concludes with actionable recommendations for improvement."}
              </p>
              <p className="text-gray-700 leading-relaxed">
                {language === "fr"
                  ? "Notre cycle d'audit comprend des audits statutaires annuels pour toutes les affiliées, des examens trimestriels pour les établissements à risque plus élevé, et des enquêtes spéciales en cas de soupçon d'irrégularités. Nous maintenons une approche basée sur le risque — en allouant davantage de ressources d'audit aux coopératives disposant d'un actif plus important, d'opérations complexes ou de vulnérabilités identifiées."
                  : "Our audit cycle includes annual statutory audits for all affiliates, quarterly reviews for higher-risk institutions, and special investigations when irregularities are suspected. We maintain a risk-based approach — allocating more audit resources to credit unions with larger asset bases, complex operations, or identified vulnerabilities."}
              </p>
            </div>
            <div className="md:col-span-1">
              <div className="bg-gray-50 rounded-xl p-6 sticky top-24">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {language === "fr" ? "Portée de l'Audit" : "Audit Coverage"}
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  {auditCoverage.map((item) => (
                    <li key={item.en}>{localize(item, language)}</li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* SECTION 2: OUR AUDIT METHODOLOGY */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <SectionHeader align="center" title={language === "fr" ? "Comment Nous Auditons" : "How We Audit"} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {methodology.map((item, index) => (
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

      {/* SECTION 3: STRENGTHENING CREDIT UNIONS */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <FadeUp>
            <Building2 className="h-16 w-16 text-primary-600 mx-auto mb-6" />
            <h2 className="font-display text-2xl font-bold text-primary-900 mb-4">
              {language === "fr" ? "Des Audits Qui Renforcent, Pas Seulement Qui Inspectent" : "Audits That Build, Not Just Inspect"}
            </h2>
            <p className="max-w-3xl mx-auto text-gray-600">
              {language === "fr"
                ? "Notre philosophie est que les audits doivent renforcer les coopératives de crédit, pas seulement les critiquer. Nous travaillons avec la direction des affiliées pour identifier les faiblesses avant qu'elles ne deviennent des crises, partager les meilleures pratiques observées dans le réseau et former sur les constats d'audit courants. Le résultat : des coopératives plus résilientes, une épargne des membres mieux protégée, et un secteur financier coopératif plus solide pour le Cameroun."
                : "Our philosophy is that audits should strengthen credit unions, not just critique them. We partner with affiliate management to identify weaknesses before they become crises, share best practices observed across the network, and provide training on common audit findings. The result: more resilient credit unions, better protected member savings, and a stronger cooperative financial sector for Cameroon."}
            </p>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
