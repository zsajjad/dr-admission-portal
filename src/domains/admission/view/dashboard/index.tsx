'use client';

import { Alert, Box, Grid, Skeleton, Stack } from '@mui/material';

import FormattedMessage from '@/theme/FormattedMessage';

import { useListingFilters } from '@/hooks/useListingFilters';

import { extractNetworkError } from '@/utils/extractNetworkError';

import {
  AreaComparisonTable,
  ClassFeeBreakdownChart,
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

const cardStyle = {
  bgcolor: 'background.paper',
  borderRadius: 3,
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  p: 2.5,
};

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
    tiflanFeeChartData,
    muhibanBoysFeeChartData,
    muhibanGirlsFeeChartData,
    nasiranFeeChartData,
  } = useDashboardData({ branchId: filters.branchId, sessionId: filters.sessionId });

  if (isLoading) {
    return (
      <Stack spacing={2.5}>
        <Box sx={cardStyle}>
          <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 2 }} />
        </Box>
        <Grid container spacing={2.5}>
          {[...Array(4)].map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={2.5}>
          {[...Array(3)].map((_, i) => (
            <Grid size={{ xs: 12, md: 4 }} key={i}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Stack>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ borderRadius: 3 }}>
        {extractNetworkError(error)}
      </Alert>
    );
  }

  return (
    <Stack spacing={2.5}>
      {/* Filters */}
      <Box sx={cardStyle}>
        <DashboardFilters />
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2.5}>
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

      {/* Charts Row 1 - Distribution Charts */}
      <Grid container spacing={2.5}>
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

      {/* Charts Row 2 - Trend & Funnel */}
      <Grid container spacing={2.5}>
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

      {/* Fee Breakdown Section */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ClassFeeBreakdownChart
            title={<FormattedMessage {...messages.tiflanFeeBreakdown} />}
            data={tiflanFeeChartData}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ClassFeeBreakdownChart
            title={<FormattedMessage {...messages.nasiranFeeBreakdown} />}
            data={nasiranFeeChartData}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ClassFeeBreakdownChart
            title={<FormattedMessage {...messages.muhibanBoysFeeBreakdown} />}
            data={muhibanBoysFeeChartData}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ClassFeeBreakdownChart
            title={<FormattedMessage {...messages.muhibanGirlsFeeBreakdown} />}
            data={muhibanGirlsFeeChartData}
          />
        </Grid>
      </Grid>

      {/* Area Comparison Table */}
      <AreaComparisonTable data={areaTableData} />
    </Stack>
  );
}
