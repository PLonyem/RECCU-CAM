"use client";

import type { ReactNode } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { formatDate, translateAdminText, type TranslationKey } from "@/lib/i18n";

export function AdminText({ value, translationKey, replacements }: {
  value?: string;
  translationKey?: TranslationKey;
  replacements?: Record<string, string>;
}) {
  const { language, t } = useLanguage();
  let translated = translationKey ? t(translationKey) : translateAdminText(language, value ?? "");
  for (const [key, replacement] of Object.entries(replacements ?? {})) {
    translated = translated.replace(`{${key}}`, replacement);
  }
  return translated;
}

export function AdminDate({ value, includeTime = false, empty = "Not scheduled" }: { value: Date | null; includeTime?: boolean; empty?: string }) {
  const { language } = useLanguage();
  if (!value) return <AdminText value={empty} />;
  return formatDate(value, language, includeTime
    ? { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }
    : { day: "2-digit", month: "short", year: "numeric" });
}

export function AdminTextNode({ children }: { children: ReactNode }) {
  return typeof children === "string" ? <AdminText value={children} /> : children;
}
