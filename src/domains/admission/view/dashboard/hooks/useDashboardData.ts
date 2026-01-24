import { useCallback, useMemo } from 'react';

import { useAdmissionsControllerGetDashboard } from '@/providers/service/admissions/admissions';
import {
  AdmissionsDashboardAreaStat,
  AdmissionsDashboardClassLevelStat,
  AdmissionsDashboardGenderStat,
  AdmissionsDashboardGroupStat,
  AdmissionsDashboardStatusStat,
  AdmissionsDashboardTrendPoint,
  ClassLevel,
} from '@/providers/service/app.schemas';
import { useBranchControllerFindAll } from '@/providers/service/branch/branch';
import { useClassLevelControllerFindAll } from '@/providers/service/class-level/class-level';
import { useSessionControllerFindAll } from '@/providers/service/session/session';

import type { ClassChartData, GenderChartData, GroupChartData, StatusChartData, TrendChartData } from '../components';
import { GENDER_COLORS, STATUS_COLORS } from '../constants';

export interface UseDashboardDataProps {
  branchId?: string;
  sessionId?: string;
}

export function useDashboardData({ branchId, sessionId }: UseDashboardDataProps) {
  // Fetch branches and sessions for dropdowns
  const { data: branchesData } = useBranchControllerFindAll({ take: 100 });
  const { data: sessionsData } = useSessionControllerFindAll({ take: 100 });
  // Fetch class levels for sorting by age
  const { data: classLevelsData } = useClassLevelControllerFindAll({ take: 100, sortBy: 'age', sortOrder: 'asc' });

  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
  } = useAdmissionsControllerGetDashboard({
    days: 30,
    branchId: branchId || undefined,
    sessionId: sessionId || undefined,
  });

  // Status chart data
  const statusChartData: StatusChartData[] = useMemo(() => {
    if (!dashboardData?.data?.statusStats) return [];
    return dashboardData.data.statusStats.map((stat: AdmissionsDashboardStatusStat) => ({
      name: stat.status,
      value: stat.count,
      color: STATUS_COLORS[stat.status] || '#7F8C8D',
    }));
  }, [dashboardData]);

  // Gender chart data
  const genderChartData: GenderChartData[] = useMemo(() => {
    if (!dashboardData?.data?.genderStats) return [];
    return dashboardData.data.genderStats.map((stat: AdmissionsDashboardGenderStat) => ({
      name: stat.gender,
      value: stat.count,
      color: GENDER_COLORS[stat.gender] || '#7F8C8D',
    }));
  }, [dashboardData]);

  // Trend chart data
  const trendChartData: TrendChartData[] = useMemo(() => {
    if (!dashboardData?.data?.recentTrend) return [];
    return dashboardData.data.recentTrend.map((point: AdmissionsDashboardTrendPoint) => ({
      date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      admissions: point.admissionsCreated,
      interactions: point.interactionsSubmitted,
    }));
  }, [dashboardData]);

  // Group chart data
  const groupChartData: GroupChartData[] = useMemo(() => {
    if (!dashboardData?.data?.groupStats) return [];
    return dashboardData.data.groupStats.map((stat: AdmissionsDashboardGroupStat) => ({
      name: stat.group,
      male: stat.maleCount,
      female: stat.femaleCount,
      total: stat.totalStudents,
    }));
  }, [dashboardData]);

  // Area table data
  const areaTableData: AdmissionsDashboardAreaStat[] = useMemo(() => {
    if (!dashboardData?.data?.areaStats) return [];
    return dashboardData.data.areaStats as AdmissionsDashboardAreaStat[];
  }, [dashboardData]);

  // Create lookup maps for class level sorting by age and group
  const classLevelInfoMap = useMemo(() => {
    const map: Record<string, { age: number; group: string }> = {};
    if (classLevelsData?.data) {
      classLevelsData.data.forEach((cl: ClassLevel, index: number) => {
        map[cl.code] = {
          age: cl.age ?? index,
          group: cl.group,
        };
      });
    }
    return map;
  }, [classLevelsData]);

  // Codes to merge into Tiflan3
  const TIFLAN_MERGE_CODES = ['Tiflan3', 'Tiflan4'];

  // Build Tiflan class breakdown data (with Tiflan4 merged into Tiflan3)
  const tiflanClassChartData: ClassChartData[] = useMemo(() => {
    if (!dashboardData?.data?.classLevelStats) return [];

    const tiflanStats: Record<string, { name: string; code: string; count: number; age: number }> = {};
    let tiflan3MergedCount = 0;
    let tiflan3Age = 999;

    dashboardData.data.classLevelStats.forEach((stat: AdmissionsDashboardClassLevelStat) => {
      const info = classLevelInfoMap[stat.code];
      if (info?.group !== 'TIFLAN') return;

      if (TIFLAN_MERGE_CODES.includes(stat.code)) {
        tiflan3MergedCount += stat.count;
        if (stat.code === 'Tiflan3' && info?.age !== undefined) {
          tiflan3Age = info.age;
        }
      } else {
        const key = stat.code;
        if (!tiflanStats[key]) {
          tiflanStats[key] = {
            name: stat.name || stat.code,
            code: stat.code,
            count: 0,
            age: info?.age ?? 999,
          };
        }
        tiflanStats[key].count += stat.count;
      }
    });

    // Add merged Tiflan3 entry
    if (tiflan3MergedCount > 0) {
      tiflanStats['Tiflan3'] = {
        name: 'Tiflan3',
        code: 'Tiflan3',
        count: tiflan3MergedCount,
        age: tiflan3Age,
      };
    }

    return Object.values(tiflanStats).sort((a, b) => a.age - b.age);
  }, [dashboardData, classLevelInfoMap]);

  // Build Muhiban class breakdown data by gender
  const buildMuhibanChartData = useCallback(
    (gender: 'FEMALE' | 'MALE'): ClassChartData[] => {
      if (!dashboardData?.data?.classLevelStats) return [];

      const muhibanStats: Record<string, { name: string; code: string; count: number; age: number }> = {};

      dashboardData.data.classLevelStats.forEach((stat: AdmissionsDashboardClassLevelStat) => {
        const info = classLevelInfoMap[stat.code];
        if (info?.group !== 'MUHIBAN' || stat.gender !== gender) return;

        const key = stat.code;
        if (!muhibanStats[key]) {
          muhibanStats[key] = {
            name: stat.name || stat.code,
            code: stat.code,
            count: 0,
            age: info?.age ?? 999,
          };
        }
        muhibanStats[key].count += stat.count;
      });

      return Object.values(muhibanStats).sort((a, b) => a.age - b.age);
    },
    [dashboardData, classLevelInfoMap],
  );

  const muhibanGirlsChartData = useMemo(() => buildMuhibanChartData('FEMALE'), [buildMuhibanChartData]);
  const muhibanBoysChartData = useMemo(() => buildMuhibanChartData('MALE'), [buildMuhibanChartData]);

  // Build Nasiran gender breakdown data (just boys vs girls totals)
  const nasiranGenderChartData: GenderChartData[] = useMemo(() => {
    if (!dashboardData?.data?.classLevelStats) return [];

    let maleTotal = 0;
    let femaleTotal = 0;

    dashboardData.data.classLevelStats.forEach((stat: AdmissionsDashboardClassLevelStat) => {
      const info = classLevelInfoMap[stat.code];
      if (info?.group !== 'NASIRAN') return;

      if (stat.gender === 'MALE') {
        maleTotal += stat.count;
      } else if (stat.gender === 'FEMALE') {
        femaleTotal += stat.count;
      }
    });

    const result: GenderChartData[] = [];
    if (maleTotal > 0) {
      result.push({ name: 'Boys', value: maleTotal, color: GENDER_COLORS.MALE });
    }
    if (femaleTotal > 0) {
      result.push({ name: 'Girls', value: femaleTotal, color: GENDER_COLORS.FEMALE });
    }
    return result;
  }, [dashboardData, classLevelInfoMap]);

  return {
    // Dropdown data
    branches: branchesData?.data,
    sessions: sessionsData?.data,
    // Loading states
    isLoading,
    isError,
    error,
    // Dashboard data
    funnel: dashboardData?.data?.funnel,
    rates: dashboardData?.data?.rates,
    // Chart data
    statusChartData,
    genderChartData,
    trendChartData,
    groupChartData,
    areaTableData,
    // Group-wise class breakdown
    tiflanClassChartData,
    muhibanGirlsChartData,
    muhibanBoysChartData,
    nasiranGenderChartData,
  };
}
