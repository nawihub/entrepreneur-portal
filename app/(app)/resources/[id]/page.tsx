"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, BookOpen, Download, Eye, Loader2, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { BookmarkButton } from "@/components/resources/bookmark-button";
import { RatingInput, RatingSummary } from "@/components/resources/rating-stars";
import { ResourceThumbnail, formatTag, resourceKindLabel } from "@/components/resources/resource-card";
import { useRateResource, useResource } from "@/lib/queries/resources";
import { resourcesApi } from "@/lib/api/resources";
import { ApiError } from "@/lib/api/http";
import { formatFileSize } from "@/lib/utils";
import type { Resource } from "@/lib/api/types";

/** Types the browser can show in-page; anything else is download-only. */
function previewKind(mimeType: string): "pdf" | "video" | "image" | null {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("image/")) return "image";
  return null;
}

export default function ResourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: resource, isLoading, isError, error } = useResource(id);

  if (isLoading) {
    return (
      <div className="container-page py-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Skeleton className="aspect-[16/10] w-full" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (isError || !resource) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={BookOpen}
          title={notFound ? "Resource not found" : "Couldn't load this resource"}
          description={notFound ? "It may have been removed, or the link is wrong." : "Check your connection and try again."}
          action={
            <Button variant="outline" size="sm" asChild>
              <Link href="/resources">Back to resources</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return <ResourceDetail resource={resource} />;
}

function ResourceDetail({ resource }: { resource: Resource }) {
  const premium = resource.accessLevel === "PREMIUM";
  const kind = previewKind(resource.mimeType);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState<"preview" | "download" | null>(null);
  const rate = useRateResource();

  // Blob URLs hold the whole file in memory until revoked.
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  async function fetchFile(action: "preview" | "download") {
    setBusy(action);
    try {
      const blob = await resourcesApi.downloadFile(resource.id);
      const url = URL.createObjectURL(blob);
      if (action === "preview") {
        setPreviewUrl(url);
      } else {
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = resource.fileName;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      toast.error(
        err instanceof ApiError && err.status === 403
          ? "Premium resources can't be downloaded yet."
          : "Couldn't get the file. Try again in a moment.",
      );
    } finally {
      setBusy(null);
    }
  }

  function onRate(rating: number | null) {
    rate.mutate(
      { id: resource.id, rating },
      {
        onSuccess: () => toast.success(rating === null ? "Rating removed" : "Thanks for rating!"),
        onError: (err) =>
          toast.error(err instanceof ApiError && err.status === 403 ? "Premium resources can't be rated yet." : "Couldn't save your rating."),
      },
    );
  }

  return (
    <div className="container-page py-6">
      <Link href="/resources" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Resources
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <Card className="overflow-hidden">
            {previewUrl && kind === "pdf" && <iframe src={previewUrl} title={resource.title} className="h-[75vh] w-full bg-white" />}
            {previewUrl && kind === "video" && <video src={previewUrl} controls autoPlay className="aspect-video w-full bg-black" />}
            {previewUrl && kind === "image" && (
              // A local blob URL of the downloaded file - the image optimizer can't fetch it.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt={resource.title} className="max-h-[75vh] w-full object-contain" />
            )}
            {!previewUrl && (
              <div className="relative">
                <ResourceThumbnail resource={resource} />
                {kind && !premium && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button size="lg" onClick={() => fetchFile("preview")} disabled={busy !== null} className="shadow-lg">
                      {busy === "preview" ? <Loader2 className="size-4 animate-spin" /> : <Eye className="size-4" />}
                      {kind === "video" ? "Play video" : "Preview"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>

          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-400">
              {resourceKindLabel(resource)}
              {resource.featured && (
                <span className="flex items-center gap-1 rounded-full bg-secondary-100 px-2 py-0.5 normal-case tracking-normal text-secondary-800 dark:bg-secondary-900/50 dark:text-secondary-200">
                  <Sparkles className="size-3" /> Featured
                </span>
              )}
            </div>
            <h1 className="font-display text-2xl font-semibold sm:text-3xl">{resource.title}</h1>
            <RatingSummary average={resource.averageRating} count={resource.ratingCount} size="md" className="mt-2" />
            <p className="mt-4 whitespace-pre-line leading-relaxed text-foreground/90">{resource.description}</p>
            {resource.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {resource.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/resources?tags=${encodeURIComponent(tag)}`}
                    className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground hover:bg-primary-100 hover:text-primary-800 dark:hover:bg-primary-900/50 dark:hover:text-primary-200"
                  >
                    #{formatTag(tag)}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardContent className="space-y-4 pt-6">
              {premium ? (
                <div className="rounded-xl bg-secondary-50 p-4 text-sm dark:bg-secondary-900/30">
                  <p className="flex items-center gap-2 font-semibold text-secondary-800 dark:text-secondary-200">
                    <Lock className="size-4" /> Premium resource
                  </p>
                  <p className="mt-1 text-secondary-900/80 dark:text-secondary-100/80">
                    Premium resources will open once purchases are available. Save it to come back later.
                  </p>
                </div>
              ) : (
                <Button className="w-full" onClick={() => fetchFile("download")} disabled={busy !== null}>
                  {busy === "download" ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                  Download {resource.fileFormat ? resource.fileFormat.toUpperCase() : "file"}
                </Button>
              )}
              <BookmarkButton resource={resource} variant="full" className="w-full" />

              <dl className="space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">File</dt>
                  <dd className="truncate font-medium" title={resource.fileName}>{resource.fileName}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Size</dt>
                  <dd className="font-medium">{formatFileSize(resource.fileSize)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Published</dt>
                  <dd className="font-medium">{new Date(resource.createTime).toLocaleDateString(undefined, { dateStyle: "medium" })}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 pt-6">
              <p className="font-display font-semibold">{resource.myRating ? "Your rating" : "Rate this resource"}</p>
              {premium ? (
                <p className="text-sm text-muted-foreground">Premium resources can be rated once purchases are available.</p>
              ) : (
                <>
                  <RatingInput value={resource.myRating} onChange={onRate} disabled={rate.isPending} />
                  <p className="text-xs text-muted-foreground">
                    {resource.myRating ? (
                      <button type="button" onClick={() => onRate(null)} className="underline-offset-2 hover:text-foreground hover:underline">
                        Remove my rating
                      </button>
                    ) : (
                      "Help other founders find the most useful material."
                    )}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
