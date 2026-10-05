"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, UploadCloud } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { formatSize } from "@/components/competitions/phase";
import type { CompetitionQuestion, StoredFile } from "@/lib/api/competitions";
import { cn } from "@/lib/utils";

export interface AnswerValue { text: string; choices: string[] }

/** One of the competition's own questions, rendered for its answer type. */
export function QuestionField({ q, value, onChange, disabled, index }: {
  q: CompetitionQuestion; value: AnswerValue; onChange: (v: AnswerValue) => void; disabled?: boolean; index: number;
}) {
  const id = `q-${q.id}`;
  const label = (
    <Label htmlFor={q.type === "SHORT_TEXT" || q.type === "LONG_TEXT" ? id : undefined} className="text-sm font-medium">
      {index + 1}. {q.prompt}{q.required && <span className="text-error"> *</span>}
    </Label>
  );
  return (
    <fieldset className="space-y-2" disabled={disabled}>
      {q.type === "SHORT_TEXT" || q.type === "LONG_TEXT" ? label : <legend className="mb-2">{label}</legend>}
      {q.helpText && <p className="text-xs text-muted-foreground">{q.helpText}</p>}
      {q.type === "SHORT_TEXT" && (
        <Input id={id} value={value.text} maxLength={300} onChange={(e) => onChange({ text: e.target.value, choices: [] })} />
      )}
      {q.type === "LONG_TEXT" && (
        <Textarea id={id} rows={4} value={value.text} maxLength={5000} onChange={(e) => onChange({ text: e.target.value, choices: [] })} />
      )}
      {(q.type === "SINGLE_CHOICE" || q.type === "YES_NO") && (
        <RadioGroup value={value.choices[0] ?? ""} onValueChange={(v) => onChange({ text: "", choices: [v] })}
          className={cn("grid gap-2", q.type === "YES_NO" ? "grid-cols-2 sm:max-w-xs" : "sm:grid-cols-2")}>
          {(q.type === "YES_NO" ? ["YES", "NO"] : q.options).map((o) => (
            <label key={o} className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50 has-[[data-state=checked]]:border-primary-400 has-[[data-state=checked]]:bg-primary-500/5">
              <RadioGroupItem value={o} />
              {o === "YES" ? "Yes" : o === "NO" ? "No" : o}
            </label>
          ))}
        </RadioGroup>
      )}
      {q.type === "MULTIPLE_CHOICE" && (
        <div className="grid gap-2 sm:grid-cols-2">
          {q.options.map((o) => {
            const on = value.choices.includes(o);
            return (
              <label key={o} className={cn("flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50",
                on ? "border-primary-400 bg-primary-500/5" : "border-border")}>
                <Checkbox checked={on} onCheckedChange={(c) => onChange({ text: "", choices: c ? [...value.choices, o] : value.choices.filter((x) => x !== o) })} />
                {o}
              </label>
            );
          })}
        </div>
      )}
    </fieldset>
  );
}

/**
 * Picks and uploads one file, with progress. {@code current} is what's stored now; picking a new
 * file replaces it.
 */
export function FileUploader({ current, accept, hint, maxBytes, kindLabel, disabled, validate, onUpload }: {
  current: StoredFile | null;
  accept: string;
  hint: string;
  maxBytes: number;
  kindLabel: string;
  disabled?: boolean;
  /** Extra checks before uploading; resolves to an error message, or null when the file is fine. */
  validate?: (file: File) => Promise<string | null>;
  onUpload: (file: File, onProgress: (f: number) => void) => Promise<unknown>;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  async function pick(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (file.size > maxBytes) {
      setError(`That file is ${formatSize(file.size)} - the limit is ${formatSize(maxBytes)}.`);
      return;
    }
    const problem = validate ? await validate(file) : null;
    if (problem) {
      setError(problem);
      if (input.current) input.current.value = "";
      return;
    }
    setProgress(0);
    try {
      await onUpload(file, setProgress);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setProgress(null);
      if (input.current) input.current.value = "";
    }
  }

  const uploading = progress !== null;
  return (
    <div className="space-y-2">
      {current && !uploading && (
        <div className="flex items-center gap-3 rounded-xl border border-primary-200 bg-primary-50 px-3 py-2.5 dark:border-primary-800 dark:bg-primary-900/30">
          <FileText className="size-5 shrink-0 text-primary-600 dark:text-primary-400" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{current.fileName}</span>
            <span className="text-xs text-muted-foreground">{formatSize(current.size)}</span>
          </span>
        </div>
      )}
      {uploading ? (
        <div className="rounded-xl border border-border p-4" role="status" aria-live="polite">
          <p className="mb-2 flex items-center gap-2 text-sm"><Loader2 className="size-4 animate-spin" /> Uploading {kindLabel}… {Math.round((progress ?? 0) * 100)}%</p>
          <Progress value={Math.round((progress ?? 0) * 100)} />
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => input.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files[0]); }}
          className={cn("flex w-full flex-col items-center gap-1.5 rounded-xl border-2 border-dashed p-5 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-60",
            dragging ? "border-primary-400 bg-primary-500/5" : "border-border hover:border-primary-300 hover:bg-muted/40")}
        >
          <UploadCloud className="size-6 text-muted-foreground" />
          <span className="text-sm font-medium">{current ? `Replace ${kindLabel}` : `Upload ${kindLabel}`}</span>
          <span className="text-xs text-muted-foreground">{hint}</span>
        </button>
      )}
      <input ref={input} type="file" accept={accept} hidden onChange={(e) => pick(e.target.files?.[0])} aria-label={`Choose ${kindLabel}`} />
      {error && <p role="alert" className="text-sm text-error">{error}</p>}
    </div>
  );
}

/** Small helper for the "what's missing" checklist before submitting. */
export function Checklist({ items }: { items: { label: string; done: boolean }[] }) {
  return (
    <ul className="space-y-1.5 text-sm">
      {items.map((i) => (
        <li key={i.label} className={cn("flex items-center gap-2", i.done ? "text-success" : "text-muted-foreground")}>
          <span className={cn("flex size-4 items-center justify-center rounded-full border text-[10px]", i.done ? "border-success bg-success text-white" : "border-muted-foreground/50")}>
            {i.done ? "✓" : ""}
          </span>
          {i.label}
        </li>
      ))}
    </ul>
  );
}


/**
 * A video file's length in seconds, read by the browser, or null if it can't tell (unusual
 * codecs) - in which case the upload goes ahead rather than blocking the entrepreneur.
 */
export function videoDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    const done = (value: number | null) => { URL.revokeObjectURL(url); resolve(value); };
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      if (Number.isFinite(video.duration)) return done(video.duration);
      // Some recordings (e.g. browser-made WebM) report Infinity until seeked to the end.
      video.ontimeupdate = () => { video.ontimeupdate = null; done(Number.isFinite(video.duration) ? video.duration : null); };
      video.currentTime = Number.MAX_SAFE_INTEGER;
    };
    video.onerror = () => done(null);
    setTimeout(() => done(null), 10_000);
    video.src = url;
  });
}
