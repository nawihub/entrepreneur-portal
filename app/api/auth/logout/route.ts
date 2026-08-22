import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { REFRESH_COOKIE, callGatewayWithCookieToken, clearRefreshCookie } from "../_lib/session";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (refreshToken) {
    // Best-effort - the cookie gets cleared either way so the browser is
    // logged out locally even if the gateway call fails.
    await callGatewayWithCookieToken("/api/v1/auth/logout", refreshToken).catch(
      () => null,
    );
  }

  return clearRefreshCookie(NextResponse.json({ ok: true }));
}
