"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authApi } from "@/lib/api/auth";

const schema = z.object({ email: z.string().email("Enter a valid email address") });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      // The gateway always returns the same generic response here whether
      // or not the account exists (no account enumeration) - so we show the
      // same success state unconditionally too.
      await authApi.forgotPassword(values.email);
    } finally {
      setSubmitting(false);
      setSent(true);
    }
  }

  return (
    <Card className="border-border/60 shadow-lg">
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>
          {sent
            ? "If an account exists for that email, a reset link is on its way."
            : "Enter your email and we'll send you a reset link."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {!sent && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register("email")} />
              {errors.email && <p className="text-xs text-error">{errors.email.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        )}
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary-600 hover:underline dark:text-primary-400">
            Back to login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
