import { api } from "@/lib/api/http";
import type {
  ClientSession,
  LoginPayload,
  OAuthPayload,
  RegisterPayload,
  UserInfo,
} from "@/lib/api/types";

/**
 * Auth calls come in two flavors:
 *
 * 1. Session-issuing calls (register/login/oauth/refresh/logout) go through
 *    OUR OWN Next.js route handlers under app/api/auth/*, not straight to
 *    the gateway. Those routes are the only place the rotating refresh
 *    token ever exists as plain text - they set/clear it as an httpOnly
 *    cookie and hand the client back only the short-lived access token +
 *    user. See the route.ts files under app/api/auth for the actual gateway calls.
 * 2. Everything else (forgot/reset password, verify-email, self,
 *    profile-image) doesn't mint a refresh token, so it's safe to call the
 *    gateway directly with the in-memory access token.
 */

async function bff<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message ?? `${path} failed with ${res.status}`);
  }
  return data as T;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    bff<ClientSession | { user: UserInfo; requiresVerification: true }>(
      "/api/auth/register",
      payload,
    ),

  login: (payload: LoginPayload) =>
    bff<ClientSession>("/api/auth/login", payload),

  oauth: (payload: OAuthPayload) =>
    bff<ClientSession>("/api/auth/oauth", payload),

  refresh: () => bff<ClientSession>("/api/auth/refresh-token"),

  logout: () => bff<{ ok: true }>("/api/auth/logout"),

  forgotPassword: (email: string) =>
    api.post<void>("/api/v1/auth/forgot-password", { email }, { auth: false }),

  resetPassword: (token: string, newPassword: string) =>
    api.post<void>(
      "/api/v1/auth/reset-password",
      { token, newPassword },
      { auth: false },
    ),

  verifyEmail: (token: string) =>
    api.get<void>("/api/v1/auth/verify-email", {
      query: { token },
      auth: false,
    }),

  self: () => api.get<UserInfo>("/api/v1/auth/self"),

  uploadProfileImage: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.upload<UserInfo>("/api/v1/auth/profile-image", form);
  },

  removeProfileImage: () => api.delete<UserInfo>("/api/v1/auth/profile-image"),
};
