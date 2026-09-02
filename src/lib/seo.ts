import type { Metadata } from "next";
import { institution, siteUrl } from "@/config/institution";

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
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
      locale: "en_CM",
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
}: NewsArticleMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const socialImage = absoluteUrl("/opengraph-image");
  const base = createPageMetadata({ title, description, path });

  return {
    ...base,
    openGraph: {
      type: "article",
      locale: "en_CM",
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
