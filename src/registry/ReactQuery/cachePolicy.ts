import type { QueryClient } from '@tanstack/react-query';

/**
 * How long fetched data counts as fresh, so moving between pages doesn't refetch it.
 * Every API call is a round trip to the server in Riyadh, so each refetch costs 0.2–0.6 s.
 */
export const DEFAULT_STALE_TIME_MS = 30 * 1000;

/** Lists that change a few times a season: sessions, branches, areas, vans, class levels and the like. */
export const REFERENCE_STALE_TIME_MS = 10 * 60 * 1000;
const REFERENCE_GC_TIME_MS = 30 * 60 * 1000;

/** First element of the orval query key (the API path) for the reference lists. */
export const REFERENCE_QUERY_ROOTS = [
  '/session',
  '/branch',
  '/area',
  '/van',
  '/class-level',
  '/question-set',
  '/results/steps',
  '/results/theory-pass-marks',
  '/trainings/catalog',
  '/trainings/settings',
  '/admin-permission/catalogue',
  '/admin-permission/me',
  '/admin/auth/me',
] as const;

/** Gives the reference lists a longer freshness window than the default. */
export function applyReferenceDataDefaults(queryClient: QueryClient): void {
  for (const root of REFERENCE_QUERY_ROOTS) {
    queryClient.setQueryDefaults([root], { staleTime: REFERENCE_STALE_TIME_MS, gcTime: REFERENCE_GC_TIME_MS });
  }
}

/**
 * After any successful save, marks every cached query stale without refetching it now. Pages then
 * refetch on their next mount or focus, as they did before caching, so an edit is never hidden by
 * the cache even where the form doesn't invalidate its list itself.
 */
export function markAllStale(queryClient: QueryClient): Promise<void> {
  return queryClient.invalidateQueries({ refetchType: 'none' });
}
