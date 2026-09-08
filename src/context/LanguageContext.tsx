"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { normalizeLanguage, translateText, translations, type Language, type TranslationKey } from "@/lib/i18n";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: (key: TranslationKey) => string;
  tText: (value: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "reccucam-language";
const LANGUAGE_EVENT = "reccucam-language-change";

export function LanguageProvider({ children, initialLanguage }: { children: ReactNode; initialLanguage: Language }) {
  const router = useRouter();
  const [language, updateLanguage] = useState(initialLanguage);

  useEffect(() => {
    document.documentElement.lang = initialLanguage;
    localStorage.setItem(STORAGE_KEY, initialLanguage);
  }, [initialLanguage]);

  useEffect(() => {
    const synchronize = (event: StorageEvent | Event) => {
      const next = event instanceof StorageEvent ? normalizeLanguage(event.newValue) : normalizeLanguage(localStorage.getItem(STORAGE_KEY));
      updateLanguage(next);
      document.documentElement.lang = next;
      router.refresh();
    };
    window.addEventListener("storage", synchronize);
    window.addEventListener(LANGUAGE_EVENT, synchronize);
    return () => {
      window.removeEventListener("storage", synchronize);
      window.removeEventListener(LANGUAGE_EVENT, synchronize);
    };
  }, [router]);

  const setLanguage = useCallback(async (next: Language) => {
    if (next === language) return;
    const previous = language;
    updateLanguage(next);
    document.documentElement.lang = next;
    localStorage.setItem(STORAGE_KEY, next);
    try {
      const response = await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: next }),
      });
      if (!response.ok) throw new Error("Unable to persist language preference.");
      router.refresh();
    } catch (error) {
      updateLanguage(previous);
      document.documentElement.lang = previous;
      localStorage.setItem(STORAGE_KEY, previous);
      throw error;
    }
  }, [language, router]);

  const t = useCallback(
    (key: TranslationKey) => translations[language][key],
    [language]
  );
  const tText = useCallback((value: string) => translateText(language, value), [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tText }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
