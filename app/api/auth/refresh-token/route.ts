import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  REFRESH_COOKIE,
  callGatewayWithCookieToken,
  clearRefreshCookie,
  respondWithSession,
} from "../_lib/session";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: "No session" }, { status: 401 });
  }

  const { res, data } = await callGatewayWithCookieToken(
    "/api/v1/auth/refresh-token",
    refreshToken,
  );

  if (!res.ok) {
    // Server-side reuse-detection revoked the whole session (or it simply
    // expired) - never retry with the same token, just force a fresh login.
    return clearRefreshCookie(
      NextResponse.json({ message: "Session expired" }, { status: 401 }),
    );
  }

  return await respondWithSession(data ?? {}, res.status);
}
