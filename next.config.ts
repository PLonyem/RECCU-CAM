import type { NextConfig } from "next";

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
      { source: "/services/capacity-building", destination: "/vtime", permanent: true },
      { source: "/services/digitalization", destination: "/services/affiliate-banking", permanent: true },
      { source: "/services/financial-auditing", destination: "/services/affiliate-banking", permanent: true },
      { source: "/services/regulatory-supervision", destination: "/knowledge", permanent: true },
      { source: "/news/:slug", destination: "/news", permanent: true },
      { source: "/affiliate-portal", destination: "/dashboard", permanent: false },
    ];
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
      ],
    }];
  },
};

export default nextConfig;
