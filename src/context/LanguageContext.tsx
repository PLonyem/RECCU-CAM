"use client";

import { createContext, startTransition, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { normalizeLanguage, translateText, translations, type Language, type TranslationKey } from "@/lib/i18n";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
  tText: (value: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "reccucam-language";
const LANGUAGE_EVENT = "reccucam-language-change";

export function LanguageProvider({ children, initialLanguage }: { children: ReactNode; initialLanguage: Language }) {
  const router = useRouter();
  const [language, updateLanguage] = useState(initialLanguage);
  const languageRef = useRef(initialLanguage);
  const confirmedLanguageRef = useRef(initialLanguage);
  const pendingLanguageRef = useRef<Language | null>(null);
  const persistenceActiveRef = useRef(false);

  useEffect(() => {
    document.documentElement.lang = initialLanguage;
    localStorage.setItem(STORAGE_KEY, initialLanguage);
  }, [initialLanguage]);

  useEffect(() => {
    const synchronize = (event: StorageEvent | Event) => {
      const next = event instanceof StorageEvent ? normalizeLanguage(event.newValue) : normalizeLanguage(localStorage.getItem(STORAGE_KEY));
      languageRef.current = next;
      updateLanguage(next);
      document.documentElement.lang = next;
      startTransition(() => router.refresh());
    };
    window.addEventListener("storage", synchronize);
    window.addEventListener(LANGUAGE_EVENT, synchronize);
    return () => {
      window.removeEventListener("storage", synchronize);
      window.removeEventListener(LANGUAGE_EVENT, synchronize);
    };
  }, [router]);

  const setLanguage = useCallback((next: Language) => {
    if (next === languageRef.current) return;
    languageRef.current = next;
    updateLanguage(next);
    document.documentElement.lang = next;
    localStorage.setItem(STORAGE_KEY, next);
    pendingLanguageRef.current = next;

    void (async () => {
      if (persistenceActiveRef.current) return;
      persistenceActiveRef.current = true;
      while (pendingLanguageRef.current) {
        const target = pendingLanguageRef.current;
        pendingLanguageRef.current = null;
        try {
          const response = await fetch("/api/locale", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ locale: target }),
          });
          if (!response.ok) throw new Error("Unable to persist language preference.");
          confirmedLanguageRef.current = target;
        } catch {
          if (pendingLanguageRef.current) continue;
          const confirmed = confirmedLanguageRef.current;
          languageRef.current = confirmed;
          updateLanguage(confirmed);
          document.documentElement.lang = confirmed;
          localStorage.setItem(STORAGE_KEY, confirmed);
        }
      }
      persistenceActiveRef.current = false;
      startTransition(() => router.refresh());
    })();
  }, [router]);

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
