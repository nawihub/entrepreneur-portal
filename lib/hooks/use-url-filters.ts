"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * List filters stored in the URL query string, so a filtered view survives reloads,
 * works with back/forward and can be shared. `single` keys hold one value; `multi` keys
 * hold several, stored comma-separated. Updates replace the history entry (typing in a
 * search box shouldn't create one entry per keystroke) and keep the scroll position.
 *
 * Callers must render under a <Suspense> boundary - useSearchParams requires it for
 * production builds (see node_modules/next/dist/docs, use-search-params.md).
 */
export function useUrlFilters<S extends string, M extends string = never>(config: { single: readonly S[]; multi?: readonly M[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const multiKeys = useMemo(() => config.multi ?? [], [config.multi]);

  const values = useMemo(() => {
    const single = Object.fromEntries(config.single.map((key) => [key, searchParams.get(key) ?? ""])) as Record<S, string>;
    const multi = Object.fromEntries(
      multiKeys.map((key) => [key, (searchParams.get(key) ?? "").split(",").filter(Boolean)]),
    ) as Record<M, string[]>;
    return { ...single, ...multi };
  }, [searchParams, config.single, multiKeys]);

  const update = useCallback(
    (changes: Partial<Record<S, string>> & Partial<Record<M, string[]>>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(changes) as [string, string | string[] | undefined][]) {
        const serialized = Array.isArray(value) ? value.join(",") : value ?? "";
        if (serialized) next.set(key, serialized);
        else next.delete(key);
      }
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const clear = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    for (const key of [...config.single, ...multiKeys]) next.delete(key);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [config.single, multiKeys, pathname, router, searchParams]);

  const activeCount =
    config.single.filter((key) => values[key]).length + multiKeys.filter((key) => (values[key] as string[]).length > 0).length;

  return { values, update, clear, activeCount };
}
