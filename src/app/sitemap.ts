import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/institution";
import { trainingPrograms } from "@/data/training-programs";
import { publicKnowledgeDocuments } from "@/data/knowledge";
import { affiliates } from "@/data/affiliates";

const routes = [
  "",
  "/about",
  "/about/who-we-are",
  "/about/history",
  "/about/governance",
  "/about/leadership",
  "/about/institutional-framework",
  "/network/affiliates",
  ...affiliates.map((affiliate) => `/network/affiliates/${affiliate.slug}`),
  "/network/map",
  "/network/become-an-affiliate",
  "/services",
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
  ...publicKnowledgeDocuments.map((document) => `/knowledge/${document.slug}`),
  "/faq",
  "/news",
  "/contact",
  "/privacy",
  "/terms",
  "/accessibility",
  "/sitemap",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => {
    const isDetailPage =
      route.startsWith("/network/affiliates/") ||
      route.startsWith("/vtime/programs/") ||
      route.startsWith("/knowledge/");

    return {
      url: `${siteUrl}${route}`,
      changeFrequency: route === "" ? "weekly" : "monthly",
      priority: route === "" ? 1 : isDetailPage ? 0.6 : 0.7,
    };
  });
}
