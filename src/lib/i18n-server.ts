import "server-only";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, normalizeLanguage, translateText, translations, type TranslationKey } from "@/lib/i18n";

export async function getServerLanguage() {
  return normalizeLanguage((await cookies()).get(LOCALE_COOKIE)?.value);
}

export async function getServerTranslator() {
  const language = await getServerLanguage();
  return {
    language,
    t: (key: TranslationKey) => translations[language][key],
    tText: (value: string) => translateText(language, value),
  };
}
