"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { FadeUp } from "@/components/ui/FadeUp";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { localize, type LocalizedText } from "@/lib/i18n";

const faqSections: {
  title: LocalizedText;
  items: { q: LocalizedText; a: LocalizedText }[];
}[] = [
  {
    title: { en: "About CamCCUL", fr: "À propos de CamCCUL" },
    items: [
      {
        q: { en: "What is CamCCUL?", fr: "Qu'est-ce que CamCCUL ?" },
        a: {
          en: "The Cameroon Cooperative Credit Union League (CamCCUL) is the apex supervisory and representative body for cooperative credit unions in Cameroon. Founded in 1968 and headquartered in Bamenda, Northwest Region, CamCCUL oversees more than 220 affiliate credit unions spread across all 10 regions of the country. We are regulated by COBAC (Commission Bancaire de l'Afrique Centrale) and operate under the supervision of Cameroon's Ministry of Finance. Our core mandate is to ensure the safety, soundness, and sustainable growth of the cooperative financial sector while protecting the interests of millions of credit union members nationwide.",
          fr: "La Ligue des Coopératives de Crédit du Cameroun (CamCCUL) est l'organe suprême de supervision et de représentation des coopératives de crédit au Cameroun. Fondée en 1968 et basée à Bamenda, dans la région du Nord-Ouest, CamCCUL supervise plus de 220 coopératives de crédit affiliées réparties dans les 10 régions du pays. Nous sommes réglementés par la COBAC (Commission Bancaire de l'Afrique Centrale) et opérons sous la supervision du Ministère des Finances du Cameroun. Notre mandat principal est d'assurer la sécurité, la solidité et la croissance durable du secteur financier coopératif tout en protégeant les intérêts de millions de membres de coopératives de crédit à travers le pays.",
        },
      },
      {
        q: { en: "Who can join CamCCUL?", fr: "Qui peut adhérer à CamCCUL ?" },
        a: {
          en: "Membership in CamCCUL is open to registered cooperative credit unions operating in Cameroon. Individual persons cannot join CamCCUL directly — rather, individuals join one of our 220+ affiliate credit unions. To become a CamCCUL affiliate, a credit union must be legally registered, demonstrate sound governance and financial management, and commit to complying with COBAC regulations and CamCCUL's supervisory standards. Credit unions interested in affiliation should contact our headquarters in Bamenda for an application package and initial assessment.",
          fr: "L'adhésion à CamCCUL est ouverte aux coopératives de crédit enregistrées opérant au Cameroun. Les particuliers ne peuvent pas adhérer directement à CamCCUL — ils adhèrent plutôt à l'une de nos plus de 220 coopératives de crédit affiliées. Pour devenir affiliée à CamCCUL, une coopérative de crédit doit être légalement enregistrée, démontrer une gouvernance et une gestion financière saines, et s'engager à respecter la réglementation de la COBAC ainsi que les normes de supervision de CamCCUL. Les coopératives intéressées par une affiliation doivent contacter notre siège à Bamenda pour obtenir un dossier de candidature et une évaluation initiale.",
        },
      },
      {
        q: { en: "What services does CamCCUL offer?", fr: "Quels services CamCCUL propose-t-elle ?" },
        a: {
          en: "CamCCUL provides four core services to its affiliate credit unions. First, Regulatory Supervision — ongoing monitoring of financial health, governance, and COBAC compliance across all affiliates. Second, Financial Auditing — annual statutory audits, risk-based examinations, and special investigations to ensure transparency and accountability. Third, Capacity Building — robust training programs equipping credit union staff and board members with essential skills in financial management, governance, risk management, and member service. Fourth, Digitalization — spearheading the technological transformation of affiliate operations, from our new digital platform to an internal digital reporting system now in development. We also represent the interests of credit unions in national and regional policy discussions.",
          fr: "CamCCUL fournit quatre services essentiels à ses coopératives de crédit affiliées. Premièrement, la Supervision Réglementaire — surveillance continue de la santé financière, de la gouvernance et de la conformité à la COBAC pour toutes les affiliées. Deuxièmement, l'Audit Financier — audits statutaires annuels, examens basés sur les risques et enquêtes spéciales pour assurer la transparence et la responsabilité. Troisièmement, le Renforcement des Capacités — programmes de formation solides dotant le personnel et les membres du conseil d'administration des compétences essentielles en gestion financière, gouvernance, gestion des risques et service aux membres. Quatrièmement, la Digitalisation — pilotage de la transformation technologique des opérations des affiliées, de notre nouvelle plateforme numérique à un système de rapports numériques interne actuellement en développement. Nous représentons également les intérêts des coopératives de crédit dans les discussions politiques nationales et régionales.",
        },
      },
      {
        q: { en: "How can I open an account with CamCCUL?", fr: "Comment puis-je ouvrir un compte auprès de CamCCUL ?" },
        a: {
          en: "CamCCUL is not a bank or a deposit-taking institution — we are a regulatory and support body. Individuals cannot open accounts with CamCCUL directly. To open a savings account, apply for a loan, or access other financial services, you should visit any CamCCUL-affiliated credit union near you. Use our Find a Credit Union page to find one in your region. Credit union membership typically requires identification, a small membership fee, and the purchase of at least one share. Staff at your local credit union will guide you through the process.",
          fr: "CamCCUL n'est ni une banque ni un établissement de dépôt — nous sommes un organe de réglementation et d'accompagnement. Les particuliers ne peuvent pas ouvrir de compte directement auprès de CamCCUL. Pour ouvrir un compte d'épargne, demander un prêt ou accéder à d'autres services financiers, rendez-vous dans n'importe quelle coopérative de crédit affiliée à CamCCUL près de chez vous. Utilisez notre page Trouver une Coopérative pour en trouver une dans votre région. L'adhésion à une coopérative de crédit nécessite généralement une pièce d'identité, une petite cotisation d'adhésion et l'achat d'au moins une part sociale. Le personnel de votre coopérative locale vous guidera tout au long du processus.",
        },
      },
    ],
  },
  {
    title: { en: "About Credit Unions", fr: "À propos des coopératives de crédit" },
    items: [
      {
        q: {
          en: "What is a credit union and how is it different from a bank?",
          fr: "Qu'est-ce qu'une coopérative de crédit et en quoi diffère-t-elle d'une banque ?",
        },
        a: {
          en: "A credit union is a member-owned, not-for-profit financial cooperative. Unlike banks, which are owned by shareholders seeking profit, credit unions are owned by their members — the people who save and borrow with them. Every member has one vote in electing the board of directors, regardless of how much they have saved. Profits are returned to members through better interest rates on savings, lower rates on loans, and fewer fees. Credit unions typically serve a specific community, profession, or association — such as farmers, teachers, or residents of a particular area.",
          fr: "Une coopérative de crédit est une coopérative financière à but non lucratif, détenue par ses membres. Contrairement aux banques, détenues par des actionnaires en quête de profit, les coopératives de crédit appartiennent à leurs membres — les personnes qui y épargnent et y empruntent. Chaque membre dispose d'une voix pour élire le conseil d'administration, quel que soit le montant de son épargne. Les bénéfices sont reversés aux membres sous forme de meilleurs taux d'intérêt sur l'épargne, de taux de prêt plus bas et de frais réduits. Les coopératives de crédit servent généralement une communauté, une profession ou une association spécifique — comme les agriculteurs, les enseignants ou les habitants d'une région donnée.",
        },
      },
      {
        q: { en: "How do I find a credit union near me?", fr: "Comment trouver une coopérative de crédit près de chez moi ?" },
        a: {
          en: "Visit our Find a Credit Union page on this website. Select your region from the dropdown menu to see all CamCCUL-affiliated credit unions in your area, complete with contact information. We have credit unions in all 10 regions of Cameroon — from Bamenda in the Northwest to Maroua in the Far North.",
          fr: "Consultez notre page Trouver une Coopérative sur ce site. Sélectionnez votre région dans le menu déroulant pour voir toutes les coopératives de crédit affiliées à CamCCUL dans votre zone, avec leurs coordonnées. Nous avons des coopératives de crédit dans les 10 régions du Cameroun — de Bamenda au Nord-Ouest à Maroua à l'Extrême-Nord.",
        },
      },
      {
        q: { en: "Is my money safe in a credit union?", fr: "Mon argent est-il en sécurité dans une coopérative de crédit ?" },
        a: {
          en: "Yes. CamCCUL-affiliated credit unions operate under strict COBAC regulations and are subject to regular audits and supervision by our team of professional auditors. We monitor key financial indicators — including liquidity, loan quality, and capital adequacy — and intervene early when problems are detected. While Cameroon does not currently have a national deposit insurance scheme for credit unions, CamCCUL's rigorous supervision is designed to protect member savings by ensuring credit unions are well-managed and financially sound.",
          fr: "Oui. Les coopératives de crédit affiliées à CamCCUL opèrent selon une réglementation stricte de la COBAC et font l'objet d'audits et d'une supervision réguliers par notre équipe d'auditeurs professionnels. Nous surveillons les indicateurs financiers clés — notamment la liquidité, la qualité des prêts et l'adéquation des fonds propres — et intervenons rapidement en cas de problème détecté. Bien que le Cameroun ne dispose pas actuellement d'un régime national d'assurance des dépôts pour les coopératives de crédit, la supervision rigoureuse de CamCCUL vise à protéger l'épargne des membres en veillant à ce que les coopératives soient bien gérées et financièrement saines.",
        },
      },
    ],
  },
  {
    title: { en: "Reporting and Compliance", fr: "Rapports et conformité" },
    items: [
      {
        q: {
          en: "How do credit unions submit financial reports?",
          fr: "Comment les coopératives de crédit soumettent-elles leurs rapports financiers ?",
        },
        a: {
          en: "Affiliate credit unions currently submit periodic financial reports to CamCCUL following COBAC reporting standards. Reporting templates and deadlines are available on our Resources page. As part of our digitalization roadmap, CamCCUL is developing an internal digital reporting system that will let League staff process affiliate submissions with built-in validation, AI-powered error detection, and real-time compliance tracking. This will significantly reduce processing time and improve accuracy.",
          fr: "Les coopératives de crédit affiliées soumettent actuellement des rapports financiers périodiques à CamCCUL selon les normes de reporting de la COBAC. Les modèles de rapports et les échéances sont disponibles sur notre page Ressources. Dans le cadre de notre feuille de route de digitalisation, CamCCUL développe un système de rapports numériques interne qui permettra au personnel de la Ligue de traiter les soumissions des affiliées avec validation intégrée, détection d'erreurs assistée par IA et suivi de conformité en temps réel. Cela réduira considérablement le temps de traitement et améliorera la précision.",
        },
      },
      {
        q: {
          en: "What are the key COBAC requirements for credit unions?",
          fr: "Quelles sont les principales exigences de la COBAC pour les coopératives de crédit ?",
        },
        a: {
          en: "COBAC requires all microfinance institutions, including credit unions, to maintain minimum prudential standards. Key requirements include: a liquidity ratio of at least 100% (meaning liquid assets must cover all short-term deposit obligations), a non-performing loan ratio not exceeding 5% of the total loan portfolio, and a capital adequacy ratio of at least 8%. CamCCUL helps affiliates understand, monitor, and meet these requirements through training, supervision, and regular reporting.",
          fr: "La COBAC exige que tous les établissements de microfinance, y compris les coopératives de crédit, respectent des normes prudentielles minimales. Les principales exigences sont : un ratio de liquidité d'au moins 100 % (les actifs liquides doivent couvrir toutes les obligations de dépôt à court terme), un ratio de prêts non performants ne dépassant pas 5 % du portefeuille total de prêts, et un ratio d'adéquation des fonds propres d'au moins 8 %. CamCCUL aide ses affiliées à comprendre, surveiller et respecter ces exigences grâce à la formation, la supervision et un reporting régulier.",
        },
      },
    ],
  },
  {
    title: { en: "CamCCUL's Work", fr: "Le travail de CamCCUL" },
    items: [
      {
        q: {
          en: "How often does CamCCUL audit its affiliate credit unions?",
          fr: "À quelle fréquence CamCCUL audite-t-elle ses coopératives de crédit affiliées ?",
        },
        a: {
          en: "Every affiliate credit union undergoes an annual statutory audit. Additionally, CamCCUL applies a risk-based approach — credit unions with larger asset bases, past compliance issues, or rapid growth may be audited more frequently, including quarterly reviews or special investigations. Our audit team conducts both desk-based reviews and on-site field visits to verify financial records, count cash, examine loan files, and assess internal controls.",
          fr: "Chaque coopérative de crédit affiliée fait l'objet d'un audit statutaire annuel. De plus, CamCCUL applique une approche basée sur le risque — les coopératives disposant d'un actif plus important, ayant connu des problèmes de conformité passés, ou en croissance rapide peuvent être auditées plus fréquemment, notamment par des examens trimestriels ou des enquêtes spéciales. Notre équipe d'audit effectue à la fois des examens documentaires et des visites de terrain pour vérifier les dossiers financiers, compter les liquidités, examiner les dossiers de prêts et évaluer les contrôles internes.",
        },
      },
      {
        q: { en: "What training does CamCCUL provide?", fr: "Quelles formations CamCCUL propose-t-elle ?" },
        a: {
          en: "CamCCUL offers robust capacity building training for its affiliate credit unions, equipping staff and board members with essential skills and knowledge. Training areas include financial management and accounting, loan portfolio management, governance and board responsibilities, risk management, internal controls, member service excellence, and digital literacy. Training is delivered through regional workshops across all 10 regions, on-site coaching visits to individual credit unions, and increasingly through digital learning platforms as part of our digitalization strategy.",
          fr: "CamCCUL propose des programmes de formation solides pour ses coopératives de crédit affiliées, dotant le personnel et les membres du conseil d'administration de compétences et de connaissances essentielles. Les domaines de formation incluent la gestion financière et la comptabilité, la gestion du portefeuille de prêts, la gouvernance et les responsabilités du conseil, la gestion des risques, les contrôles internes, l'excellence du service aux membres et la culture numérique. La formation est dispensée par le biais d'ateliers régionaux dans les 10 régions, de visites d'accompagnement sur site et, de plus en plus, de plateformes d'apprentissage numérique dans le cadre de notre stratégie de digitalisation.",
        },
      },
    ],
  },
  {
    title: { en: "Digitalization", fr: "Digitalisation" },
    items: [
      {
        q: { en: "What is CamCCUL doing about digitalization?", fr: "Que fait CamCCUL en matière de digitalisation ?" },
        a: {
          en: "CamCCUL is spearheading the digitalization of its affiliate credit unions, streamlining operations and enhancing service delivery through innovative technology. Our digitalization roadmap has three phases: Phase 1 — this modern public website with a Find a Credit Union tool, digital resources, and news (now live); Phase 2 — an internal digital reporting system with AI-powered validation to speed up how the League processes affiliate submissions (in development); and Phase 3 — mobile services, digital field audit tools, and a comprehensive document management system (planned).",
          fr: "CamCCUL pilote la digitalisation de ses coopératives de crédit affiliées, rationalisant les opérations et améliorant la prestation de services grâce à des technologies innovantes. Notre feuille de route de digitalisation comprend trois phases : Phase 1 — ce site web public moderne avec un outil Trouver une Coopérative, ressources numériques et actualités (déjà en ligne) ; Phase 2 — un système de rapports numériques interne avec validation assistée par IA pour accélérer le traitement des soumissions des affiliées par la Ligue (en développement) ; et Phase 3 — services mobiles, outils d'audit de terrain numériques et système complet de gestion documentaire (planifiée).",
        },
      },
    ],
  },
  {
    title: { en: "Getting in Touch", fr: "Nous contacter" },
    items: [
      {
        q: { en: "How can I contact CamCCUL?", fr: "Comment puis-je contacter CamCCUL ?" },
        a: {
          en: "Visit our Contact page for our full contact details. Our headquarters is located on Commercial Avenue in Bamenda, Northwest Region, Cameroon. You can also reach us by phone or email. We maintain regional offices across the country. Our office hours are Monday through Friday, 8:00 AM to 5:00 PM.",
          fr: "Consultez notre page Contact pour toutes nos coordonnées. Notre siège est situé sur Commercial Avenue à Bamenda, région du Nord-Ouest, Cameroun. Vous pouvez également nous joindre par téléphone ou par courriel. Nous maintenons des bureaux régionaux à travers le pays. Nos heures d'ouverture sont du lundi au vendredi, de 8h00 à 17h00.",
        },
      },
      {
        q: {
          en: "How can my credit union become a CamCCUL affiliate?",
          fr: "Comment ma coopérative de crédit peut-elle devenir affiliée à CamCCUL ?",
        },
        a: {
          en: "Credit unions interested in CamCCUL affiliation should contact our headquarters for an application package. The process involves a review of your credit union's registration, governance structure, financial condition, and operational policies. Our membership team will guide you through the requirements and conduct an initial assessment visit.",
          fr: "Les coopératives de crédit intéressées par une affiliation à CamCCUL doivent contacter notre siège pour obtenir un dossier de candidature. Le processus comprend un examen de l'enregistrement de votre coopérative, de sa structure de gouvernance, de sa situation financière et de ses politiques opérationnelles. Notre équipe chargée des adhésions vous guidera à travers les exigences et effectuera une visite d'évaluation initiale.",
        },
      },
      {
        q: {
          en: "Can international organizations partner with CamCCUL?",
          fr: "Des organisations internationales peuvent-elles s'associer à CamCCUL ?",
        },
        a: {
          en: "Yes. CamCCUL welcomes partnerships with development organizations, government agencies, foundations, and technology providers who share our mission of strengthening cooperative finance in Cameroon. Partnership areas include capacity building, digital transformation, financial inclusion initiatives, and research. Please contact us through our Contact page with details about your organization and proposed collaboration.",
          fr: "Oui. CamCCUL accueille favorablement les partenariats avec des organisations de développement, des agences gouvernementales, des fondations et des fournisseurs de technologie qui partagent notre mission de renforcement de la finance coopérative au Cameroun. Les domaines de partenariat incluent le renforcement des capacités, la transformation numérique, les initiatives d'inclusion financière et la recherche. Veuillez nous contacter via notre page Contact en précisant votre organisation et la collaboration proposée.",
        },
      },
    ],
  },
];

let runningTotal = 0;
const sectionsWithOffsets = faqSections.map((section) => {
  const startIndex = runningTotal;
  runningTotal += section.items.length;
  return { ...section, startIndex };
});

export default function FaqPage() {
  const { language, t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <PageHero
        title={t("faq_page_title")}
        subtitle={t("home_faq_subtitle")}
        breadcrumb={[
          { label: t("nav_home"), href: "/" },
          { label: t("nav_faq"), href: "/faq" },
        ]}
      />

      <section className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-3xl mx-auto px-4">
          {sectionsWithOffsets.map((section, sectionIdx) => (
            <FadeUp key={section.title.en} index={sectionIdx}>
              <h2 className="text-lg font-display font-bold text-primary-900 mt-12 mb-4 first:mt-0">
                {localize(section.title, language)}
              </h2>
              {section.items.map((item, itemIdx) => {
                const index = section.startIndex + itemIdx;
                const isOpen = openIndex === index;
                return (
                  <div key={item.q.en}>
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      aria-expanded={isOpen}
                      className="w-full text-left flex items-center justify-between py-5 px-6 bg-white border border-gray-200 rounded-xl mb-3 hover:border-primary-300 transition-colors shadow-sm"
                    >
                      <span className="font-semibold text-primary-900 pr-8">
                        {localize(item.q, language)}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 text-gray-400 shrink-0 transition-transform duration-200",
                          isOpen && "rotate-180"
                        )}
                      />
                    </button>
                    {isOpen && (
                      <div className="bg-white border-x border-b border-gray-200 rounded-b-xl px-6 pb-5 -mt-3 pt-5 text-gray-600 leading-relaxed">
                        {localize(item.a, language)}
                      </div>
                    )}
                  </div>
                );
              })}
            </FadeUp>
          ))}
        </div>
      </section>
    </>
  );
}
