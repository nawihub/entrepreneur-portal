"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOwnEntrepreneurProfile, useRegisterEntrepreneur } from "@/lib/queries/entrepreneurs";
import { useAuthStore } from "@/lib/store/auth-store";

/** /profile/me resolves the logged-in user's own entrepreneur id (via
 * GET /by-user/{userId}, per the brief) and forwards to the canonical
 * /profile/{id} route. If no entrepreneur profile exists yet, this doubles
 * as the "register as an entrepreneur" entry point instead of a 404. */
export default function MyProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: profile, isLoading, isError } = useOwnEntrepreneurProfile();
  const registerMutation = useRegisterEntrepreneur();
  const [district, setDistrict] = useState("");

  useEffect(() => {
    if (profile) router.replace(`/profile/${profile.id}`);
  }, [profile, router]);

  if (isLoading || profile) {
    return (
      <div className="container-page flex justify-center py-16">
        <div className="size-8 animate-spin-slow rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!isError) return null;

  return (
    <div className="container-page flex justify-center py-16">
      <Card className="w-full max-w-md animate-fade-in-up">
        <CardHeader className="items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">
            <UserPlus className="size-6" />
          </div>
          <CardTitle>Set up your entrepreneur profile</CardTitle>
          <CardDescription>
            This is your public professional profile - story, skills, ventures, and funding ask.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="district">Current district (optional)</Label>
            <Input
              id="district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Western Area Urban"
            />
          </div>
          <Button
            className="w-full"
            disabled={!user || registerMutation.isPending}
            onClick={() =>
              user &&
              registerMutation.mutate(
                { firstName: user.firstName, lastName: user.lastName, district: district || undefined },
                { onSuccess: (created) => router.replace(`/profile/${created.id}`) },
              )
            }
          >
            {registerMutation.isPending ? "Setting up…" : "Create my profile"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
