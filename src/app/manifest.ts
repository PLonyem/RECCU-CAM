import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RECCU-CAM Digital Platform",
    short_name: "RECCU-CAM",
    description: "Cooperative network services, learning, and knowledge.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0D3D2E",
  };
}
