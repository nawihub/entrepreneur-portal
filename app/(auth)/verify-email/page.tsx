"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authApi } from "@/lib/api/auth";

type State = "verifying" | "success" | "error";

function VerifyEmailContent() {
  const token = useSearchParams().get("token");
  // Missing token is a render-time-derivable fact, not something to
  // discover inside an effect - computing the initial state straight from
  // `token` avoids a synchronous setState as the first thing the effect
  // below does.
  const [state, setState] = useState<State>(token ? "verifying" : "error");

  useEffect(() => {
    if (!token) return;
    authApi
      .verifyEmail(token)
      .then(() => setState("success"))
      .catch(() => setState("error"));
  }, [token]);

  return (
    <Card className="border-border/60 shadow-lg text-center">
      <CardHeader className="items-center">
        {state === "verifying" && <Loader2 className="size-10 animate-spin text-primary-500" />}
        {state === "success" && <CheckCircle2 className="size-10 text-success" />}
        {state === "error" && <XCircle className="size-10 text-error" />}
        <CardTitle className="mt-2">
          {state === "verifying" && "Verifying your email…"}
          {state === "success" && "Email verified"}
          {state === "error" && "Verification failed"}
        </CardTitle>
        <CardDescription>
          {state === "success" && "You're all set. Log in to continue building on NaWeHub."}
          {state === "error" &&
            "This link is invalid or has expired. Try logging in - you may already be verified, or you can request a new link."}
        </CardDescription>
      </CardHeader>
      {state !== "verifying" && (
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/login">Go to login</Link>
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
