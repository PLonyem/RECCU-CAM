"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations/fr-FR";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
import { LocalizationBoundary } from "@/components/i18n/LocalizationBoundary";
import type { Language } from "@/lib/i18n";

function LocaleAwareProviders({ children, clerkConfigured }: { children: React.ReactNode; clerkConfigured: boolean }) {
  const { language } = useLanguage();
  const content = <LocalizationBoundary>{children}</LocalizationBoundary>;

  if (!clerkConfigured) return content;
  return (
    <ClerkProvider
      localization={language === "fr" ? frFR : undefined}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/auth/complete"
      signUpFallbackRedirectUrl="/auth/complete"
    >
      {content}
    </ClerkProvider>
  );
}

export function AppProviders({ children, initialLanguage, clerkConfigured }: {
  children: React.ReactNode;
  initialLanguage: Language;
  clerkConfigured: boolean;
}) {
  return (
    <LanguageProvider initialLanguage={initialLanguage}>
      <LocaleAwareProviders clerkConfigured={clerkConfigured}>{children}</LocaleAwareProviders>
    </LanguageProvider>
  );
}
