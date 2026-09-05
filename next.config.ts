import type { NextConfig } from "next";

const enableHsts =
  process.env.VERCEL === "1" ||
  process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://") === true;

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  ...(enableHsts
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  devIndicators: {
    position: "bottom-left",
  },
  images: {
    // Every Supabase project's Storage URLs resolve under this pattern —
    // needed for next/image to render uploaded hero images (Homepage
    // Editor). Harmless while Supabase Storage is unconfigured; matters the
    // moment SUPABASE_URL is set and someone uploads an image.
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
  async redirects() {
    return [
      { source: "/affiliates", destination: "/network/affiliates", permanent: true },
      { source: "/affiliates/:code", destination: "/network/affiliates/:code", permanent: true },
      { source: "/loan-calculator", destination: "/services/affiliate-banking", permanent: true },
      { source: "/resources", destination: "/knowledge", permanent: true },
      { source: "/resources/chapter-profile-template", destination: "/knowledge", permanent: true },
      { source: "/news/:slug", destination: "/news", permanent: true },
    ];
  },
  async headers() {
    const privateCacheHeaders = [
      { key: "Cache-Control", value: "private, no-store, max-age=0" },
    ];
    return [
      { source: "/(.*)", headers: securityHeaders },
      { source: "/admin/:path*", headers: privateCacheHeaders },
      { source: "/dashboard/:path*", headers: privateCacheHeaders },
      { source: "/affiliate-portal/:path*", headers: privateCacheHeaders },
      { source: "/api/admin/:path*", headers: privateCacheHeaders },
      { source: "/api/affiliate-portal/:path*", headers: privateCacheHeaders },
      { source: "/sign-in/:path*", headers: privateCacheHeaders },
      { source: "/login/:path*", headers: privateCacheHeaders },
    ];
  },
};

export default nextConfig;
