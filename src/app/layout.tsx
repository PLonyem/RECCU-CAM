import type { Metadata, Viewport } from "next";
import { Inter, Lexend } from "next/font/google";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { ChatbotProvider } from "@/components/chatbot/Chatbot";
import { LanguageProvider } from "@/context/LanguageContext";
import { affiliates } from "@/lib/mock-data";
import "./globals.css";

const affiliateCount = affiliates.filter((a) => a.isActive).length;

// Fires on every page, but only acts inside /admin/*: a real reload (F5) on
// an admin sub-page bounces to /admin before that page's own content is
// parsed. `beforeInteractive` runs from <head>, ahead of body/hydration, so
// there's no flash of the sub-page — unlike a useEffect-based check, which
// only runs after the whole page has already rendered and hydrated.
const ADMIN_RELOAD_GUARD_SCRIPT = `(function(){try{if(!location.pathname.startsWith("/admin")||location.pathname==="/admin")return;var e=performance.getEntriesByType("navigation")[0];if(e&&e.type==="reload"){location.replace("/admin");}}catch(err){}})();`;

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CamCCUL — Cameroon Cooperative Credit Union League",
  description: `Supervising ${affiliateCount}+ credit unions across all 10 regions of Cameroon since 1968.`,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets fixed elements (e.g. the chatbot bubble) read env(safe-area-inset-*)
  // so they clear the notch/home-indicator area on modern phones instead of
  // sitting under it.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        data-scroll-behavior="smooth"
        className={`${inter.variable} ${lexend.variable} h-full antialiased`}
      >
        <body className={`${inter.className} min-h-full flex flex-col`}>
          <Script
            id="admin-reload-guard"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{ __html: ADMIN_RELOAD_GUARD_SCRIPT }}
          />
          <LanguageProvider>
            <ChatbotProvider>{children}</ChatbotProvider>
          </LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
