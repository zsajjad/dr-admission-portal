'use client';

import { Alert, Box, Grid, Skeleton } from '@mui/material';

import FormattedMessage from '@/theme/FormattedMessage';

import { useListingFilters } from '@/hooks/useListingFilters';

import { extractNetworkError } from '@/utils/extractNetworkError';

import {
  AreaComparisonTable,
  ClassBreakdownChart,
  DashboardFilters,
  FunnelMetricsChart,
  GenderDistributionChart,
  GroupStatsChart,
  StatCard,
  StatusDistributionChart,
  TrendChart,
} from './components';
import { STAT_COLORS } from './constants';
import { useDashboardData } from './hooks';
import messages from './messages';

interface DashboardFilterState {
  branchId?: string;
  sessionId?: string;
}

export function AdmissionDashboard() {
  const { filters } = useListingFilters<DashboardFilterState>();

  const {
    isLoading,
    isError,
    error,
    funnel,
    rates,
    statusChartData,
    genderChartData,
    trendChartData,
    groupChartData,
    areaTableData,
    tiflanClassChartData,
    muhibanGirlsChartData,
    muhibanBoysChartData,
    nasiranGenderChartData,
  } = useDashboardData({ branchId: filters.branchId, sessionId: filters.sessionId });

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[...Array(4)].map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
            </Grid>
          ))}
          {[...Array(4)].map((_, i) => (
            <Grid size={{ xs: 12, md: 6 }} key={i + 4}>
              <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 1 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        {extractNetworkError(error)}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Filter Dropdowns */}
      <DashboardFilters />

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={<FormattedMessage {...messages.totalAdmissions} />}
            value={funnel?.totalAdmissions || 0}
            color={STAT_COLORS.totalAdmissions}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={<FormattedMessage {...messages.feePaid} />}
            value={funnel?.feePaid || 0}
            subtitle={`${rates?.feePaidRate?.toFixed(1) || 0}%`}
            color={STAT_COLORS.feePaid}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={<FormattedMessage {...messages.finalized} />}
            value={funnel?.finalized || 0}
            subtitle={`${rates?.finalizedRate?.toFixed(1) || 0}%`}
            color={STAT_COLORS.finalized}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={<FormattedMessage {...messages.interactionSubmitted} />}
            value={funnel?.interactionSubmitted || 0}
            subtitle={`${rates?.interactionSubmittedRate?.toFixed(1) || 0}%`}
            color={STAT_COLORS.interactions}
          />
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <StatusDistributionChart
            title={<FormattedMessage {...messages.statusDistribution} />}
            data={statusChartData}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <GenderDistributionChart
            title={<FormattedMessage {...messages.genderDistribution} />}
            data={genderChartData}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <GroupStatsChart title={<FormattedMessage {...messages.groupStats} />} data={groupChartData} />
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <TrendChart
            title={<FormattedMessage {...messages.admissionTrend} values={{ days: '30' }} />}
            data={trendChartData}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <FunnelMetricsChart title={<FormattedMessage {...messages.funnelMetrics} />} funnel={funnel} />
        </Grid>
      </Grid>

      {/* Charts Row 3 - Tiflan & Nasiran */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ClassBreakdownChart
            title={<FormattedMessage {...messages.tiflanClassBreakdown} />}
            data={tiflanClassChartData}
            color="#1565C0"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <GenderDistributionChart
            title={<FormattedMessage {...messages.nasiranGenderBreakdown} />}
            data={nasiranGenderChartData}
          />
        </Grid>
      </Grid>

      {/* Charts Row 4 - Muhiban Girls & Boys (Full Width) */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ClassBreakdownChart
            title={<FormattedMessage {...messages.muhibanGirlsBreakdown} />}
            data={muhibanGirlsChartData}
            color="#E91E63"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ClassBreakdownChart
            title={<FormattedMessage {...messages.muhibanBoysBreakdown} />}
            data={muhibanBoysChartData}
            color="#1565C0"
          />
        </Grid>
      </Grid>

      {/* Area Comparison Table */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <AreaComparisonTable data={areaTableData} />
        </Grid>
      </Grid>
    </Box>
  );
}
