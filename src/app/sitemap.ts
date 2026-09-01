import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/institution";

const routes = [
  "",
  "/about",
  "/network/affiliates",
  "/network/map",
  "/services/affiliate-banking",
  "/vtime",
  "/vtime/programs",
  "/vtime/calendar",
  "/knowledge",
  "/news",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
