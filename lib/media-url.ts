import { env } from "@/lib/env";

/**
 * The gateway returns media URLs (e.g. resource thumbnails) as paths on itself, such as
 * "/api/v1/storage/{bucket}/{object}" - make them absolute so they load from the gateway
 * rather than this app's own origin. Absolute URLs are returned unchanged.
 */
export function resolveMediaUrl(url: string | null | undefined) {
  if (!url) return null;
  return url.startsWith("/") ? `${env.apiBaseUrl}${url}` : url;
}
