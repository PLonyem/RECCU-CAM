import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/institution";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/dashboard",
          "/api",
          "/affiliate-portal",
          "/login",
          "/sign-up",
          "/signup",
        ],
      },
    ],
    host: siteUrl,
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
