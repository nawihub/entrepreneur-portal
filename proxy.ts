import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge-side route guard. This only checks whether a refresh-token cookie
 * exists - it can't validate the access token (that lives in memory,
 * client-side only) or the cookie's validity server-side without another
 * round trip to the gateway. Treat this as a fast "don't even serve the
 * protected shell to an obviously logged-out visitor" redirect; the real
 * gatekeeping happens in <AuthProvider> (app/providers.tsx), which attempts
 * a silent refresh on mount and redirects to /login if that fails.
 */
const REFRESH_COOKIE = "nwh_refresh_token";

const PROTECTED_PREFIXES = [
  "/feed",
  "/profile",
  "/entrepreneurs",
  "/big-ideas",
  "/businesses",
  "/opportunities",
  "/resources",
  "/settings",
];

const AUTH_ONLY_PREFIXES = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(REFRESH_COOKIE)?.value);

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  const isAuthOnly = AUTH_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
  if (isAuthOnly && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/feed";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/feed/:path*",
    "/profile/:path*",
    "/entrepreneurs/:path*",
    "/big-ideas/:path*",
    "/businesses/:path*",
    "/opportunities/:path*",
    "/resources/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
};
