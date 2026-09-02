import { institution } from "@/config/institution";
import { absoluteUrl } from "@/lib/seo";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface NewsArticleStructuredDataInput {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  imagePath?: string;
}

const organizationId = absoluteUrl("/#organization");
const websiteId = absoluteUrl("/#website");

export function createSiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: institution.displayName,
        legalName: institution.legalName,
        alternateName: institution.brandName,
        url: absoluteUrl("/"),
        description: institution.shortDescription,
        address: {
          "@type": "PostalAddress",
          addressLocality: institution.location.city,
          addressRegion: institution.location.region,
          addressCountry: institution.location.country,
        },
        identifier: {
          "@type": "PropertyValue",
          name: `${institution.approval.authority} approval order`,
          value: institution.approval.order,
          url: institution.approval.sourceUrl,
        },
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: institution.brandName,
        url: absoluteUrl("/"),
        description: institution.platformStatement,
        inLanguage: "en-CM",
        publisher: { "@id": organizationId },
      },
    ],
  };
}

export function createBreadcrumbStructuredData(items: readonly BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.href),
    })),
  };
}

/**
 * Schema architecture for a future public news detail route. Only pass
 * verified, published records; restricted and draft content stays private.
 */
export function createNewsArticleStructuredData({
  headline,
  description,
  path,
  datePublished,
  dateModified,
  authorName,
  imagePath,
}: NewsArticleStructuredDataInput) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline,
    description,
    mainEntityOfPage: absoluteUrl(path),
    datePublished,
    dateModified: dateModified ?? datePublished,
    ...(imagePath ? { image: [absoluteUrl(imagePath)] } : {}),
    author: authorName
      ? { "@type": "Person", name: authorName }
      : { "@id": organizationId },
    publisher: { "@id": organizationId },
  };
}
