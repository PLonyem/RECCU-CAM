// Knowledge base for the CamCCUL support chatbot ("Cami").
//
// A flat, ordered array of entries matched by plain substring against the
// lowercased user input — first match wins, so more specific keyword sets
// must come before generic catch-alls. This is deliberately not an LLM: it
// never calls out to an API, so it never hallucinates a rate, a fee, or a
// contact detail. Anywhere the real figure isn't confirmed (interest rates,
// loan limits, office hours), the entry routes to the relevant page or to
// CamCCUL support instead of stating a number.
//
// Contact details below (address/phone/email) are the confirmed values from
// `contactInfo` in mock-data.ts — the same source the Contact page and
// Footer render. Do not restate figures from elsewhere without checking
// that file first.

import type { LocalizedText } from "./i18n";

export interface Chip {
  label: LocalizedText;
  query: LocalizedText;
}

export interface KBAction {
  label: LocalizedText;
  href: string;
}

export interface KBEntry {
  /** Substring keywords (EN + FR) checked against the lowercased input. */
  keys?: string[];
  /** Custom matcher for entries that can't be expressed as keywords. */
  test?: (lowerInput: string) => boolean;
  reply: LocalizedText;
  chips?: Chip[];
  action?: KBAction;
}

// ─── Reusable chips ──────────────────────────────────────────────────────
// Each chip's `query` is the text that gets run back through the matcher
// when the chip is clicked — it must actually hit the target entry's keys.

const CHIPS = {
  findCreditUnion: {
    label: { en: "Find a credit union", fr: "Trouver une coopérative" },
    query: {
      en: "find a credit union near me",
      fr: "trouver une coopérative de crédit près de moi",
    },
  },
  ourServices: {
    label: { en: "Our services", fr: "Nos services" },
    query: { en: "what services does camccul offer", fr: "quels services propose camccul" },
  },
  openAccount: {
    label: { en: "Open an account", fr: "Ouvrir un compte" },
    query: { en: "how do i open an account", fr: "comment ouvrir un compte" },
  },
  contactUs: {
    label: { en: "Contact us", fr: "Nous contacter" },
    query: { en: "how can i contact camccul", fr: "comment contacter camccul" },
  },
  aboutCamccul: {
    label: { en: "About CamCCUL", fr: "À propos de CamCCUL" },
    query: { en: "what is camccul", fr: "qu'est-ce que camccul" },
  },
  training: {
    label: { en: "Training & workshops", fr: "Formations et ateliers" },
    query: {
      en: "tell me about capacity building training",
      fr: "parlez-moi du renforcement des capacités",
    },
  },
  digitalizationRoadmap: {
    label: { en: "Digitalization roadmap", fr: "Feuille de route digitalisation" },
    query: {
      en: "what is camccul doing about digitalization",
      fr: "que fait camccul en matière de digitalisation",
    },
  },
  news: {
    label: { en: "Latest news", fr: "Dernières actualités" },
    query: { en: "show me the latest news", fr: "montrez-moi les dernières actualités" },
  },
} as const satisfies Record<string, Chip>;

// ─── Sensitive-input guard ───────────────────────────────────────────────
// Checked before anything else. Catches PIN/password/verification-code
// mentions and digit runs that look like an account or card number.

const SENSITIVE_WORD_PATTERN =
  /\b(password|pin|cvv|otp|one[- ]time code|security code|mot de passe|code secret|code pin)\b/;
const SENSITIVE_DIGIT_RUN_PATTERN = /\d[\d\s-]{6,}\d/;

function hasSensitiveInfo(lowerInput: string): boolean {
  return (
    SENSITIVE_WORD_PATTERN.test(lowerInput) || SENSITIVE_DIGIT_RUN_PATTERN.test(lowerInput)
  );
}

// ─── Standing messages ────────────────────────────────────────────────────

export const WELCOME: KBEntry = {
  reply: {
    en:
      "Hi, I'm **Cami**, CamCCUL's virtual assistant. I can help you find a credit union, " +
      "learn about our services, or get in touch with the League. I can't access personal " +
      "accounts or give financial advice, but I'll always point you to someone who can. " +
      "What would you like to know?",
    fr:
      "Bonjour, je suis **Cami**, l'assistante virtuelle de CamCCUL. Je peux vous aider à " +
      "trouver une coopérative de crédit, découvrir nos services, ou entrer en contact avec " +
      "la Ligue. Je n'ai pas accès aux comptes personnels et je ne donne pas de conseils " +
      "financiers, mais je vous orienterai toujours vers la bonne personne. Que souhaitez-vous savoir ?",
  },
  chips: [CHIPS.findCreditUnion, CHIPS.ourServices, CHIPS.openAccount, CHIPS.contactUs],
};

export const FALLBACK: KBEntry = {
  reply: {
    en:
      "I don't have a specific answer for that yet. I can help with finding a credit union, " +
      "our services, membership, or contacting CamCCUL directly. For anything account-specific " +
      "or advice-related, our team can help — reach them on the Contact page.",
    fr:
      "Je n'ai pas encore de réponse précise à cela. Je peux vous aider à trouver une " +
      "coopérative de crédit, découvrir nos services, l'adhésion, ou contacter CamCCUL " +
      "directement. Pour toute question liée à un compte ou nécessitant un conseil, notre " +
      "équipe peut vous aider — contactez-la via la page Contact.",
  },
  chips: [CHIPS.aboutCamccul, CHIPS.findCreditUnion, CHIPS.ourServices, CHIPS.contactUs],
};

// ─── Knowledge base entries (order matters — specific before generic) ────

export const ENTRIES: KBEntry[] = [
  // Sensitive info guard — always checked first.
  {
    test: hasSensitiveInfo,
    reply: {
      en:
        "For your security, please don't share account numbers, PINs, passwords, or " +
        "verification codes here — not with me, or with anyone else by message or call. " +
        "I can't use that information, and CamCCUL staff will never ask for it. If you need " +
        "help with your account, contact your credit union directly, or reach CamCCUL " +
        "through our secure **Contact** page.",
      fr:
        "Pour votre sécurité, ne partagez jamais ici de numéro de compte, code PIN, mot de " +
        "passe ou code de vérification — ni avec moi, ni avec qui que ce soit par message ou " +
        "appel. Je ne peux pas utiliser ces informations, et le personnel de CamCCUL ne vous " +
        "les demandera jamais. Pour toute aide concernant votre compte, contactez directement " +
        "votre coopérative, ou joignez CamCCUL via notre page **Contact** sécurisée.",
    },
    chips: [CHIPS.contactUs],
    action: { label: { en: "Go to Contact Page", fr: "Aller à la page Contact" }, href: "/contact" },
  },

  // Small talk
  {
    keys: [
      "thank",
      "thanks",
      "appreciate",
      "goodbye",
      "bye",
      "see you",
      "merci",
      "au revoir",
      "à bientôt",
    ],
    reply: {
      en:
        "You're welcome! If anything else comes up, I'm here. You can also reach CamCCUL " +
        "directly on our **Contact** page.",
      fr:
        "Avec plaisir ! Si vous avez d'autres questions, je suis là. Vous pouvez aussi " +
        "contacter CamCCUL directement via notre page **Contact**.",
    },
    chips: [CHIPS.contactUs],
  },
  {
    keys: [
      "hello",
      "hey",
      "good morning",
      "good afternoon",
      "good evening",
      "bonjour",
      "salut",
      "bonsoir",
    ],
    reply: {
      en:
        "Hello! I'm **Cami**, CamCCUL's virtual assistant. I can help you find a credit " +
        "union, learn about our services, or get in touch. What would you like to know?",
      fr:
        "Bonjour ! Je suis **Cami**, l'assistante virtuelle de CamCCUL. Je peux vous aider " +
        "à trouver une coopérative de crédit, découvrir nos services, ou nous contacter. Que " +
        "souhaitez-vous savoir ?",
    },
    chips: [CHIPS.findCreditUnion, CHIPS.ourServices, CHIPS.openAccount, CHIPS.contactUs],
  },

  // About CamCCUL / credit unions
  {
    keys: [
      "what is camccul",
      "about camccul",
      "who is camccul",
      "tell me about camccul",
      "history of camccul",
      "when was camccul founded",
      "qu'est-ce que camccul",
      "à propos de camccul",
      "histoire de camccul",
      "quand camccul",
    ],
    reply: {
      en:
        "CamCCUL — the **Cameroon Cooperative Credit Union League** — is the apex body " +
        "supervising cooperative credit unions in Cameroon. Founded in **1968** and " +
        "headquartered in **Bamenda**, we oversee **220+ affiliate credit unions** across " +
        "all **10 regions**, regulated by **COBAC** and Cameroon's Ministry of Finance.",
      fr:
        "CamCCUL — la **Ligue des Coopératives de Crédit du Cameroun** — est l'organe " +
        "suprême de supervision des coopératives de crédit au Cameroun. Fondée en **1968** " +
        "et basée à **Bamenda**, nous supervisons plus de **220 coopératives affiliées** " +
        "dans les **10 régions**, sous la réglementation de la **COBAC** et du Ministère des Finances.",
    },
    action: { label: { en: "Learn More About Us", fr: "En savoir plus sur nous" }, href: "/about" },
    chips: [CHIPS.ourServices, CHIPS.findCreditUnion],
  },

  // "find a credit union" is a superstring of "credit union" — it must be
  // matched first, or the generic explainer below always wins instead.
  {
    keys: [
      "find a credit union",
      "credit union near",
      "near me",
      "affiliate directory",
      "directory",
      "where is a credit union",
      "annuaire des affiliés",
      "trouver une coopérative",
      "près de chez moi",
      "où se trouve",
    ],
    reply: {
      en:
        "Use our **Find a Credit Union** page — select your region to see every " +
        "CamCCUL-affiliated credit union there, with contact details. We have affiliates " +
        "across all **10 regions** of Cameroon.",
      fr:
        "Utilisez notre page **Trouver une Coopérative** — sélectionnez votre région pour voir " +
        "toutes les coopératives affiliées à CamCCUL, avec leurs coordonnées. Nous avons " +
        "des affiliées dans les **10 régions** du Cameroun.",
    },
    action: { label: { en: "Find a Credit Union", fr: "Trouver une Coopérative" }, href: "/affiliates" },
  },

  // Services
  {
    keys: [
      "services",
      "what does camccul do",
      "what do you do",
      "core services",
      "what camccul offers",
      "services de camccul",
      "que faites-vous",
      "que propose camccul",
    ],
    reply: {
      en:
        "CamCCUL provides four core services to affiliate credit unions: **Regulatory " +
        "Supervision**, **Financial Auditing**, **Capacity Building**, and " +
        "**Digitalization**. Each has its own page with more detail.",
      fr:
        "CamCCUL fournit quatre services essentiels aux coopératives affiliées : " +
        "**Supervision Réglementaire**, **Audit Financier**, **Renforcement des " +
        "Capacités**, et **Digitalisation**. Chacun dispose de sa propre page détaillée.",
    },
    action: { label: { en: "View All Services", fr: "Voir tous les services" }, href: "/services" },
    chips: [CHIPS.training, CHIPS.digitalizationRoadmap, CHIPS.contactUs],
  },
  {
    keys: [
      "regulatory supervision",
      "supervise",
      "oversight of credit unions",
      "supervision réglementaire",
      "surveillance des coopératives",
    ],
    reply: {
      en:
        "Regulatory Supervision is CamCCUL's ongoing monitoring of every affiliate's " +
        "financial health, governance, and **COBAC compliance** — through off-site review " +
        "of financial returns and on-site inspections, catching problems early to protect " +
        "member savings.",
      fr:
        "La Supervision Réglementaire est le suivi continu par CamCCUL de la santé " +
        "financière, de la gouvernance et de la conformité **COBAC** de chaque affiliée — " +
        "via des contrôles documentaires et des inspections sur site, afin de détecter tôt " +
        "les problèmes et protéger l'épargne des membres.",
    },
    action: { label: { en: "Read More", fr: "En savoir plus" }, href: "/services/regulatory-supervision" },
  },
  {
    keys: [
      "financial auditing",
      "audit",
      "auditing",
      "statutory audit",
      "audit financier",
      "audits",
    ],
    reply: {
      en:
        "CamCCUL's audit team conducts **annual statutory audits**, risk-based " +
        "examinations, and special investigations of affiliates' finances and internal " +
        "controls — giving members and regulators assurance funds are managed responsibly.",
      fr:
        "L'équipe d'audit de CamCCUL mène des **audits statutaires annuels**, des examens " +
        "basés sur les risques et des enquêtes spéciales sur les finances et les contrôles " +
        "internes des affiliées — garantissant aux membres et régulateurs une gestion " +
        "responsable des fonds.",
    },
    action: { label: { en: "Read More", fr: "En savoir plus" }, href: "/services/financial-auditing" },
  },
  {
    keys: [
      "capacity building",
      "training program",
      "staff training",
      "board training",
      "governance training",
      "formation du personnel",
      "renforcement des capacités",
    ],
    reply: {
      en:
        "Capacity Building covers training for credit union staff and boards — financial " +
        "management, governance, risk management, and digital literacy — delivered through " +
        "regional workshops, on-site coaching, and online modules.",
      fr:
        "Le Renforcement des Capacités couvre la formation du personnel et des conseils " +
        "d'administration des coopératives — gestion financière, gouvernance, gestion des " +
        "risques et culture numérique — via des ateliers régionaux, un accompagnement sur " +
        "site et des modules en ligne.",
    },
    action: { label: { en: "Read More", fr: "En savoir plus" }, href: "/services/capacity-building" },
    chips: [CHIPS.news],
  },
  {
    keys: [
      "digital",
      "digitalization",
      "modernization",
      "technology transformation",
      "phase 1",
      "phase 2",
      "phase 3",
      "digitalisation",
      "transformation numérique",
    ],
    reply: {
      en:
        "CamCCUL's digitalization roadmap has three phases: **Phase 1** — this public " +
        "website (live); **Phase 2** — a digital reporting system for affiliates (in " +
        "development); **Phase 3** — mobile services and digital field-audit tools (planned).",
      fr:
        "La feuille de route de digitalisation de CamCCUL comprend trois phases : **Phase " +
        "1** — ce site web public (en ligne) ; **Phase 2** — un système de rapports " +
        "numériques pour les affiliées (en développement) ; **Phase 3** — services mobiles " +
        "et outils d'audit de terrain numériques (planifiée).",
    },
    action: { label: { en: "Read More", fr: "En savoir plus" }, href: "/services/digitalization" },
  },

  // Fees, membership, loans
  {
    keys: [
      "interest rate",
      "rates",
      "fee",
      "fees",
      "minimum balance",
      "how much does it cost",
      "taux d'intérêt",
      "frais",
      "combien ça coûte",
      "solde minimum",
    ],
    reply: {
      en:
        "Interest rates, fees, and minimum balances are set by each **individual credit " +
        "union**, not by CamCCUL — so they vary. The best way to get current numbers is to " +
        "contact the credit union nearest you.",
      fr:
        "Les taux d'intérêt, frais et soldes minimums sont fixés par **chaque " +
        "coopérative**, et non par CamCCUL — ils varient donc d'une coopérative à l'autre. " +
        "Le mieux est de contacter directement la coopérative la plus proche de chez vous.",
    },
    action: { label: { en: "Find Your Credit Union", fr: "Trouver votre coopérative" }, href: "/affiliates" },
    chips: [CHIPS.findCreditUnion],
  },

  // Kept ahead of the open-account entry below — "group membership" and
  // "adhésion de groupe" are superstrings of its bare "membership"/"adhésion" keys.
  {
    keys: [
      "can a group join",
      "can a business join",
      "can students join",
      "young people join",
      "group membership",
      "student membership",
      "adhésion de groupe",
      "les étudiants peuvent-ils adhérer",
    ],
    reply: {
      en:
        "Eligibility rules — including for groups, businesses, or students — vary by " +
        "credit union. Check with the affiliate nearest you rather than assuming.",
      fr:
        "Les règles d'éligibilité — y compris pour les groupes, entreprises ou étudiants — " +
        "varient selon la coopérative. Vérifiez auprès de l'affiliée la plus proche plutôt " +
        "que de faire une supposition.",
    },
    action: { label: { en: "Find a Credit Union", fr: "Trouver une coopérative" }, href: "/affiliates" },
  },
  {
    keys: [
      "open an account",
      "open account",
      "become a member",
      "membership",
      "how to join",
      "sign up",
      "join a credit union",
      "how do i join",
      "ouvrir un compte",
      "devenir membre",
      "adhésion",
      "comment adhérer",
      "comment rejoindre",
    ],
    reply: {
      en:
        "CamCCUL doesn't open accounts directly — that happens at an **affiliated credit " +
        "union**. Visit one near you with identification; you'll typically need to pay a " +
        "small membership fee and buy at least one share (amounts vary by credit union).",
      fr:
        "CamCCUL n'ouvre pas de comptes directement — cela se fait auprès d'une " +
        "**coopérative de crédit affiliée**. Rendez-vous dans une coopérative près de chez " +
        "vous avec une pièce d'identité ; il faut généralement payer une petite cotisation " +
        "et acheter au moins une part sociale (montants variables selon la coopérative).",
    },
    action: {
      label: { en: "Find a Credit Union Near You", fr: "Trouver une coopérative près de chez vous" },
      href: "/affiliates",
    },
  },
  // Kept ahead of the loans entry below — "non-performing loan" is a
  // superstring of its bare "loan" key.
  {
    keys: [
      "cobac",
      "compliance requirement",
      "liquidity ratio",
      "capital adequacy",
      "non-performing loan",
      "npl ratio",
      "exigences cobac",
      "ratio de liquidité",
      "adéquation des fonds propres",
    ],
    reply: {
      en:
        "COBAC sets prudential standards every credit union must meet: a minimum **100% " +
        "liquidity ratio**, a maximum **5% non-performing loan ratio**, and a minimum **8% " +
        "capital adequacy ratio**. CamCCUL helps affiliates meet and report on these standards.",
      fr:
        "La COBAC fixe des normes prudentielles que chaque coopérative doit respecter : un " +
        "**ratio de liquidité minimum de 100 %**, un **ratio de prêts non performants " +
        "maximum de 5 %**, et un **ratio d'adéquation des fonds propres minimum de 8 %**. " +
        "CamCCUL aide les affiliées à respecter et à rendre compte de ces normes.",
    },
    action: { label: { en: "View Resources", fr: "Voir les ressources" }, href: "/resources" },
  },
  {
    keys: [
      "loan",
      "loans",
      "borrow",
      "apply for a loan",
      "get a loan",
      "need a loan",
      "prêt",
      "prêts",
      "emprunter",
      "demander un prêt",
    ],
    reply: {
      en:
        "CamCCUL doesn't lend directly — loans are provided by **individual credit " +
        "unions**, each with its own terms and eligibility rules. Visit your nearest " +
        "affiliate to apply; I can't tell you whether an application would be approved.",
      fr:
        "CamCCUL ne prête pas directement — les prêts sont accordés par **chaque " +
        "coopérative de crédit**, avec ses propres conditions et critères d'éligibilité. " +
        "Rendez-vous dans votre coopérative la plus proche pour faire une demande ; je ne " +
        "peux pas vous dire si une demande serait approuvée.",
    },
    action: {
      label: { en: "Find a Credit Union Near You", fr: "Trouver une coopérative près de chez vous" },
      href: "/affiliates",
    },
  },

  // Security / regulation
  {
    keys: [
      "is my money safe",
      "safety of my savings",
      "secure",
      "security",
      "protect my money",
      "fraud",
      "insured",
      "deposit insurance",
      "mon argent est-il en sécurité",
      "sécurité de mon épargne",
      "assurance des dépôts",
    ],
    reply: {
      en:
        "Affiliated credit unions operate under strict **COBAC regulation** and CamCCUL's " +
        "ongoing supervision and audits, designed to catch problems early. To be " +
        "transparent: Cameroon does not currently have a national deposit insurance scheme " +
        "for credit unions.",
      fr:
        "Les coopératives affiliées opèrent sous une réglementation stricte de la " +
        "**COBAC** et sous la supervision et les audits continus de CamCCUL, conçus pour " +
        "détecter les problèmes tôt. En toute transparence : le Cameroun ne dispose pas " +
        "actuellement d'un régime national d'assurance des dépôts pour les coopératives de crédit.",
    },
  },

  // Contacting
  {
    keys: [
      "contact",
      "phone number",
      "email address",
      "address",
      "call camccul",
      "reach camccul",
      "headquarters",
      "telephone",
      "courriel",
      "adresse",
      "joindre camccul",
      "siège",
    ],
    reply: {
      en:
        "You can reach CamCCUL headquarters at **(237) 233 44 57 66** or " +
        "**camccul@camccul.com**, or visit us at **P.O. Box 2011, Bamenda, North West " +
        "Region**. Our full contact form and details are on the Contact page.",
      fr:
        "Vous pouvez joindre le siège de CamCCUL au **(237) 233 44 57 66** ou à " +
        "**camccul@camccul.com**, ou nous rendre visite à **P.O. Box 2011, Bamenda, région " +
        "du Nord-Ouest**. Notre formulaire de contact complet se trouve sur la page Contact.",
    },
    action: { label: { en: "Go to Contact Page", fr: "Aller à la page Contact" }, href: "/contact" },
  },
  {
    keys: [
      "login",
      "log in",
      "can't access my account",
      "cannot access my account",
      "forgot password",
      "reset password",
      "account access",
      "my balance",
      "check my balance",
      "my account",
      "connexion",
      "mot de passe oublié",
      "mon solde",
      "accéder à mon compte",
    ],
    reply: {
      en:
        "CamCCUL doesn't hold member accounts or logins — those live with your " +
        "**individual credit union**. For balance checks, password resets, or account " +
        "access, contact your credit union directly. I'll never ask for your PIN or " +
        "password, and neither will genuine CamCCUL staff.",
      fr:
        "CamCCUL ne gère ni comptes ni identifiants de connexion — cela relève de **votre " +
        "coopérative**. Pour vérifier un solde, réinitialiser un mot de passe ou accéder à " +
        "un compte, contactez directement votre coopérative. Je ne vous demanderai jamais " +
        "votre code PIN ou votre mot de passe, et le personnel de CamCCUL non plus.",
    },
    action: { label: { en: "Find Your Credit Union", fr: "Trouver votre coopérative" }, href: "/affiliates" },
  },
  {
    keys: [
      "complaint",
      "problem with my credit union",
      "issue with my credit union",
      "report a credit union",
      "plainte",
      "problème avec ma coopérative",
    ],
    reply: {
      en:
        "I'm sorry to hear that. Please raise it with CamCCUL headquarters directly — " +
        "they take affiliate concerns seriously and can look into it.",
      fr:
        "Je suis désolée de l'apprendre. Merci de signaler cela directement au siège de " +
        "CamCCUL — les préoccupations concernant les affiliées sont prises au sérieux.",
    },
    action: { label: { en: "Contact CamCCUL", fr: "Contacter CamCCUL" }, href: "/contact" },
  },

  // Resources, news, careers, affiliation
  {
    keys: [
      "resource",
      "template",
      "download",
      "training material",
      "forms",
      "ressource",
      "modèle",
      "télécharger",
      "formulaire",
    ],
    reply: {
      en:
        "Our **Resources** page has COBAC reporting templates, regulations, training " +
        "materials, and forms available for download.",
      fr:
        "Notre page **Ressources** propose des modèles de rapports COBAC, des textes " +
        "réglementaires, des supports de formation et des formulaires à télécharger.",
    },
    action: { label: { en: "Browse Resources", fr: "Parcourir les ressources" }, href: "/resources" },
  },
  {
    keys: [
      "news",
      "circular",
      "announcement",
      "upcoming event",
      "training schedule",
      "next workshop",
      "when is the next training",
      "actualité",
      "circulaire",
      "prochaine formation",
      "prochain atelier",
    ],
    reply: {
      en:
        "Check our **News** page for the latest circulars, announcements, and " +
        "training/workshop schedules — I don't have specific upcoming dates to share here.",
      fr:
        "Consultez notre page **Actualités** pour les dernières circulaires, annonces et " +
        "calendriers de formation — je n'ai pas de dates précises à venir à partager ici.",
    },
    action: { label: { en: "View News", fr: "Voir les actualités" }, href: "/news" },
  },
  {
    keys: [
      "job",
      "career",
      "vacancy",
      "hiring",
      "employment opportunity",
      "send my cv",
      "emploi",
      "carrière",
      "recrutement",
      "envoyer mon cv",
    ],
    reply: {
      en:
        "Openings are posted on our **News** page as they come up. You're welcome to send " +
        "a CV to **camccul@camccul.com** for future consideration.",
      fr:
        "Les postes vacants sont publiés sur notre page **Actualités** au fur et à mesure. " +
        "Vous pouvez envoyer un CV à **camccul@camccul.com** pour une prise en compte future.",
    },
    action: { label: { en: "View News", fr: "Voir les actualités" }, href: "/news" },
  },
  {
    keys: [
      "become an affiliate",
      "affiliate with camccul",
      "join camccul",
      "become a camccul affiliate",
      "my credit union wants to join",
      "devenir affilié",
      "adhérer à camccul",
      "notre coopérative veut adhérer",
    ],
    reply: {
      en:
        "CamCCUL can walk your credit union through affiliation — it involves a review of " +
        "your registration, governance, and financial condition. Contact headquarters " +
        "directly to start that conversation.",
      fr:
        "CamCCUL peut accompagner votre coopérative dans le processus d'affiliation — cela " +
        "implique un examen de son enregistrement, de sa gouvernance et de sa situation " +
        "financière. Contactez directement le siège pour entamer cette démarche.",
    },
    action: { label: { en: "Contact CamCCUL", fr: "Contacter CamCCUL" }, href: "/contact" },
  },
  // Generic "what is a credit union" explainer — kept last among all
  // "credit union"-related entries since bare "credit union" is a substring
  // of many more specific phrases above (join a credit union, problem with
  // my credit union, my credit union wants to join, etc.) that must win first.
  {
    keys: [
      "credit union",
      "what is a credit union",
      "cooperative",
      "how is a credit union different",
      "vs bank",
      "difference between a credit union and a bank",
      "coopérative de crédit",
      "différence entre une banque",
    ],
    reply: {
      en:
        "A credit union is a **member-owned, not-for-profit** financial cooperative. " +
        "Members save and borrow together, every member gets **one vote** regardless of " +
        "how much they've saved, and profits flow back through better rates and lower fees " +
        "— unlike a bank, which is owned by outside shareholders.",
      fr:
        "Une coopérative de crédit est une coopérative financière **détenue par ses " +
        "membres, à but non lucratif**. Les membres épargnent et empruntent ensemble, " +
        "chacun dispose d'**une voix**, quel que soit le montant épargné, et les bénéfices " +
        "reviennent aux membres sous forme de meilleurs taux — contrairement à une banque, " +
        "détenue par des actionnaires externes.",
    },
    chips: [CHIPS.findCreditUnion, CHIPS.aboutCamccul],
  },

  // Advice-shaped questions — deflect to a human advisor
  {
    keys: [
      "should i",
      "which account is best",
      "what should i do",
      "recommend",
      "best option for me",
      "which is better for me",
      "que dois-je faire",
      "que me conseillez-vous",
      "que recommandez-vous",
    ],
    reply: {
      en:
        "I can explain how CamCCUL and credit unions work, but I can't recommend a " +
        "specific product or tell you what's right for your situation — that's best " +
        "discussed with an advisor at your credit union.",
      fr:
        "Je peux vous expliquer le fonctionnement de CamCCUL et des coopératives, mais je " +
        "ne peux pas recommander un produit précis ni vous dire ce qui convient à votre " +
        "situation — cela se discute avec un conseiller de votre coopérative.",
    },
    chips: [CHIPS.findCreditUnion, CHIPS.contactUs],
  },
];

export function matchKnowledgeBase(input: string): KBEntry | null {
  const lower = input.toLowerCase();
  for (const entry of ENTRIES) {
    if (entry.test) {
      if (entry.test(lower)) return entry;
      continue;
    }
    if (entry.keys?.some((key) => lower.includes(key))) return entry;
  }
  return null;
}

// Every distinct page a KB reply can deep-link to — prefetched eagerly once
// the chat panel opens so CTA clicks navigate instantly instead of waiting
// on an on-demand route fetch.
export const ACTION_HREFS: string[] = Array.from(
  new Set(
    [WELCOME, FALLBACK, ...ENTRIES]
      .map((entry) => entry.action?.href)
      .filter((href): href is string => Boolean(href))
  )
);
