"use client";

import { use, useState } from "react";
import { toast } from "sonner";
import { BookOpen, Download, Folder, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { useResource } from "@/lib/queries/resources";
import { downloadStorageObject } from "@/lib/api/storage";

export default function ResourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: resource, isLoading, isError } = useResource(id);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="container-page max-w-2xl py-6">
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (isError || !resource) {
    return (
      <div className="container-page py-16">
        <EmptyState icon={BookOpen} title="Resource not found" />
      </div>
    );
  }

  async function handleDownload(bucketName: string, objectName: string, fileName: string) {
    setDownloadingId(objectName);
    try {
      await downloadStorageObject(bucketName, objectName, fileName);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="container-page max-w-2xl py-6">
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-2xl">{resource.title}</CardTitle>
          <div className="flex flex-wrap gap-2 pt-1 text-xs text-muted-foreground">
            {resource.category && <span className="rounded-full bg-muted px-2.5 py-0.5">{resource.category}</span>}
            {resource.folder && (
              <span className="flex items-center gap-1">
                <Folder className="size-3" /> {resource.folder}
              </span>
            )}
            {resource.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1">
                <Tag className="size-3" /> {tag}
              </span>
            ))}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {resource.description && <p className="text-sm leading-relaxed">{resource.description}</p>}

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Attachments</p>
            {resource.attachments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No files attached.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {resource.attachments.map((attachment) => (
                  <div
                    key={attachment.objectName}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{attachment.fileName}</p>
                      {attachment.sizeBytes && (
                        <p className="text-xs text-muted-foreground">{Math.round(attachment.sizeBytes / 1024)} KB</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={downloadingId === attachment.objectName}
                      onClick={() => handleDownload(attachment.bucketName, attachment.objectName, attachment.fileName)}
                    >
                      <Download className="size-4" />
                      {downloadingId === attachment.objectName ? "Downloading…" : "Download"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
