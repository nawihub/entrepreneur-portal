"use client";

import { useEffect, useRef } from "react";
import { authApi } from "@/lib/api/auth";
import { decodeJwtExpiryMs } from "@/lib/auth/jwt";
import { useAuthStore } from "@/lib/store/auth-store";

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

  useEffect(() => {
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
    // Only ever run once on mount - subsequent refreshes are scheduled below
    // or triggered reactively by lib/api/http.ts on a 401.
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
