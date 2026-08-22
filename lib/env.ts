/** Centralized, typed access to public env vars. Keep all `NEXT_PUBLIC_*`
 * reads here so there's exactly one place to check when wiring a new
 * deployment target. */
export const env = {
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
    "http://localhost:8080",
  appUrl:
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000",
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
  githubClientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID ?? "",
};
