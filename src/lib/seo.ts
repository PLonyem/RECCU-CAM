import type { Metadata } from "next";
import { institution, siteUrl } from "@/config/institution";
import type { Language } from "@/lib/i18n";

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  locale?: Language;
}

export interface NewsArticleMetadataInput extends PageMetadataInput {
  publishedTime: string;
  modifiedTime?: string;
  authors?: string[];
}

export function absoluteUrl(path: string) {
  return new URL(path || "/", `${siteUrl}/`).toString();
}

export function createPageMetadata({
  title,
  description,
  path,
  locale = "en",
}: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const socialImage = {
    url: absoluteUrl("/opengraph-image"),
    width: 1200,
    height: 630,
    alt: `${institution.brandName} cooperative network platform`,
  };

  return {
    title,
    description,
    alternates: { canonical },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "fr" ? "fr_CM" : "en_CM",
      alternateLocale: locale === "fr" ? ["en_CM"] : ["fr_CM"],
      siteName: institution.brandName,
      title,
      description,
      url: canonical,
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage.url],
    },
  };
}

/**
 * Metadata architecture for future verified, published news content. Drafts
 * and unpublished records must never call this helper from a public route.
 */
export function createNewsArticleMetadata({
  title,
  description,
  path,
  publishedTime,
  modifiedTime,
  authors,
  locale = "en",
}: NewsArticleMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const socialImage = absoluteUrl("/opengraph-image");
  const base = createPageMetadata({ title, description, path, locale });

  return {
    ...base,
    openGraph: {
      type: "article",
      locale: locale === "fr" ? "fr_CM" : "en_CM",
      alternateLocale: locale === "fr" ? ["en_CM"] : ["fr_CM"],
      siteName: institution.brandName,
      title,
      description,
      url: canonical,
      publishedTime,
      modifiedTime,
      authors,
      images: [socialImage],
    },
  };
}
