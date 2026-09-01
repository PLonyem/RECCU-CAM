import type { Metadata, Viewport } from "next";
import { Inter, Lexend } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { LanguageProvider } from "@/context/LanguageContext";
import { institution, siteUrl } from "@/config/institution";
import { designTokens } from "@/config/design-tokens";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const lexend = Lexend({ variable: "--font-lexend", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${institution.brandName} | Cooperative network platform`,
    template: `%s | ${institution.brandName}`,
  },
  description: institution.platformStatement,
  applicationName: institution.brandName,
  category: "finance",
  openGraph: {
    type: "website",
    locale: "en_CM",
    siteName: institution.brandName,
    title: `${institution.brandName} | Cooperative network platform`,
    description: institution.platformStatement,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: institution.brandName,
    description: institution.platformStatement,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: designTokens.colors.brand,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const document = (
    <html lang="en" className={`${inter.variable} ${lexend.variable} h-full antialiased`}>
      <body className={`${inter.className} min-h-full bg-background text-foreground`}>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );

  return process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (
    <ClerkProvider>{document}</ClerkProvider>
  ) : document;
}
