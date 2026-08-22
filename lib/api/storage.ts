import { env } from "@/lib/env";
import { getAccessToken } from "@/lib/store/auth-store";

/**
 * The storage endpoint streams a raw file rather than JSON, and needs a
 * bearer token attached, so a plain `<a href>` can't be used directly for
 * protected downloads - fetch it as a blob and trigger a save via a
 * throwaway object URL instead.
 */
export function storageObjectUrl(bucketName: string, objectName: string) {
  return `${env.apiBaseUrl}/api/v1/storage/${encodeURIComponent(bucketName)}/${encodeURIComponent(objectName)}`;
}

export async function downloadStorageObject(
  bucketName: string,
  objectName: string,
  fileName: string,
) {
  const token = getAccessToken();
  const res = await fetch(storageObjectUrl(bucketName, objectName), {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) {
    throw new Error(`Failed to download ${fileName} (${res.status})`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
