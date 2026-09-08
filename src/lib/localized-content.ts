import type { Language } from "@/lib/i18n";
import type { HomepageSectionsContent } from "@/data/homepage-cms";

type TranslationRecord = Record<string, unknown>;

function isRecord(value: unknown): value is TranslationRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function getLocalizedFields<T extends TranslationRecord>(
  english: T,
  translations: unknown,
  language: Language,
): T {
  if (language === "en" || !isRecord(translations) || !isRecord(translations.fr)) return english;
  const french = translations.fr;
  return Object.fromEntries(
    Object.entries(english).map(([key, englishValue]) => {
      const translated = french[key];
      return [key, typeof translated === "string" && translated.trim() ? translated : englishValue];
    }),
  ) as T;
}

export function getTranslationDraft(translations: unknown, language: Exclude<Language, "en"> = "fr") {
  if (!isRecord(translations) || !isRecord(translations[language])) return {};
  return translations[language] as Record<string, unknown>;
}

export function translationCompleteness(translations: unknown, fields: readonly string[], language: Exclude<Language, "en"> = "fr") {
  const draft = getTranslationDraft(translations, language);
  const completed = fields.filter((field) => typeof draft[field] === "string" && (draft[field] as string).trim()).length;
  return { completed, total: fields.length, complete: completed === fields.length };
}

const homepageFields = ["heroBadge", "heroTitle", "heroSubtitle", "primaryButtonText", "primaryButtonLink", "secondaryButtonText", "secondaryButtonLink"] as const;

export function localizeHomepageContent<T extends { translations: unknown } & Record<(typeof homepageFields)[number], string>>(
  content: T,
  language: Language,
): T {
  if (language === "en") return content;
  const english = Object.fromEntries(homepageFields.map((field) => [field, content[field]])) as Pick<T, (typeof homepageFields)[number]>;
  return { ...content, ...getLocalizedFields(english, content.translations, language) };
}

export function localizeNewsArticle<T extends { title: string; excerpt: string; content: string; translations: unknown }>(
  article: T,
  language: Language,
): T {
  return { ...article, ...getLocalizedFields({ title: article.title, excerpt: article.excerpt, content: article.content }, article.translations, language) };
}

export function localizeTrainingProgram<T extends { title: string; summary: string; translations: unknown }>(
  program: T,
  language: Language,
): T {
  return { ...program, ...getLocalizedFields({ title: program.title, summary: program.summary }, program.translations, language) };
}

export function localizeResource<T extends { title: string; description: string | null; translations: unknown }>(
  resource: T,
  language: Language,
): T {
  const localized = getLocalizedFields({ title: resource.title, description: resource.description ?? "" }, resource.translations, language);
  return { ...resource, title: localized.title, description: localized.description || null };
}

export function localizeHomepageSections(
  english: HomepageSectionsContent,
  french: HomepageSectionsContent | null,
  language: Language,
): HomepageSectionsContent {
  if (language === "en" || !french) return english;
  const text = (candidate: string | undefined, fallback: string) => candidate?.trim() || fallback;
  return {
    whoTitle: text(french.whoTitle, english.whoTitle),
    whoDescription: text(french.whoDescription, english.whoDescription),
    missionTitle: text(french.missionTitle, english.missionTitle),
    missionBody: text(french.missionBody, english.missionBody),
    visionTitle: text(french.visionTitle, english.visionTitle),
    visionBody: text(french.visionBody, english.visionBody),
    values: english.values.map((value, index) => ({ title: text(french.values[index]?.title, value.title), description: text(french.values[index]?.description, value.description) })),
    leaderName: text(french.leaderName, english.leaderName),
    leaderRole: text(french.leaderRole, english.leaderRole),
    leaderMessage: text(french.leaderMessage, english.leaderMessage),
    contactTitle: text(french.contactTitle, english.contactTitle),
    contactDescription: text(french.contactDescription, english.contactDescription),
    contactButtonText: text(french.contactButtonText, english.contactButtonText),
  };
}
