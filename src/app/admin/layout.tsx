import type { Metadata } from "next";
import { getServerTranslator } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const { tText } = await getServerTranslator();
  return {
  title: tText("Administration"),
  robots: { index: false, follow: false, noarchive: true },
  };
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
