import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/institution";
import { trainingPrograms } from "@/data/training-programs";

const routes = [
  "",
  "/about",
  "/about/who-we-are",
  "/about/history",
  "/about/governance",
  "/about/leadership",
  "/about/institutional-framework",
  "/network/affiliates",
  "/network/map",
  "/network/become-an-affiliate",
  "/services/regulatory-supervision",
  "/services/financial-auditing",
  "/services/capacity-building",
  "/services/affiliate-banking",
  "/services/digitalization",
  "/services/consultancy",
  "/vtime",
  "/vtime/programs",
  ...trainingPrograms.map((program) => `/vtime/programs/${program.slug}`),
  "/vtime/calendar",
  "/vtime/registration",
  "/vtime/resources",
  "/knowledge",
  "/knowledge/regulatory-library",
  "/knowledge/circulars",
  "/knowledge/publications",
  "/knowledge/compliance-resources",
  "/resources",
  "/faq",
  "/news",
  "/contact",
  "/privacy",
  "/terms",
  "/accessibility",
  "/sitemap",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
