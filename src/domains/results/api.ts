/**
 * Theory pass marks per session and class level (contract v3, "Session result rules").
 * Typed by hand until core's OpenAPI export (feat/result-rules-v3) has these routes.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';

import service from '@/services';

export interface TheoryPassMark {
  classLevelId: string;
  /** Marks, not a percentage; null when not set */
  passMarks: number | null;
}

const KEY = '/results/theory-pass-marks';

export function useTheoryPassMarks(sessionId?: string) {
  const { isAuthenticated } = useAuthenticatedApi();
  return useQuery({
    queryKey: [KEY, sessionId],
    queryFn: ({ signal }) =>
      service<{ data?: TheoryPassMark[] } | TheoryPassMark[]>({
        url: KEY,
        method: 'GET',
        params: { sessionId },
        signal,
      }),
    select: (res) => (Array.isArray(res) ? res : (res.data ?? [])),
    enabled: isAuthenticated && !!sessionId,
  });
}

/** PUT needs results.lock and recomputes the session's results and positions */
export function useSaveTheoryPassMarks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { sessionId: string; rows: { classLevelId: string; passMarks: number | null }[] }) =>
      service({ url: KEY, method: 'PUT', data, headers: { 'Content-Type': 'application/json' } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}
