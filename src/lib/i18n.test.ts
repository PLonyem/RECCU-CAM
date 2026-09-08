import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  DEFAULT_LANGUAGE,
  LOCALE_COOKIE,
  formatDate,
  formatNumber,
  hasFrenchTranslation,
  normalizeLanguage,
  translateText,
  translateValidationMessage,
  translations,
} from "@/lib/i18n";
import {
  getLocalizedFields,
  localizeHomepageContent,
  localizeHomepageSections,
  localizeNewsArticle,
  localizeResource,
  localizeTrainingProgram,
  translationCompleteness,
} from "@/lib/localized-content";
import { blankHomepageSections, defaultHomepageSections } from "@/data/homepage-cms";

test("locale configuration is cookie-backed and fail-safe", () => {
  assert.equal(LOCALE_COOKIE, "reccu_locale");
  assert.equal(DEFAULT_LANGUAGE, "en");
  assert.equal(normalizeLanguage("fr"), "fr");
  assert.equal(normalizeLanguage("de"), "en");
});

test("English and French dictionaries expose the same translation keys", () => {
  assert.deepEqual(Object.keys(translations.en).sort(), Object.keys(translations.fr).sort());
  assert.equal(translations.fr["admin.dashboard"], "Tableau de bord");
  assert.equal(translations.fr["language.french"], "Français");
});

test("shared frontend and admin interface labels translate", () => {
  assert.equal(translateText("fr", "Our Network"), "Notre réseau");
  assert.equal(translateText("fr", "Support Requests"), "Demandes d’assistance");
  assert.equal(translateText("fr", "Inbox"), "Boîte de réception");
});

test("French editorial content falls back field-by-field to English", () => {
  const english = { title: "English title", description: "English description" };
  assert.deepEqual(getLocalizedFields(english, { fr: { title: "Titre français", description: "" } }, "fr"), {
    title: "Titre français",
    description: "English description",
  });
  assert.deepEqual(translationCompleteness({ fr: { title: "Titre français" } }, ["title", "description"]), { completed: 1, total: 2, complete: false });
});

test("homepage CMS content resolves English and French on the server", () => {
  const content = {
    heroBadge: "Institutional network",
    heroTitle: "English headline",
    heroSubtitle: "English subtitle",
    primaryButtonText: "Explore the network",
    primaryButtonLink: "/network",
    secondaryButtonText: "Discover VTIME",
    secondaryButtonLink: "/vtime",
    translations: {
      fr: {
        heroBadge: "Réseau institutionnel",
        heroTitle: "Titre français",
        heroSubtitle: "Sous-titre français",
        primaryButtonText: "Explorer le réseau",
        secondaryButtonText: "Découvrir VTIME",
      },
    },
  };

  assert.equal(localizeHomepageContent(content, "en").heroTitle, "English headline");
  const french = localizeHomepageContent(content, "fr");
  assert.equal(french.heroBadge, "Réseau institutionnel");
  assert.equal(french.heroTitle, "Titre français");
  assert.equal(french.heroSubtitle, "Sous-titre français");
  assert.equal(french.primaryButtonText, "Explorer le réseau");
  assert.equal(french.secondaryButtonText, "Découvrir VTIME");
  assert.equal(french.primaryButtonLink, "/network");
});

test("homepage sections use French dictionary copy when the French CMS record is missing or partial", () => {
  const missing = localizeHomepageSections(defaultHomepageSections, null, "fr");
  assert.equal(missing.whoTitle, "Une institution faîtière au service d’une mission coopérative.");
  assert.equal(missing.whoDescription, "RECCU-CAM est un réseau financier coopératif faîtier qui soutient les institutions financières coopératives et les communautés qu’elles servent.");

  const partial = localizeHomepageSections(defaultHomepageSections, { ...blankHomepageSections, whoTitle: "Titre CMS" }, "fr");
  assert.equal(partial.whoTitle, "Titre CMS");
  assert.equal(partial.missionTitle, "Renforcer les conditions d’une finance coopérative durable.");
});

test("every built-in homepage section fallback has French copy", () => {
  const copy = [
    defaultHomepageSections.whoTitle,
    defaultHomepageSections.whoDescription,
    defaultHomepageSections.missionTitle,
    defaultHomepageSections.missionBody,
    defaultHomepageSections.visionTitle,
    defaultHomepageSections.visionBody,
    ...defaultHomepageSections.values.flatMap((value) => [value.title, value.description]),
    defaultHomepageSections.contactTitle,
    defaultHomepageSections.contactDescription,
    defaultHomepageSections.contactButtonText,
  ];
  for (const value of copy) assert.equal(hasFrenchTranslation(value), true, `Missing French fallback: ${value}`);
});

test("shared CMS resolver localizes news, VTIME, and resources with per-field fallback", () => {
  const news = localizeNewsArticle(
    { title: "News", excerpt: "Summary", content: "Body", translations: { fr: { title: "Actualité", content: "Corps" } } },
    "fr",
  );
  const training = localizeTrainingProgram(
    { title: "Course", summary: "Course summary", translations: { fr: { title: "Formation", summary: "Résumé" } } },
    "fr",
  );
  const resource = localizeResource(
    { title: "Guide", description: "English description", translations: { fr: { title: "Guide FR", description: "" } } },
    "fr",
  );

  assert.deepEqual({ title: news.title, excerpt: news.excerpt, content: news.content }, { title: "Actualité", excerpt: "Summary", content: "Corps" });
  assert.deepEqual({ title: training.title, summary: training.summary }, { title: "Formation", summary: "Résumé" });
  assert.deepEqual({ title: resource.title, description: resource.description }, { title: "Guide FR", description: "English description" });
});

test("validation, dates, and numbers respect the selected locale", () => {
  assert.equal(translateValidationMessage("fr", "Email address is required."), "L’adresse e-mail est requise.");
  assert.match(formatDate("2026-09-08T00:00:00Z", "fr", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }), /8 septembre 2026/i);
  assert.notEqual(formatNumber(12345.6, "fr"), formatNumber(12345.6, "en"));
});

test("root rendering and all three application shells use the canonical locale", () => {
  const root = readFileSync("src/app/layout.tsx", "utf8");
  const switcher = readFileSync("src/components/i18n/LanguageSwitcher.tsx", "utf8");
  const provider = readFileSync("src/context/LanguageContext.tsx", "utf8");
  const navbar = readFileSync("src/components/layout/Navbar.tsx", "utf8");
  const admin = readFileSync("src/components/admin/AdminNavbar.tsx", "utf8");
  const portal = readFileSync("src/components/portal/PortalShell.tsx", "utf8");
  assert.match(root, /<html lang=\{language\}/);
  assert.match(root, /localization=\{language === "fr" \? frFR/);
  assert.match(provider, /fetch\("\/api\/locale"/);
  assert.match(switcher, /aria-pressed=\{language === locale\}/);
  for (const source of [navbar, admin, portal]) assert.match(source, /<LanguageSwitcher/);
});

test("localized public CMS responses are cookie-varying and production builds deploy migrations", () => {
  const homepageApi = readFileSync("src/app/api/homepage/route.ts", "utf8");
  const homepagePage = readFileSync("src/app/(site)/page.tsx", "utf8");
  const footer = readFileSync("src/components/layout/Footer.tsx", "utf8");
  const packageJson = readFileSync("package.json", "utf8");
  const migrationDeploy = readFileSync("scripts/deploy-migrations.mjs", "utf8");

  assert.match(homepageApi, /private, no-store/);
  assert.match(homepageApi, /Vary: "Cookie"/);
  assert.match(homepagePage, /getServerTranslator/);
  assert.match(homepagePage, /localizeHomepageContent\(homepageContent, language\)/);
  assert.match(footer, /language === "fr"/);
  assert.match(packageJson, /node scripts\/deploy-migrations\.mjs/);
  assert.match(migrationDeploy, /prisma", "migrate", "deploy"/);
});
