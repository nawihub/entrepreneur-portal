"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";

/**
 * Client-side gate for the post-login app shell. `middleware.ts` already
 * redirects at the edge when the refresh-token cookie is entirely absent,
 * but it can't tell a merely-expired/already-rotated cookie from a valid
 * one - that only comes back from the silent-refresh call AuthProvider
 * fires on mount. This is the second half of that guard: once the refresh
 * attempt resolves to "unauthenticated", bounce to /login.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname]);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 animate-fade-in-up">
          <div className="size-8 animate-spin-slow rounded-full border-2 border-primary-500 border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading NaWeHub…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
