import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NaWeHub — Entrepreneur Portal",
    short_name: "NaWeHub",
    description:
      "The professional network and funding platform for young entrepreneurs across Sierra Leone.",
    start_url: "/feed",
    scope: "/",
    display: "standalone",
    background_color: "#f7f6f2",
    theme_color: "#0e7a54",
    orientation: "portrait-primary",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/maskable-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
