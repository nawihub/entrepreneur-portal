"use client";

import Link from "next/link";
import { BadgeCheck, Sparkles, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileScoreRing } from "@/components/profile/profile-score-ring";
import { useOwnEntrepreneurProfile } from "@/lib/queries/entrepreneurs";
import { useAuthStore } from "@/lib/store/auth-store";

export function LeftRail() {
  const user = useAuthStore((s) => s.user);
  const { data: profile, isLoading, isError } = useOwnEntrepreneurProfile();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 pt-6">
          <Skeleton className="size-16 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </CardContent>
      </Card>
    );
  }

  // No entrepreneur profile registered yet - point them at creating one
  // rather than rendering a broken/empty card.
  if (isError || !profile) {
    return (
      <Card className="animate-fade-in-up">
        <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
          <Avatar className="size-16">
            <AvatarImage src={user?.profilePhotoUrl ?? undefined} />
            <AvatarFallback>{user?.firstName?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-display font-semibold">{user?.displayName}</p>
            <p className="text-sm text-muted-foreground">Set up your entrepreneur profile</p>
          </div>
          <Link href="/profile/me" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-400">
            Get started
          </Link>
        </CardContent>
      </Card>
    );
  }

  const { identity } = profile;

  return (
    <Card className="animate-fade-in-up overflow-hidden">
      <div className="h-14 bg-gradient-to-r from-primary-500 to-secondary-500" />
      <CardContent className="-mt-8 flex flex-col items-center gap-2 pt-0 text-center">
        <ProfileScoreRing score={profile.profileScore} size={72}>
          <Avatar className="size-16 border-2 border-card">
            <AvatarImage src={identity.profilePhotoUrl ?? undefined} alt={identity.firstName} />
            <AvatarFallback>{identity.firstName?.[0]}{identity.lastName?.[0]}</AvatarFallback>
          </Avatar>
        </ProfileScoreRing>

        <Link href="/profile/me" className="font-display font-semibold hover:underline">
          {identity.firstName} {identity.lastName}
        </Link>

        {identity.currentLocation && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" /> {identity.currentLocation}
          </p>
        )}

        {(profile.vetted || profile.featured) && (
          <div className="flex flex-wrap justify-center gap-1.5 pt-1">
            {profile.vetted && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2 py-0.5 text-[11px] font-medium text-primary-800 dark:bg-primary-900/50 dark:text-primary-300">
                <BadgeCheck className="size-3" /> Vetted
              </span>
            )}
            {profile.featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary-100 px-2 py-0.5 text-[11px] font-medium text-secondary-800 dark:bg-secondary-900/50 dark:text-secondary-300">
                <Sparkles className="size-3" /> Featured
              </span>
            )}
          </div>
        )}

        <p className="w-full pt-2 text-left text-xs text-muted-foreground">
          Profile strength
          <span className="float-right font-medium text-foreground">{profile.profileScore}%</span>
        </p>
      </CardContent>
    </Card>
  );
}
