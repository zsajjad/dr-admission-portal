import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { admissionsControllerFindAll } from '@/providers/service/admissions/admissions';
import type { Admission } from '@/providers/service/app.schemas';

export interface UseAdmissionsAreaDistributionProps {
  sessionId?: string;
  branchId?: string;
  classLevelId?: string;
}

export interface AdmissionsAreaDistributionDatum {
  areaId: string;
  areaName: string;
  legacyCount: number;
  nonLegacyCount: number;
  total: number;
}

export interface AdmissionsLegacyNewTotals {
  legacyCount: number;
  nonLegacyCount: number;
  total: number;
}

export interface AdmissionsAreaDistributionResult {
  byArea: AdmissionsAreaDistributionDatum[];
  totals: AdmissionsLegacyNewTotals;
}

// API constraint: `take` must not exceed 100.
const PAGE_SIZE = 100;
const MAX_TOTAL = 20000;

async function fetchAdmissionsAllPages(
  params: Required<UseAdmissionsAreaDistributionProps>,
  signal?: AbortSignal,
): Promise<Admission[]> {
  let skip = 0;
  const all: Admission[] = [];

  while (skip < MAX_TOTAL) {
    const res = await admissionsControllerFindAll(
      {
        sessionId: params.sessionId,
        branchId: params.branchId,
        classLevelId: params.classLevelId,
        skip,
        take: PAGE_SIZE,
      },
      signal,
    );

    const page = res.data ?? [];
    all.push(...page);

    if (page.length < PAGE_SIZE) break;
    skip += PAGE_SIZE;
  }

  return all;
}

export function useAdmissionsAreaDistribution({
  sessionId,
  branchId,
  classLevelId,
}: UseAdmissionsAreaDistributionProps) {
  const enabled = Boolean(sessionId && branchId && classLevelId);

  const query = useQuery({
    queryKey: ['admissionsAreaDistribution', { sessionId, branchId, classLevelId }],
    enabled,
    queryFn: async ({ signal }) => {
      const admissions = await fetchAdmissionsAllPages(
        { sessionId: sessionId!, branchId: branchId!, classLevelId: classLevelId! },
        signal,
      );

      const counts = new Map<string, AdmissionsAreaDistributionDatum>();
      let legacyCount = 0;
      let nonLegacyCount = 0;

      for (const admission of admissions) {
        const area = admission.area;
        if (!area?.id) continue;

        const existing = counts.get(area.id) ?? {
          areaId: area.id,
          areaName: area.name,
          legacyCount: 0,
          nonLegacyCount: 0,
          total: 0,
        };

        if (admission.legacyStudentId) {
          existing.legacyCount += 1;
          legacyCount += 1;
        } else {
          existing.nonLegacyCount += 1;
          nonLegacyCount += 1;
        }
        existing.total = existing.legacyCount + existing.nonLegacyCount;
        counts.set(area.id, existing);
      }

      const byArea = Array.from(counts.values()).sort((a, b) => b.total - a.total);

      return {
        byArea,
        totals: {
          legacyCount,
          nonLegacyCount,
          total: legacyCount + nonLegacyCount,
        },
      } satisfies AdmissionsAreaDistributionResult;
    },
  });

  const data = useMemo<AdmissionsAreaDistributionResult>(
    () => query.data ?? { byArea: [], totals: { legacyCount: 0, nonLegacyCount: 0, total: 0 } },
    [query.data],
  );

  return {
    data,
    isLoading: enabled && query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
