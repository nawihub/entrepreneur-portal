import { callGateway, respondWithError, respondWithSession } from "../_lib/session";

export async function POST(request: Request) {
  const body = await request.json();
  const { res, data } = await callGateway("/api/v1/auth/login", body);
  if (!res.ok) {
    return respondWithError(
      res.status,
      (data as { message?: string } | null)?.message ?? "Login failed",
    );
  }
  return respondWithSession(data ?? {}, res.status);
}
