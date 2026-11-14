import { useMemo } from 'react';

import { useSessionControllerFindAll } from '@/providers/service/session/session';

import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';

/** Every session, newest first, and the current one (the newest active session) */
export function useSessions() {
  const { isAuthenticated } = useAuthenticatedApi();
  const { data, isLoading } = useSessionControllerFindAll(
    { take: 100 },
    { query: { enabled: isAuthenticated, staleTime: 5 * 60 * 1000 } },
  );
  return useMemo(() => {
    const sessions = [...(data?.data ?? [])].sort((a, b) =>
      (b.startsAt ?? b.createdAt).localeCompare(a.startsAt ?? a.createdAt),
    );
    return { sessions, current: sessions.find((s) => s.isActive) ?? sessions[0], isLoading };
  }, [data, isLoading]);
}
