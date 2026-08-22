"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth-store";
import { consumeOAuthState } from "@/lib/auth/oauth";
import type { OAuthProvider } from "@/lib/api/types";

interface OAuthCallbackProps {
  provider: OAuthProvider;
  redirectUri: string;
  providerLabel: string;
}

/** Shared handler for both /auth/callback/google and /auth/callback/github:
 * exchange the provider's `code` for a NaWeHub session via our own gateway
 * (never trusting a client-side token), then land on the feed. */
export function OAuthCallback({ provider, redirectUri, providerLabel }: OAuthCallbackProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    // All the validation branches below run inside this async function
    // rather than as synchronous top-of-effect setState calls - they only
    // ever reach `setError` via the `.catch()` at the bottom, which runs as
    // a microtask, not synchronously during the effect's own execution.
    async function run() {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const providerError = searchParams.get("error");

      if (providerError) {
        throw new Error(`${providerLabel} sign-in was cancelled.`);
      }
      if (!code) {
        throw new Error("Missing authorization code from the provider callback.");
      }
      const expectedState = consumeOAuthState();
      if (!state || state !== expectedState) {
        throw new Error("This sign-in request could not be verified. Please try again.");
      }

      const session = await authApi.oauth({ provider, authorizationCode: code, redirectUri });
      useAuthStore.getState().setSession(session.accessToken, session.user);
      router.replace("/feed");
    }

    run().catch((err) => setError(err instanceof Error ? err.message : "Sign-in failed"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <Card className="border-border/60 shadow-lg text-center">
        <CardHeader className="items-center">
          <XCircle className="size-10 text-error" />
          <CardTitle className="mt-2">Couldn&apos;t sign you in</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/login">Back to login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 shadow-lg text-center">
      <CardHeader className="items-center">
        <Loader2 className="size-10 animate-spin text-primary-500" />
        <CardTitle className="mt-2">Finishing sign-in with {providerLabel}…</CardTitle>
      </CardHeader>
    </Card>
  );
}
