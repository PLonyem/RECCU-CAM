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
  translateAdminText,
  translateText,
  translateValidationMessage,
  translations,
} from "@/lib/i18n";
import {
  getLocalizedFields,
  localizeHomepageContent,
  localizeHomepageSections,
  localizeAnnouncement,
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

test("admin dashboard copy and operational labels have complete French translations", () => {
  assert.equal(translations.fr["admin.dashboard.welcome"], "Bon retour, {name}");
  assert.equal(translations.fr["admin.dashboard.state"], "Voici l’état actuel de la plateforme numérique RECCU-CAM.");
  assert.equal(translations.fr["admin.dashboard.executiveSummary"], "Résumé exécutif");
  assert.equal(translations.fr["admin.dashboard.bankingInquiries"], "Demandes de services bancaires aux affiliées");
  assert.equal(translations.fr["admin.dashboard.newInstitutionalInquiries"], "Nouvelles demandes institutionnelles");
  assert.equal(translations.fr["admin.dashboard.websiteStatus"], "État du site web");
  assert.equal(translations.fr["admin.dashboard.quickActions"], "Actions rapides");
  assert.equal(translateAdminText("fr", "published"), "Publié");
  assert.equal(translateAdminText("fr", "3 drafts"), "3 brouillons");
  assert.equal(translateAdminText("fr", "5 upcoming programmes"), "5 programmes à venir");
});

test("the admin dashboard body reacts to language changes without changing its server layout", () => {
  const dashboard = readFileSync("src/app/admin/(dashboard)/page.tsx", "utf8");
  const welcome = readFileSync("src/components/admin/AdminDashboardWelcome.tsx", "utf8");
  const adminText = readFileSync("src/components/admin/AdminText.tsx", "utf8");

  assert.match(dashboard, /<AdminText value=\{title\}/);
  assert.match(dashboard, /<AdminDate value=\{/);
  assert.doesNotMatch(dashboard, /Intl\.DateTimeFormat\("en-GB"/);
  assert.match(welcome, /translationKey="admin\.dashboard\.welcome"/);
  assert.match(welcome, /translationKey="admin\.dashboard\.state"/);
  assert.match(adminText, /useLanguage\(\)/);
  assert.match(adminText, /translateAdminText\(language, value \?\? ""\)/);
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

test("announcements use the shared bilingual resolver with field-level English fallback", () => {
  const announcement = localizeAnnouncement(
    { title: "English notice", opening: "English body", translations: { fr: { title: "Avis français", opening: "" } } },
    "fr",
  );
  assert.equal(announcement.title, "Avis français");
  assert.equal(announcement.opening, "English body");
});

test("validation, dates, and numbers respect the selected locale", () => {
  assert.equal(translateValidationMessage("fr", "Email address is required."), "L’adresse e-mail est requise.");
  assert.match(formatDate("2026-09-08T00:00:00Z", "fr", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }), /8 septembre 2026/i);
  assert.notEqual(formatNumber(12345.6, "fr"), formatNumber(12345.6, "en"));
});

test("root rendering and all three application shells use the canonical locale", () => {
  const root = readFileSync("src/app/layout.tsx", "utf8");
  const appProviders = readFileSync("src/components/i18n/AppProviders.tsx", "utf8");
  const switcher = readFileSync("src/components/i18n/LanguageSwitcher.tsx", "utf8");
  const provider = readFileSync("src/context/LanguageContext.tsx", "utf8");
  const navbar = readFileSync("src/components/layout/Navbar.tsx", "utf8");
  const admin = readFileSync("src/components/admin/AdminNavbar.tsx", "utf8");
  const portal = readFileSync("src/components/portal/PortalShell.tsx", "utf8");
  assert.match(root, /<html lang=\{language\}/);
  assert.match(root, /<AppProviders initialLanguage=\{language\}/);
  assert.match(appProviders, /localization=\{language === "fr" \? frFR/);
  assert.match(appProviders, /<LocalizationBoundary>\{children\}<\/LocalizationBoundary>/);
  assert.match(provider, /fetch\("\/api\/locale"/);
  assert.match(switcher, /aria-pressed=\{language === locale\}/);
  for (const source of [navbar, admin, portal]) assert.match(source, /<LanguageSwitcher/);
});

test("every application surface is covered by the global instant localization boundary", () => {
  const boundary = readFileSync("src/components/i18n/LocalizationBoundary.tsx", "utf8");
  const adminLayout = readFileSync("src/app/admin/(dashboard)/layout.tsx", "utf8");
  assert.match(boundary, /MutationObserver/);
  assert.match(boundary, /alt.*aria-label.*placeholder.*title/);
  assert.match(boundary, /data-radix-portal/);
  assert.match(boundary, /translateUiText\(language, source\)/);
  assert.doesNotMatch(boundary, /router\.|location\.|reload\(/);
  assert.doesNotMatch(adminLayout, /AdminLocalizationBoundary/);
});

test("bilingual announcements are persisted safely and localized on every consumer", () => {
  const schema = readFileSync("prisma/schema.prisma", "utf8");
  const migration = readFileSync("prisma/migrations/20260908120000_announcement_i18n/migration.sql", "utf8");
  const adminApi = readFileSync("src/app/api/admin/announcements/route.ts", "utf8");
  const homepage = readFileSync("src/app/(site)/page.tsx", "utf8");
  const portal = readFileSync("src/app/affiliate-portal/[section]/page.tsx", "utf8");
  const feed = readFileSync("src/components/dashboard/AnnouncementsFeed.tsx", "utf8");
  assert.match(schema, /model Announcement[\s\S]*translations\s+Json/);
  assert.match(migration, /ADD COLUMN "translations" JSONB NOT NULL DEFAULT '\{\}'/);
  assert.match(adminApi, /translations: \{ fr: \{ title: data\.titleFr, opening: data\.openingFr \} \}/);
  assert.match(homepage, /localizeAnnouncement\(notice, language\)/);
  assert.match(portal, /rows\.map\(\(row\) => localizeAnnouncement\(row, language\)\)/);
  assert.match(feed, /localizeAnnouncement\(announcement, language\)/);
});

test("public static page metadata is locale-aware", () => {
  const pages = [
    "about", "contact", "faq", "network", "network/affiliates", "network/become-an-affiliate", "network/map",
    "services", "services/affiliate-banking", "services/capacity-building", "services/consultancy", "services/digitalization",
    "services/financial-auditing", "services/regulatory-supervision", "vtime", "vtime/calendar", "vtime/programs", "vtime/registration",
  ];
  for (const page of pages) {
    const source = readFileSync(`src/app/(site)/${page}/page.tsx`, "utf8");
    assert.match(source, /generateMetadata/);
    assert.match(source, /createLocalizedPageMetadata/);
    assert.doesNotMatch(source, /export const metadata/);
  }
});

test("localized public CMS responses are cookie-varying and production builds deploy migrations", () => {
  const homepageApi = readFileSync("src/app/api/homepage/route.ts", "utf8");
  const homepagePage = readFileSync("src/app/(site)/page.tsx", "utf8");
  const footer = readFileSync("src/components/layout/Footer.tsx", "utf8");
  const hero = readFileSync("src/components/home/HomeHero.tsx", "utf8");
  const packageJson = readFileSync("package.json", "utf8");
  const migrationDeploy = readFileSync("scripts/deploy-migrations.mjs", "utf8");

  assert.match(homepageApi, /private, no-store/);
  assert.match(homepageApi, /Vary: "Cookie"/);
  assert.match(homepagePage, /getServerTranslator/);
  assert.match(homepagePage, /<HomeHero content=\{homepageContent\}/);
  assert.match(hero, /localizeHomepageContent\(content, language\)/);
  assert.match(footer, /language === "fr"/);
  assert.match(packageJson, /node scripts\/deploy-migrations\.mjs/);
  assert.match(migrationDeploy, /prisma", "migrate", "deploy"/);
});

test("language switching updates client state before background persistence and route reconciliation", () => {
  const provider = readFileSync("src/context/LanguageContext.tsx", "utf8");
  const switcher = readFileSync("src/components/i18n/LanguageSwitcher.tsx", "utf8");
  const localeRoute = readFileSync("src/app/api/locale/route.ts", "utf8");
  const navbar = readFileSync("src/components/layout/Navbar.tsx", "utf8");
  const portalActions = readFileSync("src/components/layout/PortalActions.tsx", "utf8");

  assert.ok(provider.indexOf("updateLanguage(next)") < provider.indexOf('fetch("/api/locale"'));
  assert.match(provider, /document\.documentElement\.lang = next/);
  assert.match(provider, /localStorage\.setItem\(STORAGE_KEY, next\)/);
  assert.match(provider, /startTransition\(\(\) => router\.refresh\(\)\)/);
  assert.doesNotMatch(provider, /router\.(push|replace)\(/);
  assert.doesNotMatch(provider, /window\.location/);
  assert.doesNotMatch(switcher, /await setLanguage|disabled=\{pending\}/);
  assert.match(switcher, /aria-pressed=\{language === locale\}/);
  assert.match(switcher, /Switch to English/);
  assert.match(switcher, /Passer au français/);
  assert.match(localeRoute, /LOCALE_COOKIE_MAX_AGE/);
  assert.match(localeRoute, /Cache-Control", "no-store"/);
  assert.ok(navbar.indexOf("<LanguageSwitcher />") < navbar.indexOf("<PortalActions"));
  assert.ok(portalActions.indexOf("{portal && (") < portalActions.lastIndexOf("<UserButton />"));
});
