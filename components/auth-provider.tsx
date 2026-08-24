"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { decodeJwtExpiryMs } from "@/lib/auth/jwt";
import { useAuthStore } from "@/lib/store/auth-store";

// OAuthCallback (rendered on these routes) is the authoritative handler for
// establishing the session on first load there - see the race note below.
const OAUTH_CALLBACK_PREFIX = "/auth/callback";

/**
 * Mount-time silent refresh + proactive renewal scheduler.
 *
 * On first load there's no access token in memory (nothing persists it on
 * purpose - see lib/store/auth-store.ts), so this fires one silent refresh
 * against our own /api/auth/refresh-token route, which reads the httpOnly
 * refresh-token cookie server-side. If that cookie is missing/expired/
 * already-rotated, the route 401s and we land in "unauthenticated" - exactly
 * the state a first-time visitor should be in.
 *
 * It also schedules the next refresh ~60s before the current access token's
 * `exp`, so an active session never has to wait for a reactive 401 from a
 * real API call to renew.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const accessToken = useAuthStore((s) => s.accessToken);
  const clear = useAuthStore((s) => s.clear);
  const scheduledFor = useRef<number | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // The OAuth callback pages (app/auth/callback/*) run their own code
    // exchange via <OAuthCallback> and are the authoritative source of truth
    // for the session on that first load - this mount-time refresh would
    // race it. It 401s near-instantly (no refresh-token cookie exists yet,
    // pre-exchange) while the exchange itself takes a real round trip to the
    // provider, so on any slower network (or dev-server on-demand route
    // compile) this can resolve AFTER the exchange already set the session
    // and navigated to /feed, silently clearing the session that was just
    // established and bouncing back to /login. Skip it entirely here.
    if (pathname.startsWith(OAUTH_CALLBACK_PREFIX)) return;

    let cancelled = false;
    authApi
      .refresh()
      .then((session) => {
        if (cancelled) return;
        useAuthStore.getState().setSession(session.accessToken, session.user);
      })
      .catch(() => {
        if (!cancelled) clear();
      });
    return () => {
      cancelled = true;
    };
    // Only ever run once per full page load (not per client-side
    // navigation) - deliberately NOT depending on `pathname` here. This
    // provider persists across client-side route changes (it wraps the
    // root layout), so a `[]` dep array already means "once per page load";
    // adding `pathname` would re-fire this on every navigation, including
    // immediately after the OAuth callback's own router.replace("/feed"),
    // reintroducing the exact race this guard exists to prevent. Subsequent
    // refreshes are scheduled below or triggered reactively by
    // lib/api/http.ts on a 401.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    const expiryMs = decodeJwtExpiryMs(accessToken);
    if (!expiryMs) return;

    const refreshAt = expiryMs - 60_000;
    if (scheduledFor.current === refreshAt) return;
    scheduledFor.current = refreshAt;

    const delay = Math.max(refreshAt - Date.now(), 5_000);
    const timer = setTimeout(() => {
      authApi
        .refresh()
        .then((session) =>
          useAuthStore.getState().setSession(session.accessToken, session.user),
        )
        .catch(() => useAuthStore.getState().clear());
    }, delay);

    return () => clearTimeout(timer);
  }, [accessToken]);

  // Deliberately renders children immediately, even while status is still
  // "loading" - this provider wraps the WHOLE app (marketing pages included),
  // and a public landing page shouldn't block on an auth check nobody there
  // cares about yet. The protected app shell gates on status itself; see
  // <RequireAuth> in components/require-auth.tsx.
  void status;
  return <>{children}</>;
}
