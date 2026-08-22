"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Trash2, Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth-store";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { theme, setTheme } = useTheme();

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const updated = await authApi.uploadProfileImage(file);
      setUser(updated);
      toast.success("Profile photo updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    try {
      const updated = await authApi.removeProfileImage();
      setUser(updated);
      toast.success("Profile photo removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't remove photo");
    }
  }

  return (
    <div className="container-page max-w-2xl py-6">
      <h1 className="mb-6 font-display text-2xl font-semibold">Settings</h1>

      <Card className="mb-4 animate-fade-in-up">
        <CardHeader>
          <CardTitle>Profile photo</CardTitle>
          <CardDescription>Shown across your NaWeHub profile and account menu.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={user?.profilePhotoUrl ?? undefined} />
            <AvatarFallback>{user?.firstName?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <Camera className="size-4" /> {uploading ? "Uploading…" : "Upload new photo"}
            </Button>
            {user?.profilePhotoUrl && (
              <Button variant="ghost" size="sm" onClick={handleRemove}>
                <Trash2 className="size-4 text-error" /> Remove
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4 animate-fade-in-up">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <Row label="Name" value={user?.displayName} />
          <Row label="Email" value={user?.email} />
          <Row label="Phone" value={user?.phone ?? "—"} />
          <Row label="Status" value={user?.status} />
        </CardContent>
      </Card>

      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose how NaWeHub looks on this device.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          {[
            { value: "light", icon: Sun, label: "Light" },
            { value: "dark", icon: Moon, label: "Dark" },
            { value: "system", icon: Monitor, label: "System" },
          ].map((option) => (
            <Button
              key={option.value}
              variant={theme === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme(option.value)}
            >
              <option.icon className="size-4" /> {option.label}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between border-b border-border py-1.5 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  );
}
