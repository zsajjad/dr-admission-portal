/**
 * Theory pass marks per session and class level (contract v3, "Session result rules").
 */
import { useQueryClient } from '@tanstack/react-query';

import { SetTheoryPassMarksDto } from '@/providers/service/app.schemas';
import {
  getResultsControllerTheoryPassMarksQueryKey,
  useResultsControllerSetTheoryPassMarks,
  useResultsControllerTheoryPassMarks,
} from '@/providers/service/results/results';

import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';

export function useTheoryPassMarks(sessionId?: string) {
  const { isAuthenticated } = useAuthenticatedApi();
  return useResultsControllerTheoryPassMarks(
    { sessionId: sessionId ?? '' },
    { query: { enabled: isAuthenticated && !!sessionId, select: (res) => res.data } },
  );
}

/** PUT needs results.lock and recomputes the session's results and positions; null removes a pass mark */
export function useSaveTheoryPassMarks() {
  const queryClient = useQueryClient();
  const mutation = useResultsControllerSetTheoryPassMarks({
    mutation: {
      onSuccess: (_res, { data }) =>
        queryClient.invalidateQueries({
          queryKey: getResultsControllerTheoryPassMarksQueryKey({ sessionId: data.sessionId }),
        }),
    },
  });
  return {
    ...mutation,
    save: (data: SetTheoryPassMarksDto, opts: Parameters<typeof mutation.mutate>[1]) => mutation.mutate({ data }, opts),
  };
}
