import { entrepreneursApi } from "@/lib/api/entrepreneurs";

/**
 * Where to land right after a session is established (OAuth exchange or
 * email/password login) - LinkedIn-style: entrepreneur-service auto-creates
 * a PENDING shell entrepreneur profile via Kafka the instant a user
 * registers (email or OAuth), so a brand-new user almost always has
 * *something* here, just not a finished one. Only a non-PENDING profile
 * skips straight to `fallback`; PENDING (or no profile at all yet, e.g. if
 * that Kafka event hasn't landed) goes to /onboarding instead.
 */
export async function resolvePostAuthDestination(fallback: string): Promise<string> {
  try {
    const profile = await entrepreneursApi.getMe();
    return profile.status === "PENDING" ? "/onboarding" : fallback;
  } catch {
    return "/onboarding";
  }
}
