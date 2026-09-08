import "server-only";

import type { Metadata } from "next";
import { getServerTranslator } from "@/lib/i18n-server";
import { createPageMetadata } from "@/lib/seo";

export async function createLocalizedPageMetadata({ title, description, path }: {
  title: string;
  description: string;
  path: string;
}): Promise<Metadata> {
  const { language, tText } = await getServerTranslator();
  return createPageMetadata({ title: tText(title), description: tText(description), path, locale: language });
}
