import { useMemo } from 'react';

import { useAdmissionsControllerGetDashboard } from '@/providers/service/admissions/admissions';
import {
  AdmissionsDashboardAreaStat,
  AdmissionsDashboardGenderStat,
  AdmissionsDashboardGroupStat,
  AdmissionsDashboardStatusStat,
  AdmissionsDashboardTrendPoint,
  FeeCardClassStat,
  FeeCardGenderStat,
} from '@/providers/service/app.schemas';

import type {
  ClassFeeChartData,
  GenderChartData,
  GroupChartData,
  StatusChartData,
  TrendChartData,
} from '../components';
import { GENDER_COLORS, STATUS_COLORS } from '../constants';

export interface UseDashboardDataProps {
  branchId?: string;
  sessionId?: string;
}

export function useDashboardData({ branchId, sessionId }: UseDashboardDataProps) {
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

  // Transform class fee stats to chart data format
  // API returns: confirmed (paid), expected (total expected)
  // We calculate: remaining = expected - confirmed
  const mapClassFeeStats = (classes: FeeCardClassStat[]): ClassFeeChartData[] => {
    return classes.map((stat, index) => ({
      name: stat.name || stat.code,
      code: stat.code,
      confirmed: stat.confirmed,
      remaining: stat.expected - stat.confirmed,
      total: stat.expected,
      age: index, // Use index for ordering since API returns sorted data
    }));
  };

  // Tiflan fee breakdown - all classes regardless of gender
  const tiflanFeeChartData: ClassFeeChartData[] = useMemo(() => {
    if (!dashboardData?.data?.feeCardStats?.tiflan?.classes) return [];
    return mapClassFeeStats(dashboardData.data.feeCardStats.tiflan.classes);
  }, [dashboardData]);

  // Muhiban Boys fee breakdown
  const muhibanBoysFeeChartData: ClassFeeChartData[] = useMemo(() => {
    if (!dashboardData?.data?.feeCardStats?.muhibanBoys?.classes) return [];
    return mapClassFeeStats(dashboardData.data.feeCardStats.muhibanBoys.classes);
  }, [dashboardData]);

  // Muhiban Girls fee breakdown
  const muhibanGirlsFeeChartData: ClassFeeChartData[] = useMemo(() => {
    if (!dashboardData?.data?.feeCardStats?.muhibanGirls?.classes) return [];
    return mapClassFeeStats(dashboardData.data.feeCardStats.muhibanGirls.classes);
  }, [dashboardData]);

  // Nasiran gender breakdown with fee stats (mapped to same format as class breakdown)
  const nasiranFeeChartData: ClassFeeChartData[] = useMemo(() => {
    if (!dashboardData?.data?.feeCardStats?.nasiran?.genders) return [];
    return dashboardData.data.feeCardStats.nasiran.genders.map((stat: FeeCardGenderStat, index: number) => ({
      name: stat.gender === 'MALE' ? 'Boys' : 'Girls',
      code: stat.gender,
      confirmed: stat.confirmed,
      remaining: stat.expected - stat.confirmed,
      total: stat.expected,
      age: index,
    }));
  }, [dashboardData]);

  return {
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
    // Fee card stats (4 cards)
    tiflanFeeChartData,
    muhibanBoysFeeChartData,
    muhibanGirlsFeeChartData,
    nasiranFeeChartData,
  };
}
