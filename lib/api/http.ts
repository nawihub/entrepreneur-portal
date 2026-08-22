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
  query?: Record<string, string | number | boolean | undefined | null>;
  /** Skip attaching a bearer token / retrying on 401 - for the handful of
   * public gateway endpoints. */
  auth?: boolean;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(
    path.startsWith("http") ? path : `${env.apiBaseUrl}${path}`,
  );
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
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
  const { method = "GET", body, form, query, auth = true, signal } = options;

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

  const res = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: payload,
    signal,
  });

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
  upload: <T>(path: string, form: FormData, options?: Omit<RequestOptions, "method" | "form" | "body">) =>
    request<T>(path, { ...options, method: "POST", form }),
};
