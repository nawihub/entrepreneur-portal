import { create } from "zustand";
import type { UserInfo } from "@/lib/api/types";

/**
 * Client-side session state.
 *
 * Deliberately NOT persisted to localStorage/sessionStorage: the access
 * token only ever lives in memory (this store), and the rotating refresh
 * token never reaches browser JS at all - it's set as an httpOnly cookie by
 * our own Next.js route handlers (see app/api/auth/*) and rotated there.
 * Losing the in-memory token on a hard refresh is expected and fine: the
 * AuthProvider mount effect calls the silent-refresh route to mint a new
 * one from the cookie.
 */
interface AuthState {
  accessToken: string | null;
  user: UserInfo | null;
  status: "loading" | "authenticated" | "unauthenticated";
  setSession: (accessToken: string, user: UserInfo) => void;
  setUser: (user: UserInfo) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  status: "loading",
  setSession: (accessToken, user) =>
    set({ accessToken, user, status: "authenticated" }),
  setUser: (user) => set({ user }),
  clear: () => set({ accessToken: null, user: null, status: "unauthenticated" }),
}));

/** Non-hook accessor so the fetch client can read the current token without
 * being a React component. */
export function getAccessToken() {
  return useAuthStore.getState().accessToken;
}
