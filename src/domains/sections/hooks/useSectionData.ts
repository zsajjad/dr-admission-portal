import { useEffect, useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { ClassLevel, Section } from '@/providers/service/app.schemas';
import { useClassLevelControllerFindAll } from '@/providers/service/class-level/class-level';
import { sectionControllerFindAll } from '@/providers/service/section/section';
import { useSessionControllerFindAll } from '@/providers/service/session/session';

import { useListingFilters } from '@/hooks/useListingFilters';

const PAGE = 100; // the API's largest page

/** Every section of a session and branch (closed ones too), fetched page by page */
export function useAllSections(params: { sessionId?: string; branchId?: string; classLevelId?: string }) {
  const enabled = !!params.sessionId && !!params.branchId;
  return useQuery({
    queryKey: ['sections-all', params],
    enabled,
    queryFn: async ({ signal }) => {
      const all: Section[] = [];
      for (let skip = 0; ; skip += PAGE) {
        const page = await sectionControllerFindAll(
          { ...params, includeInActive: true, sortBy: 'letter', skip, take: PAGE },
          signal,
        );
        all.push(...page.data);
        if (page.data.length < PAGE || all.length >= page.count) break;
      }
      return all;
    },
  });
}

/** Active class levels in the program's order, with a lookup by ID */
export function useClassLevels() {
  const { data, isLoading } = useClassLevelControllerFindAll({ take: 100 });
  return useMemo(() => {
    const levels: ClassLevel[] = (data?.data || [])
      .filter((c) => c.isActive !== false)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.age - b.age || a.code.localeCompare(b.code));
    return {
      levels,
      byId: new Map(levels.map((l) => [l.id, l])),
      byCode: new Map(levels.map((l) => [l.code, l])),
      isLoading,
    };
  }, [data?.data, isLoading]);
}

/** "Muhibaan5-G" → "Muhibaan5": letters are shared by both genders of a class number */
export const classNumberOf = (code: string) => code.replace(/-[A-Z]$/, '');

/** The session and branch picked in the URL; the session defaults to the latest one */
export function useSessionBranchFilters() {
  const { filters, setFilter } = useListingFilters<{ sessionId?: string; branchId?: string }>();
  const { data: sessions } = useSessionControllerFindAll({ take: 100 });
  useEffect(() => {
    if (filters.sessionId || !sessions?.data.length) return;
    const latest = [...sessions.data].sort((a, b) => (b.startsAt ?? '').localeCompare(a.startsAt ?? ''))[0];
    setFilter({ sessionId: latest.id });
  }, [filters.sessionId, sessions?.data, setFilter]);
  return { sessionId: filters.sessionId, branchId: filters.branchId };
}
