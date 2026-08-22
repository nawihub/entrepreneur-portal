import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { NetworkFirst, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // GET calls to the gateway: serve from cache instantly if we're
    // offline/flaky, but always try the network first so authenticated
    // data doesn't go stale for long. Never cache mutating verbs - those
    // aren't matched by this GET-only entry.
    {
      matcher: ({ url, request }) =>
        request.method === "GET" && url.pathname.startsWith("/api/v1/"),
      handler: new NetworkFirst({
        cacheName: "nawehub-api",
        networkTimeoutSeconds: 4,
      }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
