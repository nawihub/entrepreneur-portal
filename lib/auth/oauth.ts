import { env } from "@/lib/env";

const STATE_KEY = "nwh_oauth_state";

/** CSRF guard for the authorization-code redirect round trip: generate a
 * random `state`, stash it in sessionStorage before leaving for the
 * provider, and require it to match on the way back in the callback route. */
export function createOAuthState(): string {
  const state =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  sessionStorage.setItem(STATE_KEY, state);
  return state;
}

export function consumeOAuthState(): string | null {
  const stored = sessionStorage.getItem(STATE_KEY);
  sessionStorage.removeItem(STATE_KEY);
  return stored;
}

export function googleRedirectUri() {
  return `${env.appUrl}/auth/callback/google`;
}

export function githubRedirectUri() {
  return `${env.appUrl}/auth/callback/github`;
}

export function buildGoogleAuthUrl(): string {
  const state = createOAuthState();
  const params = new URLSearchParams({
    client_id: env.googleClientId,
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function buildGithubAuthUrl(): string {
  const state = createOAuthState();
  const params = new URLSearchParams({
    client_id: env.githubClientId,
    redirect_uri: githubRedirectUri(),
    scope: "read:user user:email",
    state,
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}
