import { callGateway, respondWithError, respondWithSession } from "../_lib/session";

export async function POST(request: Request) {
  const body = await request.json();
  const { res, data } = await callGateway("/api/v1/auth/oauth", body);
  if (!res.ok) {
    return respondWithError(
      res.status,
      (data as { message?: string } | null)?.message ?? "OAuth sign-in failed",
    );
  }
  return await respondWithSession(data ?? {}, res.status);
}
