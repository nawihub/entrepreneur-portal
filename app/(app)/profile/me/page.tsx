"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useOwnEntrepreneurProfile } from "@/lib/queries/entrepreneurs";

/** /profile/me resolves the logged-in user's own entrepreneur profile (via
 * GET /api/v1/entrepreneurs/me) and forwards to wherever it's actually
 * useful to look at it: /onboarding if there's no profile yet or it's still
 * PENDING (entrepreneur-service auto-creates a PENDING shell via Kafka
 * right after registration, so this is the common case for a new user),
 * otherwise the canonical /profile/{id} view, which loads the full profile
 * plus journeys and ventures by that id. */
export default function MyProfilePage() {
  const router = useRouter();
  const { data: profile, isLoading, isError } = useOwnEntrepreneurProfile();

  useEffect(() => {
    if (isLoading) return;
    if (isError || !profile || profile.status === "PENDING") {
      router.replace("/onboarding");
      return;
    }
    router.replace(`/profile/${profile.id}`);
  }, [profile, isLoading, isError, router]);

  return (
    <div className="container-page flex justify-center py-16">
      <div className="size-8 animate-spin-slow rounded-full border-2 border-primary-500 border-t-transparent" />
    </div>
  );
}
