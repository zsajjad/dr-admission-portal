import { useMemo } from 'react';

import { useSessionControllerFindAll } from '@/providers/service/session/session';

/**
 * Every session, closed ones included, with the active session first and then the newest.
 * `activeSession` is the session the program is running now (at most one is active).
 */
export function useSessions() {
  const query = useSessionControllerFindAll({ take: 100, includeInActive: true });

  const sessions = useMemo(
    () =>
      [...(query.data?.data ?? [])].sort(
        (a, b) =>
          Number(b.isActive) - Number(a.isActive) ||
          (b.startsAt ?? b.createdAt).localeCompare(a.startsAt ?? a.createdAt),
      ),
    [query.data?.data],
  );
  const activeSession = useMemo(() => sessions.find((s) => s.isActive), [sessions]);

  return { sessions, activeSession, isLoading: query.isLoading, isFetched: query.isFetched };
}
