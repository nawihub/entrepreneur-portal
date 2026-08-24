"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { GithubGlyph } from "@/components/icons/brand-glyphs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth-store";
import { buildGithubAuthUrl, buildGoogleAuthUrl } from "@/lib/auth/oauth";
import { resolvePostAuthDestination } from "@/lib/auth/post-auth-redirect";
import { GoogleGlyph } from "@/components/icons/google-glyph";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Only honor an explicit ?next= (a deep link that bounced through
  // /login) - the default landing spot still needs to go through
  // resolvePostAuthDestination so a still-onboarding user lands on
  // /onboarding instead of unconditionally /feed.
  const explicitNext = searchParams.get("next");
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const session = await authApi.login(values);
      useAuthStore.getState().setSession(session.accessToken, session.user);
      router.replace(explicitNext ?? (await resolvePostAuthDestination("/feed")));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="border-border/60 shadow-lg">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Log in to keep building your venture.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => (window.location.href = buildGoogleAuthUrl())}
          >
            <GoogleGlyph className="size-4" /> Google
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => (window.location.href = buildGithubAuthUrl())}
          >
            <GithubGlyph className="size-4" /> GitHub
          </Button>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or continue with email
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email && <p className="text-xs text-error">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-xs font-medium text-primary-600 hover:underline dark:text-primary-400">
                Forgot password?
              </Link>
            </div>
            <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
            {errors.password && <p className="text-xs text-error">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Logging in…" : "Log in"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          New to NaWeHub?{" "}
          <Link href="/register" className="font-medium text-primary-600 hover:underline dark:text-primary-400">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
