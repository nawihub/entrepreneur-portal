"use client";

import { use, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Paperclip, Trash2, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { useBigIdea, useBigIdeaModeration, useDeleteBigIdea } from "@/lib/queries/big-ideas";
import { bigIdeasApi } from "@/lib/api/big-ideas";
import { useQueryClient } from "@tanstack/react-query";
import { bigIdeaKeys } from "@/lib/queries/big-ideas";

export default function BigIdeaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: idea, isLoading, isError } = useBigIdea(id);
  const moderation = useBigIdeaModeration(id);
  const deleteMutation = useDeleteBigIdea();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isLoading) {
    return (
      <div className="container-page max-w-3xl py-6">
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (isError || !idea) {
    return (
      <div className="container-page py-16">
        <EmptyState icon={Lightbulb} title="Big Idea not found" />
      </div>
    );
  }

  async function handleUpload(file: File) {
    try {
      await bigIdeasApi.addSupportingMaterial(id, file);
      await queryClient.invalidateQueries({ queryKey: bigIdeaKeys.detail(id) });
      toast.success("Supporting material uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  }

  return (
    <div className="container-page max-w-3xl py-6">
      <Card className="animate-fade-in-up">
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <StatusBadge status={idea.status} />
              {idea.category && <span className="text-xs text-muted-foreground">{idea.category}</span>}
            </div>
            <CardTitle className="text-2xl">{idea.title}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              deleteMutation.mutate(id, {
                onSuccess: () => {
                  toast.success("Idea deleted");
                  router.replace("/big-ideas");
                },
                onError: () => toast.error("Couldn't delete"),
              })
            }
          >
            <Trash2 className="size-4 text-error" />
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed">{idea.summary}</p>
          {idea.problem && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Problem</p>
              <p className="text-sm">{idea.problem}</p>
            </div>
          )}
          {idea.solution && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Solution</p>
              <p className="text-sm">{idea.solution}</p>
            </div>
          )}
          {idea.reviewNote && (
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="mb-1 font-medium">Review note</p>
              <p className="text-muted-foreground">{idea.reviewNote}</p>
            </div>
          )}

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Supporting material
            </p>
            {idea.supportingMaterialUrls?.length ? (
              <ul className="flex flex-col gap-1">
                {idea.supportingMaterialUrls.map((url) => (
                  <li key={url}>
                    <a href={url} target="_blank" rel="noreferrer" className="text-sm text-primary-600 hover:underline dark:text-primary-400">
                      {url.split("/").pop()}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">None attached yet.</p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            />
            <Button variant="outline" size="sm" className="mt-2" onClick={() => fileInputRef.current?.click()}>
              <Paperclip className="size-4" /> Attach file
            </Button>
          </div>

          {/* TODO(backend): UserInfo has no role field in the API catalog, so
              there's no way to check "is this viewer actually a moderator"
              client-side yet. These actions are left visible to any logged-in
              user rather than hidden behind a guess at a role system - gate
              this properly once the gateway exposes roles/permissions. */}
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Button variant="outline" size="sm" onClick={() => moderation.review.mutate(undefined, { onError: () => toast.error("Failed") })}>
              Mark in review
            </Button>
            <Button size="sm" onClick={() => moderation.approve.mutate(undefined, { onError: () => toast.error("Failed") })}>
              Approve
            </Button>
            <Button variant="destructive" size="sm" onClick={() => moderation.decline.mutate(undefined, { onError: () => toast.error("Failed") })}>
              Decline
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
