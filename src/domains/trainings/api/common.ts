/**
 * Hand-written client for the trainings admin routes (knowledge-base/trainings-contract.md, contract v2).
 *
 * Core is still building these routes, so the types follow the contract and fill in the response
 * shapes it leaves open (marked "assumed"). Once core's OpenAPI export has them, regenerate with
 * orval and point these hooks at the generated ones; the screens only import from this folder.
 */
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';

import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';

import service from '@/services';

export type Gender = 'MALE' | 'FEMALE';

/** A staff app user (trainer or tester) as the trainings routes return them (assumed) */
export interface StaffRef {
  id: string;
  name: string;
  /** The 5-digit staff ID printed on the card */
  staffId?: string;
}

/** Who made a change: a staff user, an admin, or SYSTEM for the cron (assumed shape) */
export interface ActorRef {
  type: 'STAFF' | 'ADMIN' | 'SYSTEM';
  id?: string;
  name?: string;
}

/** Lists follow the API's usual `{ count, data }` */
export interface ListResponse<T> {
  count: number;
  data: T[];
}

/** Single records follow the API's usual `{ message, data }` */
export interface DetailResponse<T> {
  message?: string;
  data: T;
}

export type QueryParams = Record<string, string | number | boolean | string[] | undefined | null>;

/** Drops empty values so they don't reach the query string */
export function cleanParams(params: QueryParams = {}): Record<string, string | number | boolean | string[]> {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== 'ALL'),
  ) as Record<string, string | number | boolean | string[]>;
}

export const TRAININGS_KEY = 'TRAININGS';

export const trainingsKeys = {
  all: [TRAININGS_KEY] as const,
  courses: () => [TRAININGS_KEY, 'courses'] as const,
  course: (id: string) => [TRAININGS_KEY, 'courses', id] as const,
  ageRules: () => [TRAININGS_KEY, 'age-rules'] as const,
  resolve: (studentId: string) => [TRAININGS_KEY, 'age-rules', 'resolve', studentId] as const,
  windows: (params: QueryParams) => [TRAININGS_KEY, 'windows', params] as const,
  enrollments: (params: QueryParams) => [TRAININGS_KEY, 'enrollments', params] as const,
  enrollment: (id: string) => [TRAININGS_KEY, 'enrollment', id] as const,
  student: (studentId: string) => [TRAININGS_KEY, 'student', studentId] as const,
  ledger: (params: QueryParams) => [TRAININGS_KEY, 'ledger', params] as const,
  ledgerTrainers: (params: QueryParams) => [TRAININGS_KEY, 'ledger-trainers', params] as const,
  report: (name: string, params: QueryParams) => [TRAININGS_KEY, 'reports', name, params] as const,
};

/** A GET hook that waits for the session, like the generated hooks do */
export function useTrainingsQuery<T>(
  queryKey: readonly unknown[],
  url: string,
  params?: QueryParams,
  options?: Partial<Pick<UseQueryOptions<T>, 'enabled' | 'staleTime' | 'placeholderData'>>,
) {
  const { isAuthenticated } = useAuthenticatedApi();
  return useQuery<T>({
    queryKey,
    queryFn: ({ signal }) => service<T>({ url, method: 'GET', params: cleanParams(params), signal }),
    ...options,
    enabled: isAuthenticated && (options?.enabled ?? true),
  });
}

type Method = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * A mutation hook. Every trainings change can move counts, states and money elsewhere,
 * so on success it reloads everything under the trainings key.
 */
export function useTrainingsMutation<TVars, TResult = unknown>(
  request: (vars: TVars) => { url: string; method: Method; data?: unknown },
) {
  const queryClient = useQueryClient();
  return useMutation<TResult, unknown, TVars>({
    mutationFn: (vars) => service<TResult>(request(vars)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: trainingsKeys.all }),
  });
}
