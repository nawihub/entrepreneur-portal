"use client";

import { Suspense } from "react";
import { OAuthCallback } from "@/components/oauth-callback";
import { googleRedirectUri } from "@/lib/auth/oauth";
import { Logo } from "@/components/logo";

export default function GoogleCallbackPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-4">
      <Logo size="lg" />
      <div className="w-full max-w-md">
        <Suspense>
          <OAuthCallback provider="GOOGLE" redirectUri={googleRedirectUri()} providerLabel="Google" />
        </Suspense>
      </div>
    </div>
  );
}
