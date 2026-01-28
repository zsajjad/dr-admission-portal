'use client';

import { Alert, Grid, Skeleton, Stack } from '@mui/material';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { useListingFilters } from '@/hooks/useListingFilters';

import { extractNetworkError } from '@/utils/extractNetworkError';

import {
  EmptyState,
  InsightCards,
  QuestionMetricsChart,
  RatingDistributionChart,
  ReportFilters,
  StudentsTable,
} from './components';
import { useInteractionReport } from './hooks/useInteractionReport';
import messages from './messages';

interface ReportFilterState {
  sessionId?: string;
  branchId?: string;
  classLevelId?: string;
  areaId?: string;
}

export function InteractionReport() {
  const { filters } = useListingFilters<ReportFilterState>();

  const {
    isLoading,
    isError,
    error,
    hasRequiredFilters,
    hasData,
    insights,
    ratingDistributionData,
    questionMetricsData,
    questionsWithStudents,
  } = useInteractionReport({
    sessionId: filters.sessionId,
    branchId: filters.branchId,
    classLevelId: filters.classLevelId,
    areaId: filters.areaId,
  });

  return (
    <Stack spacing={2.5}>
      {/* Filters - Always visible */}
      <ReportFilters />

      {/* Content - Conditional based on filters */}
      {!hasRequiredFilters ? (
        <EmptyState />
      ) : isLoading ? (
        <LoadingSkeleton />
      ) : isError ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {extractNetworkError(error)}
        </Alert>
      ) : !hasData ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          <FormattedMessage {...messages.noData} />
        </Alert>
      ) : (
        <Stack spacing={2.5}>
          {/* Insight Cards */}
          <InsightCards
            totalInteractions={insights.totalInteractions}
            overallAverageRating={insights.overallAverageRating}
            totalStudentsNeedingAttention={insights.totalStudentsNeedingAttention}
            questionsNeedingAttention={insights.questionsNeedingAttention}
          />

          {/* Charts Row */}
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <RatingDistributionChart data={ratingDistributionData} />
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <QuestionMetricsChart data={questionMetricsData} />
            </Grid>
          </Grid>

          {/* Students Table with Peer Teaching Groups */}
          <StudentsTable questions={questionsWithStudents} />
        </Stack>
      )}
    </Stack>
  );
}

function LoadingSkeleton() {
  return (
    <Stack spacing={2.5}>
      {/* Stat cards skeleton */}
      <Grid container spacing={2}>
        {[...Array(4)].map((_, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 3 }} />
          </Grid>
        ))}
      </Grid>

      {/* Charts skeleton */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 3 }} />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 3 }} />
        </Grid>
      </Grid>

      {/* Table skeleton */}
      <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 3 }} />
    </Stack>
  );
}
