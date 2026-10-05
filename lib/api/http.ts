import { env } from "@/lib/env";
import { useAuthStore, getAccessToken } from "@/lib/store/auth-store";
import type { ApiErrorBody } from "@/lib/api/types";

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody | null;

  constructor(status: number, body: ApiErrorBody | null, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/** Serialized so concurrent 401s trigger exactly one refresh call, and every
 * caller waiting on it gets the same result. */
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch("/api/auth/refresh-token", {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) {
          useAuthStore.getState().clear();
          return null;
        }
        const data = await res.json();
        useAuthStore.getState().setSession(data.accessToken, data.user);
        return data.accessToken as string;
      } catch {
        useAuthStore.getState().clear();
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  /** Pass a FormData instance directly for multipart uploads - the
   * Content-Type (with boundary) is left for the browser to set. */
  form?: FormData;
  /** Arrays are sent comma-separated, which Spring binds to List<String>; empty ones are omitted. */
  query?: Record<string, string | string[] | number | boolean | undefined | null>;
  /** Skip attaching a bearer token / retrying on 401 - for the handful of
   * public gateway endpoints. */
  auth?: boolean;
  signal?: AbortSignal;
  /** Overrides the default 15s timeout, e.g. for large file downloads. */
  timeoutMs?: number;
  /** Return the raw body as a Blob (file downloads) instead of parsed JSON/text. */
  responseType?: "json" | "blob";
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(
    path.startsWith("http") ? path : `${env.apiBaseUrl}${path}`,
  );
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (Array.isArray(value)) {
        if (value.length) url.searchParams.set(key, value.join(","));
      } else if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function parseBody(res: Response) {
  const contentType = res.headers.get("content-type") ?? "";
  if (res.status === 204) return null;
  if (contentType.includes("application/json")) {
    return res.json().catch(() => null);
  }
  return res.text().catch(() => null);
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
  isRetry = false,
): Promise<T> {
  const { method = "GET", body, form, query, auth = true, signal, timeoutMs = 15_000, responseType = "json" } = options;

  const headers: Record<string, string> = {};
  let payload: BodyInit | undefined;

  if (form) {
    payload = form;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  // Every call gets a default timeout so a hung backend/network/service-worker
  // never leaves a caller's isLoading stuck true forever - a real request that
  // times out here still rejects and settles the query, just as an error
  // instead of an infinite spinner. Callers that pass their own `signal`
  // (e.g. to cancel on unmount) keep full control instead.
  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: payload,
      signal: signal ?? AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "TimeoutError") {
      throw new ApiError(0, null, `Request to ${path} timed out`);
    }
    throw err;
  }

  if (res.status === 401 && auth && !isRetry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return request<T>(path, options, true);
    }
  }

  if (!res.ok) {
    const parsed = (await parseBody(res)) as ApiErrorBody | string | null;
    const errBody =
      parsed && typeof parsed === "object" ? (parsed as ApiErrorBody) : null;
    const message =
      errBody?.message ??
      errBody?.detail ??
      errBody?.title ??
      (typeof parsed === "string" ? parsed : undefined) ??
      `Request to ${path} failed with ${res.status}`;
    throw new ApiError(res.status, errBody, message);
  }

  if (responseType === "blob") {
    return (await res.blob()) as T;
  }
  return (await parseBody(res)) as T;
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body" | "form">) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "PUT", body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "DELETE" }),
  blob: (path: string, options?: Omit<RequestOptions, "method" | "body" | "form" | "responseType">) =>
    request<Blob>(path, { ...options, method: "GET", responseType: "blob" }),
  upload: <T>(path: string, form: FormData, options?: Omit<RequestOptions, "method" | "form" | "body">) =>
    request<T>(path, { ...options, method: "POST", form }),
};

/**
 * Multipart upload with progress, for large files (e.g. pitch videos) - fetch can't report upload
 * progress. Same auth and one-retry-after-refresh behaviour as {@link api}; no timeout, since a big
 * file on a slow connection legitimately takes a while.
 */
export function uploadWithProgress<T>(
  path: string,
  form: FormData,
  { query, onProgress, signal }: { query?: RequestOptions["query"]; onProgress?: (fraction: number) => void; signal?: AbortSignal } = {},
): Promise<T> {
  const send = (token: string | null) =>
    new Promise<{ status: number; body: unknown }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", buildUrl(path, query));
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress?.(e.loaded / e.total); };
      xhr.onload = () => {
        let body: unknown = xhr.responseText;
        try { body = xhr.responseText ? JSON.parse(xhr.responseText) : null; } catch { /* not JSON */ }
        resolve({ status: xhr.status, body });
      };
      xhr.onerror = () => reject(new ApiError(0, null, "Upload failed - check your connection and try again"));
      xhr.onabort = () => reject(new ApiError(0, null, "Upload cancelled"));
      signal?.addEventListener("abort", () => xhr.abort(), { once: true });
      xhr.send(form);
    });

  return (async () => {
    let res = await send(getAccessToken());
    if (res.status === 401) {
      const token = await refreshAccessToken();
      if (token) res = await send(token);
    }
    if (res.status < 200 || res.status >= 300) {
      const errBody = res.body && typeof res.body === "object" ? (res.body as ApiErrorBody) : null;
      throw new ApiError(res.status, errBody, errBody?.message ?? errBody?.detail ?? `Upload failed with ${res.status}`);
    }
    return res.body as T;
  })();
}
