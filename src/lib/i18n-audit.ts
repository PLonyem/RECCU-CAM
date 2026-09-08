import { informationPages, siteNavigation } from "@/data/site-navigation";
import { hasFrenchTranslation, translations } from "@/lib/i18n";

export function getDictionaryParity() {
  const english = new Set(Object.keys(translations.en));
  const french = new Set(Object.keys(translations.fr));
  return {
    missingInEnglish: [...french].filter((key) => !english.has(key)).sort(),
    missingInFrench: [...english].filter((key) => !french.has(key)).sort(),
  };
}

export function getNavigationTranslationGaps() {
  const values = siteNavigation.flatMap((item) => [
    item.label,
    ...(item.children?.flatMap((child) => [child.label, child.description]) ?? []),
  ]);
  return [...new Set(values.filter((value) => value !== "VTIME" && !hasFrenchTranslation(value)))].sort();
}

export function getInformationPageTranslationGaps() {
  const values = Object.values(informationPages).flat();
  return [...new Set(values.filter((value) => value !== "VTIME" && !hasFrenchTranslation(value)))].sort();
}
