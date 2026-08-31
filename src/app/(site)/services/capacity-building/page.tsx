"use client";

import Link from "next/link";
import { Users, GraduationCap, Monitor, TrendingUp, ArrowRight } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { FadeUp } from "@/components/ui/FadeUp";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { localize, type LocalizedText } from "@/lib/i18n";

const trainingAreas: LocalizedText[] = [
  { en: "Financial Management & Accounting", fr: "Gestion Financière et Comptabilité" },
  { en: "Loan Portfolio Management", fr: "Gestion du Portefeuille de Prêts" },
  { en: "Governance & Board Leadership", fr: "Gouvernance et Direction du Conseil" },
  { en: "Risk Management", fr: "Gestion des Risques" },
  { en: "Internal Controls & Compliance", fr: "Contrôles Internes et Conformité" },
  { en: "Member Service Excellence", fr: "Excellence du Service aux Membres" },
  { en: "Digital Literacy & Technology", fr: "Culture Numérique et Technologie" },
  { en: "Fraud Prevention & Detection", fr: "Prévention et Détection de la Fraude" },
];

const trainingApproach: { icon: typeof Users; title: LocalizedText; description: LocalizedText }[] = [
  {
    icon: Users,
    title: { en: "Regional Workshops", fr: "Ateliers Régionaux" },
    description: {
      en: "We bring credit union staff together for intensive, hands-on training sessions across all 10 regions. These workshops combine theory with practical exercises and peer-to-peer learning.",
      fr: "Nous réunissons le personnel des coopératives de crédit pour des sessions de formation intensives et pratiques dans les 10 régions. Ces ateliers combinent théorie, exercices pratiques et apprentissage entre pairs.",
    },
  },
  {
    icon: GraduationCap,
    title: { en: "On-Site Coaching", fr: "Accompagnement sur Site" },
    description: {
      en: "Our trainers visit individual credit unions to provide tailored coaching. We observe operations, identify skill gaps, and work one-on-one with staff to improve procedures and performance.",
      fr: "Nos formateurs se rendent dans les coopératives de crédit pour un accompagnement personnalisé. Nous observons les opérations, identifions les lacunes en compétences et travaillons individuellement avec le personnel pour améliorer les procédures et la performance.",
    },
  },
  {
    icon: Monitor,
    title: { en: "Digital Learning", fr: "Apprentissage Numérique" },
    description: {
      en: "As part of our digitalization strategy, we are developing online training modules that credit union staff can access anytime, from anywhere — reducing travel costs and expanding our reach.",
      fr: "Dans le cadre de notre stratégie de digitalisation, nous développons des modules de formation en ligne accessibles au personnel des coopératives à tout moment, de n'importe où — réduisant les frais de déplacement et élargissant notre portée.",
    },
  },
];

export default function CapacityBuildingPage() {
  const { t, language } = useLanguage();

  return (
    <>
      <PageHero
        title={t("nav_services_capacity")}
        subtitle={t("service_capacity_subtitle")}
        breadcrumb={[
          { label: t("nav_home"), href: "/" },
          { label: t("nav_services"), href: "/services" },
          { label: t("nav_services_capacity"), href: "/services/capacity-building" },
        ]}
      />

      {/* SECTION 1: OVERVIEW */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4">
          <FadeUp className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="font-display text-2xl font-bold text-primary-900 mb-4">
                {language === "fr" ? "Investir dans les Personnes, Renforcer les Institutions" : "Investing in People, Strengthening Institutions"}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {language === "fr"
                  ? "CamCCUL propose des programmes de formation solides pour ses coopératives de crédit affiliées, dotant le personnel des compétences et connaissances essentielles pour gérer efficacement leurs institutions. Nous croyons que des coopératives de crédit solides sont bâties par des personnes compétentes — du directeur général à l'agent de prêt en passant par le caissier au service des membres au guichet."
                  : "CamCCUL offers robust capacity building training for its affiliate credit unions, equipping staff with essential skills and knowledge to manage their institutions effectively. We believe that strong credit unions are built by skilled people — from the general manager to the loan officer to the teller serving members at the counter."}
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                {language === "fr"
                  ? "Nos programmes de formation couvrent l'ensemble des opérations des coopératives de crédit : gestion financière et comptabilité, gestion du portefeuille de prêts, gouvernance et responsabilités du conseil, gestion des risques, contrôles internes, services aux membres et culture numérique. Nous dispensons la formation par le biais d'ateliers régionaux, de visites d'accompagnement sur site, d'échanges entre pairs et, de plus en plus, de plateformes numériques."
                  : "Our training programs cover the full spectrum of credit union operations: financial management and accounting, loan portfolio management, governance and board responsibilities, risk management, internal controls, member services, and digital literacy. We deliver training through regional workshops, on-site coaching visits, peer learning exchanges, and increasingly through digital platforms."}
              </p>
              <p className="text-gray-700 leading-relaxed">
                {language === "fr"
                  ? "Chaque année, des centaines de membres du personnel et du conseil d'administration des coopératives de crédit participent aux programmes de formation de CamCCUL. Notre curriculum est élaboré en partenariat avec des experts régionaux et internationaux, aligné sur les exigences de la COBAC, et continuellement mis à jour pour relever les défis émergents — de la sensibilisation à la cybersécurité au financement agricole résilient au climat."
                  : "Each year, hundreds of credit union staff and board members participate in CamCCUL training programs. Our curriculum is developed in partnership with regional and international experts, aligned with COBAC requirements, and continuously updated to address emerging challenges — from cybersecurity awareness to climate-smart agricultural lending."}
              </p>
            </div>
            <div className="md:col-span-1">
              <div className="bg-gray-50 rounded-xl p-6 sticky top-24">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {language === "fr" ? "Domaines de Formation" : "Training Areas"}
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  {trainingAreas.map((area) => (
                    <li key={area.en}>{localize(area, language)}</li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* SECTION 2: OUR TRAINING APPROACH */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <SectionHeader
            align="center"
            title={language === "fr" ? "Comment Nous Renforçons les Capacités" : "How We Build Capacity"}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {trainingApproach.map((item, index) => (
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

      {/* SECTION 3: IMPACT */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <FadeUp>
            <TrendingUp className="h-16 w-16 text-accent-600 mx-auto mb-6" />
            <h2 className="font-display text-2xl font-bold text-primary-900 mb-4">
              {language === "fr" ? "Bâtir un Mouvement Coopératif Plus Fort" : "Building a Stronger Cooperative Movement"}
            </h2>
            <p className="max-w-3xl mx-auto text-gray-600">
              {language === "fr"
                ? "L'impact de notre travail de renforcement des capacités dépasse largement les coopératives de crédit individuelles. Des gestionnaires mieux formés prennent de meilleures décisions de prêt. Des conseils mieux formés assurent une gouvernance plus solide. Un personnel mieux formé offre un meilleur service aux membres. Collectivement, cela élève le niveau de la finance coopérative à travers le Cameroun — protégeant l'épargne des membres, élargissant l'inclusion financière et renforçant la confiance du public envers le mouvement des coopératives de crédit."
                : "The impact of our capacity building work extends far beyond individual credit unions. Better-trained managers make better lending decisions. Better-trained boards provide stronger governance. Better-trained staff deliver better member service. Collectively, this raises the standard of cooperative finance across Cameroon — protecting member savings, expanding financial inclusion, and building public trust in the credit union movement."}
            </p>
          </FadeUp>
        </div>
      </section>

      {/* SECTION 4: CTA */}
      <section className="bg-primary-900 text-white py-16 text-center">
        <div className="max-w-3xl mx-auto px-4 flex flex-col items-center">
          <FadeUp className="flex flex-col items-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              {language === "fr" ? "Intéressé par une Formation pour Votre Coopérative ?" : "Interested in Training for Your Credit Union?"}
            </h2>
            <p className="text-gray-300 mt-4">
              {language === "fr"
                ? "Contactez notre équipe de renforcement des capacités pour en savoir plus sur les prochains ateliers, demander un accompagnement sur site ou discuter de programmes de formation personnalisés pour votre affiliée."
                : "Contact our capacity building team to learn about upcoming workshops, request on-site coaching, or discuss customized training programs for your affiliate."}
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
