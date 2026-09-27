import { env } from "@/lib/env";

/**
 * The gateway returns media URLs (fliers, avatars, resource thumbnails) as paths on itself,
 * such as "/api/v1/opportunities/{id}/flier" - make them absolute so they load from the
 * gateway rather than this app's own origin. Absolute URLs (e.g. OAuth avatars) are
 * returned unchanged.
 */
export function resolveMediaUrl(url: string | null | undefined) {
  if (!url) return null;
  return url.startsWith("/") ? `${env.apiBaseUrl}${url}` : url;
}
