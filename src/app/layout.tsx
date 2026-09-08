import type { Metadata, Viewport } from "next";
import { Inter, Lexend } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations/fr-FR";
import { LanguageProvider } from "@/context/LanguageContext";
import { institution, siteUrl } from "@/config/institution";
import { designTokens } from "@/config/design-tokens";
import { isClerkConfigured } from "@/lib/auth/config";
import { getServerLanguage } from "@/lib/i18n-server";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const lexend = Lexend({ variable: "--font-lexend", subsets: ["latin"], display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguage();
  const platformLabel = language === "fr" ? "Plateforme du réseau coopératif" : "Cooperative network platform";
  const description = language === "fr"
    ? "La plateforme numérique institutionnelle de RECCU-CAM pour le réseau coopératif au Cameroun."
    : institution.platformStatement;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: `${institution.brandName} | ${platformLabel}`, template: `%s | ${institution.brandName}` },
    description,
    applicationName: institution.brandName,
    category: "finance",
    openGraph: {
      type: "website",
      locale: language === "fr" ? "fr_CM" : "en_CM",
      siteName: institution.brandName,
      title: `${institution.brandName} | ${platformLabel}`,
      description,
      url: "/",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${institution.brandName} ${platformLabel}` }],
    },
    twitter: { card: "summary_large_image", title: institution.brandName, description, images: ["/opengraph-image"] },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: designTokens.colors.brand,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const language = await getServerLanguage();
  const content = (
    <LanguageProvider initialLanguage={language}>{children}</LanguageProvider>
  );

  return (
    <html lang={language} className={`${inter.variable} ${lexend.variable} h-full antialiased`}>
      <body className={`${inter.className} min-h-full bg-background text-foreground`}>
        {isClerkConfigured() ? (
          <ClerkProvider
            localization={language === "fr" ? frFR : undefined}
            signInUrl="/sign-in"
            signUpUrl="/sign-up"
            signInFallbackRedirectUrl="/auth/complete"
            signUpFallbackRedirectUrl="/auth/complete"
          >
            {content}
          </ClerkProvider>
        ) : content}
      </body>
    </html>
  );
}
