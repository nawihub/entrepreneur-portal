import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // The gateway/storage-service host isn't known yet for this env (no
      // live deployment reachable while this project was scaffolded) - kept
      // wide open for local dev. Tighten this to the real storage/CDN
      // hostname(s) before shipping to production.
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
};

// @serwist/next registers a webpack() customizer on the Next config to
// compile app/sw.ts, which is incompatible with Turbopack (`next dev`
// defaults to Turbopack as of Next 16, and having any webpack customizer
// present makes it refuse to start). Service-worker caching only matters
// for a production build anyway, so only construct/apply the Serwist
// wrapper outside of `next dev` - dev gets a plain, Turbopack-friendly
// config with no PWA caching, prod/build get the real one via
// `next build --webpack` (see the "build" script in package.json).
export default process.env.NODE_ENV === "development"
  ? nextConfig
  : withSerwistInit({ swSrc: "app/sw.ts", swDest: "public/sw.js" })(nextConfig);
