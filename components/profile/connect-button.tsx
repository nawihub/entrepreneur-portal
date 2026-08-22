"use client";

import { useState, useSyncExternalStore } from "react";
import { UserPlus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * TODO(backend): there is no connect/follow endpoint in the API catalog yet
 * (entrepreneurs domain only exposes profile CRUD - no relationship graph).
 * Rather than invent a fake REST call, this stores the "following" state
 * client-side only, per viewer + target profile id, in localStorage. Swap
 * the two functions below for real mutations against whatever endpoint
 * ships (e.g. POST/DELETE /api/v1/entrepreneurs/{id}/connections) - the
 * button UI itself shouldn't need to change.
 */
function storageKey(profileId: string) {
  return `nwh_following_${profileId}`;
}

function readFollowing(profileId: string): boolean {
  try {
    return localStorage.getItem(storageKey(profileId)) === "1";
  } catch {
    return false;
  }
}

function writeFollowing(profileId: string, value: boolean) {
  try {
    if (value) localStorage.setItem(storageKey(profileId), "1");
    else localStorage.removeItem(storageKey(profileId));
  } catch {
    // localStorage unavailable (private mode etc.) - fail silently, this is
    // a non-critical client-only affordance.
  }
}

const noopSubscribe = () => () => {};

export function ConnectButton({ profileId, name }: { profileId: string; name: string }) {
  // useSyncExternalStore (server snapshot `false`, client snapshot read from
  // localStorage) reads the persisted value without the mount-then-effect
  // dance - no synchronous setState-in-effect needed for the initial read.
  const storedFollowing = useSyncExternalStore(
    noopSubscribe,
    () => readFollowing(profileId),
    () => false,
  );
  // Toggling is a direct user action (not derived from an effect), so a
  // plain optimistic override is fine here.
  const [override, setOverride] = useState<boolean | null>(null);
  const following = override ?? storedFollowing;

  function toggle() {
    const next = !following;
    setOverride(next);
    writeFollowing(profileId, next);
    toast.success(next ? `Following ${name}` : `Unfollowed ${name}`, {
      description: "This is stored on your device only for now - there's no connections API yet.",
    });
  }

  return (
    <Button variant={following ? "outline" : "default"} onClick={toggle}>
      {following ? <UserCheck className="size-4" /> : <UserPlus className="size-4" />}
      {following ? "Following" : "Connect"}
    </Button>
  );
}
