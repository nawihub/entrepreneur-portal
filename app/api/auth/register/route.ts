import { callGateway, respondWithError, respondWithSession } from "../_lib/session";

export async function POST(request: Request) {
  const body = await request.json();
  const { res, data } = await callGateway("/api/v1/auth/register", body);
  if (!res.ok) {
    return respondWithError(
      res.status,
      (data as { message?: string } | null)?.message ?? "Registration failed",
    );
  }
  // Some auth flows require email verification before a session is issued -
  // respondWithSession already degrades gracefully to a token-less
  // {user, ...} body when the gateway doesn't include accessToken/refreshToken.
  return await respondWithSession(data ?? {}, res.status);
}
