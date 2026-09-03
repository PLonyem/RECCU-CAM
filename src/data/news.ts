export const newsCategorySlugs = [
  "network-news",
  "training",
  "agms",
  "affiliate-updates",
  "partnerships",
  "announcements",
] as const;

export type NewsCategorySlug = (typeof newsCategorySlugs)[number];

export interface NewsCategory {
  slug: NewsCategorySlug;
  label: string;
  description: string;
}

export interface PublishedNewsArticle {
  id: string;
  kind: "article";
  slug: string;
  title: string;
  summary: string;
  body: readonly string[];
  category: NewsCategorySlug;
  publishedAt: string;
  updatedAt: string | null;
  authorName: string | null;
  featured: boolean;
}

export interface PublishedNewsEvent {
  id: string;
  kind: "event";
  slug: string;
  title: string;
  summary: string;
  body: readonly string[];
  category: NewsCategorySlug;
  startDate: string;
  endDate: string | null;
  location: string | null;
}

export type PublishedNewsItem = PublishedNewsArticle | PublishedNewsEvent;

export const newsCategories: readonly NewsCategory[] = [
  { slug: "network-news", label: "Network News", description: "Approved updates about the cooperative network." },
  { slug: "training", label: "Training", description: "Confirmed professional-development notices." },
  { slug: "agms", label: "AGMs", description: "Verified annual general meeting information." },
  { slug: "affiliate-updates", label: "Affiliate Updates", description: "Approved updates supplied by network institutions." },
  { slug: "partnerships", label: "Partnerships", description: "Source-verified institutional partnership updates." },
  { slug: "announcements", label: "Announcements", description: "Official public notices from RECCU-CAM." },
] as const;

// Public collections remain empty until records have been approved and their
// publication details verified. The card and detail-page architecture below
// is intentionally ready without relabelling legacy or draft content.
export const publishedNewsArticles: readonly PublishedNewsArticle[] = [];
export const publishedNewsEvents: readonly PublishedNewsEvent[] = [];

export const featuredNews = publishedNewsArticles.filter((article) => article.featured);
export const latestNews = [...publishedNewsArticles].sort((a, b) =>
  b.publishedAt.localeCompare(a.publishedAt),
);
export const upcomingEvents = [...publishedNewsEvents].sort((a, b) =>
  a.startDate.localeCompare(b.startDate),
);

export function getNewsCategory(slug: NewsCategorySlug) {
  return newsCategories.find((category) => category.slug === slug);
}

export function getPublishedNewsItemBySlug(slug: string): PublishedNewsItem | undefined {
  return [...publishedNewsArticles, ...publishedNewsEvents].find((item) => item.slug === slug);
}

export function formatNewsDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
