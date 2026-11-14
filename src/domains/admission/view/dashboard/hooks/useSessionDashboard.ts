import {
  useSessionDashboardControllerGetOverview,
  useSessionDashboardControllerGetRecord,
  useSessionDashboardControllerGetReturningPool,
  useSessionDashboardControllerGetTimeline,
} from '@/providers/service/session-dashboard/session-dashboard';

export interface SessionDashboardFilters {
  /** Empty: the active session */
  sessionId?: string;
  /** Empty: the session before it */
  compareSessionId?: string;
  /** Empty: all branches */
  branchId?: string;
}

/** The four reads behind the dashboard. Each panel shows its own loading state. */
export function useSessionDashboard({ sessionId, compareSessionId, branchId }: SessionDashboardFilters) {
  const params = {
    sessionId: sessionId || undefined,
    compareSessionId: compareSessionId || undefined,
    branchId: branchId || undefined,
  };
  const overview = useSessionDashboardControllerGetOverview(params);
  const timeline = useSessionDashboardControllerGetTimeline(params);
  const pool = useSessionDashboardControllerGetReturningPool(params);
  const record = useSessionDashboardControllerGetRecord({ branchId: params.branchId });

  return {
    overview: overview.data?.data,
    timeline: timeline.data?.data,
    pool: pool.data?.data,
    record: record.data?.data,
    isLoading: overview.isLoading,
    isTimelineLoading: timeline.isLoading,
    isPoolLoading: pool.isLoading,
    isRecordLoading: record.isLoading,
    error: overview.error || timeline.error || pool.error || record.error,
  };
}
