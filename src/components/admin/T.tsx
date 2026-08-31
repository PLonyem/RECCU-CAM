"use client";

import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/i18n";

// Lets server components (which can't call the useLanguage hook directly)
// drop a translated string into otherwise server-rendered JSX.
export function T({ k }: { k: TranslationKey }) {
  const { t } = useLanguage();
  return <>{t(k)}</>;
}
