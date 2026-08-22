"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileCheck2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileDropzoneProps {
  file: File | null;
  onChange: (file: File | null) => void;
  accept?: Record<string, string[]>;
  label: string;
  hint?: string;
}

/** Single-file dropzone used for the KYC ID-scan step of business
 * registration (and reusable anywhere else a file part is needed). */
export function FileDropzone({ file, onChange, accept, label, hint }: FileDropzoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onChange(accepted[0]);
    },
    [onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    multiple: false,
  });

  if (file) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 dark:border-primary-800 dark:bg-primary-900/30">
        <div className="flex items-center gap-2.5 text-sm">
          <FileCheck2 className="size-4 text-primary-600 dark:text-primary-400" />
          <span className="font-medium">{file.name}</span>
          <span className="text-muted-foreground">({Math.round(file.size / 1024)} KB)</span>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={() => onChange(null)}>
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border px-6 py-10 text-center transition-colors",
        isDragActive && "border-primary-500 bg-primary-50 dark:bg-primary-900/20",
      )}
    >
      <input {...getInputProps()} />
      <UploadCloud className="size-8 text-muted-foreground" />
      <p className="text-sm font-medium">{label}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
