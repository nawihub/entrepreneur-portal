"use client";

import Link from "next/link";
import { BadgeCheck, Sparkles, MapPin, Cake, Globe2, Mail, Phone, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileScoreRing } from "@/components/profile/profile-score-ring";
import { useOwnEntrepreneurProfile } from "@/lib/queries/entrepreneurs";
import { useAuthStore } from "@/lib/store/auth-store";
import { formatEnumLabel } from "@/lib/utils";
import { skillLabel } from "@/lib/data/skills";

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

  // No entrepreneur profile registered yet (rare - normally
  // entrepreneur-service auto-creates a PENDING shell via Kafka right after
  // registration) - point them at onboarding rather than rendering a
  // broken/empty card.
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
          <Link href="/onboarding" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-400">
            Get started
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (profile.status === "PENDING") {
    return (
      <Card className="animate-fade-in-up">
        <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
          <Avatar className="size-16">
            <AvatarImage src={profile.profilePhotoUrl ?? undefined} />
            <AvatarFallback>{profile.firstName?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-display font-semibold">{profile.firstName} {profile.lastName}</p>
            <p className="text-sm text-muted-foreground">Finish setting up your profile</p>
          </div>
          <Link href="/onboarding" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-400">
            Continue
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in-up overflow-hidden">
      <div className="h-14 bg-gradient-to-r from-primary-500 to-secondary-500" />
      <CardContent className="-mt-8 flex flex-col items-center gap-2 pt-0 text-center">
        <ProfileScoreRing score={profile.profileScore} size={72}>
          <Avatar className="size-16 border-2 border-card">
            <AvatarImage src={profile.profilePhotoUrl ?? undefined} alt={profile.firstName} />
            <AvatarFallback>{profile.firstName?.[0]}{profile.lastName?.[0]}</AvatarFallback>
          </Avatar>
        </ProfileScoreRing>

        <Link href="/profile/me" className="font-display font-semibold hover:underline">
          {profile.firstName} {profile.lastName}
        </Link>

        {profile.currentLocation && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" /> {profile.currentLocation}
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

        <div className="w-full space-y-1.5 border-t border-border pt-3 text-left text-xs text-muted-foreground">
          {profile.gender && (
            <p className="flex items-center gap-2">
              <BadgeCheck className="size-3.5 shrink-0" /> {formatEnumLabel(profile.gender)}
            </p>
          )}
          {profile.dateOfBirth && (
            <p className="flex items-center gap-2">
              <Cake className="size-3.5 shrink-0" /> {new Date(profile.dateOfBirth).toLocaleDateString()}
            </p>
          )}
          {profile.nationality && (
            <p className="flex items-center gap-2">
              <Globe2 className="size-3.5 shrink-0" /> {profile.nationality}
            </p>
          )}
          {(profile.district || profile.chiefdom) && (
            <p className="flex items-center gap-2">
              <MapPin className="size-3.5 shrink-0" />
              {[profile.district, profile.chiefdom].filter(Boolean).join(", ")}
            </p>
          )}
          {profile.contactInfo?.email && (
            <p className="flex items-center gap-2 truncate">
              <Mail className="size-3.5 shrink-0" /> <span className="truncate">{profile.contactInfo.email}</span>
            </p>
          )}
          {profile.contactInfo?.phoneNumber && (
            <p className="flex items-center gap-2">
              <Phone className="size-3.5 shrink-0" /> {profile.contactInfo.phoneNumber}
            </p>
          )}
        </div>

        {profile.skills.length > 0 && (
          <div className="w-full border-t border-border pt-3 text-left">
            <p className="mb-1.5 flex items-center gap-2 text-xs text-muted-foreground">
              <Briefcase className="size-3.5" /> Skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.slice(0, 5).map((skill) => (
                <Badge key={skill} variant="outline" className="text-[11px]">
                  {skillLabel(skill)}
                </Badge>
              ))}
              {profile.skills.length > 5 && (
                <Badge variant="outline" className="text-[11px]">
                  +{profile.skills.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
