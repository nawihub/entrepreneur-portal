import { NextResponse } from "next/server";
import { env } from "@/lib/env";

/**
 * BFF-lite token relay.
 *
 * web-api-gateway hands back {accessToken, refreshToken, user} in the JSON
 * body for every session-issuing call. Client-side JS never sees the
 * refresh token: these route handlers are the only code that reads/writes
 * it, storing it as an httpOnly cookie so an XSS bug in the SPA can't
 * exfiltrate a 7-day credential. The short-lived (~15 min) access token IS
 * returned to the client JSON body, to be kept in memory only (see
 * lib/store/auth-store.ts) - losing it on a hard refresh is fine, since
 * that just triggers one silent-refresh round trip.
 */

export const REFRESH_COOKIE = "nwh_refresh_token";
const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days, matches auth-service

interface GatewaySession {
  accessToken?: string;
  refreshToken?: string;
  user?: unknown;
  [key: string]: unknown;
}

export async function callGateway(path: string, body?: unknown) {
  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json().catch(() => null)) as GatewaySession | null;
  return { res, data };
}

/** Gateway calls that need the caller's own refresh token attached
 * (refresh, logout) - read from the httpOnly cookie, never from the
 * request body the browser sent us. */
export async function callGatewayWithCookieToken(
  path: string,
  refreshToken: string,
  extraBody?: Record<string, unknown>,
) {
  return callGateway(path, { refreshToken, ...extraBody });
}

/** Build the client-facing response: strip the refresh token out of the
 * body, set it as an httpOnly cookie instead. */
export function respondWithSession(data: GatewaySession, status = 200) {
  const { accessToken, refreshToken, user, ...rest } = data;

  if (!accessToken || !refreshToken) {
    // No session issued (e.g. registration pending email verification) -
    // pass the gateway body through unchanged, there's no token to guard.
    return NextResponse.json({ user, ...rest }, { status });
  }

  const response = NextResponse.json({ accessToken, user, ...rest }, { status });
  response.cookies.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: REFRESH_TOKEN_TTL_SECONDS,
  });
  return response;
}

export function respondWithError(status: number, message: string) {
  return NextResponse.json({ message }, { status });
}

export function clearRefreshCookie(response: NextResponse) {
  response.cookies.set(REFRESH_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 0,
  });
  return response;
}
