/**
 * The trainings admin client: thin wrappers over the orval hooks generated from core's trainings
 * routes (knowledge-base/trainings-contract.md, contract v2). They wait for the session before
 * reading, and every change reloads every trainings query, since one action can move states,
 * counts and money shown elsewhere.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';

export type QueryParams = Record<string, string | number | boolean | string[] | undefined | null>;

/** Drops empty values so they don't reach the query string */
export function cleanParams<T extends QueryParams>(params: T): T {
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')) as T;
}

/** Generated query keys start with the route, e.g. `/trainings/courses` */
const isTrainingsQuery = (key: readonly unknown[]) => typeof key[0] === 'string' && key[0].startsWith('/trainings');

/** Query options for a generated hook: wait for the session, plus any extra condition */
export function useQueryGate(enabled = true) {
  const { isAuthenticated } = useAuthenticatedApi();
  return { query: { enabled: isAuthenticated && enabled } };
}

/** A mutation that calls a generated request function and then reloads every trainings query */
export function useTrainingsMutation<TVars, TResult = unknown>(request: (vars: TVars) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation<TResult, unknown, TVars>({
    mutationFn: request,
    onSuccess: () => queryClient.invalidateQueries({ predicate: (q) => isTrainingsQuery(q.queryKey) }),
  });
}
