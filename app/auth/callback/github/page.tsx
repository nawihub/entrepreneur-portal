"use client";

import { Suspense } from "react";
import { OAuthCallback } from "@/components/oauth-callback";
import { githubRedirectUri } from "@/lib/auth/oauth";
import { Logo } from "@/components/logo";

export default function GithubCallbackPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-4">
      <Logo size="lg" />
      <div className="w-full max-w-md">
        <Suspense>
          <OAuthCallback provider="GITHUB" redirectUri={githubRedirectUri()} providerLabel="GitHub" />
        </Suspense>
      </div>
    </div>
  );
}
