'use client';

import { useState } from 'react';

import { Alert, Box, Grid, Stack, Typography } from '@mui/material';

import { BranchFilter } from '@/components/BranchFilter';

import FormattedMessage, { useFormattedMessage } from '@/theme/FormattedMessage';

import { useListingFilters } from '@/hooks/useListingFilters';
import { useSessions } from '@/hooks/useSessions';

import { extractNetworkError } from '@/utils/extractNetworkError';

import {
  BreakdownTable,
  CumulativeChart,
  Delta,
  FeeDaysPanel,
  FunnelPanel,
  HeadlineCard,
  MetricToggle,
  Panel,
  RecordStrip,
  ReturningPoolPanel,
  SessionSelect,
  StudentMixPanel,
} from './components';
import type { SessionOption } from './components/SessionSelect';
import { DashboardMetric } from './constants';
import { formatDate, formatNumber, formatPercent, sessionLabel } from './format';
import { SessionDashboardFilters, useSessionDashboard } from './hooks';
import messages from './messages';

const HEADLINE_METRICS = [
  { metric: 'applied', label: messages.applications },
  { metric: 'feePaid', label: messages.feePaid },
  { metric: 'finalized', label: messages.finalized },
] as const;

/**
 * Monitoring page for one session (the active one unless another is chosen), read top to bottom:
 * where the session stands against the last one on the same day, how it got there day by day, where
 * applicants are in the steps to class, who from last session has not come back, and every year on
 * record. Definitions live with the API (core: session-dashboard).
 */
export function AdmissionDashboard() {
  const { filters, setFilter } = useListingFilters<SessionDashboardFilters>();
  const { sessions } = useSessions();
  const [metric, setMetric] = useState<DashboardMetric>('applied');

  const { overview, timeline, pool, record, isLoading, isTimelineLoading, isPoolLoading, isRecordLoading, error } =
    useSessionDashboard(filters);

  const chartLabels = {
    today: useFormattedMessage(messages.today),
    start: useFormattedMessage(messages.start),
    axis: useFormattedMessage(messages.axisDays),
  };

  const session = overview?.session;
  const compare = overview?.compareSession;
  const alignment = overview?.alignment;
  const sessionName = sessionLabel(session);
  const compareName = sessionLabel(compare);
  const hasSameDay = Boolean(alignment?.available && overview?.previousSameDay);

  // The session list can lag behind what the API chose (e.g. a closed session), so add those in
  const options: SessionOption[] = [...sessions];
  for (const chosen of [session, compare]) {
    if (chosen && !options.some((s) => s.id === chosen.id)) options.push(chosen);
  }
  const sessionId = filters.sessionId || session?.id;
  const compareId = filters.compareSessionId || compare?.id;

  const filtersRow = (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} data-testid="dashboard-filters">
      <SessionSelect
        testId="session-select"
        label={<FormattedMessage {...messages.sessionLabel} />}
        options={options}
        value={options.find((s) => s.id === sessionId)}
        // A new session gets its own default comparison
        onChange={(id) => setFilter({ sessionId: id, compareSessionId: undefined })}
      />
      <SessionSelect
        testId="compare-select"
        label={<FormattedMessage {...messages.compareLabel} />}
        options={options.filter((s) => s.id !== sessionId)}
        value={options.find((s) => s.id === compareId)}
        onChange={(id) => setFilter({ compareSessionId: id })}
      />
      <BranchFilter minWidth={220} />
    </Stack>
  );

  if (error) {
    const forbidden = (error as { statusCode?: number })?.statusCode === 403;
    return (
      <Stack spacing={2.5}>
        {filtersRow}
        <Alert severity={forbidden ? 'info' : 'error'} sx={{ borderRadius: 3 }} data-testid="dashboard-error">
          {forbidden ? <FormattedMessage {...messages.noPermission} /> : extractNetworkError(error)}
        </Alert>
      </Stack>
    );
  }

  const day = alignment?.day;
  const context = session && (
    <Box data-testid="dashboard-context">
      <Typography variant="body1" fontWeight={600}>
        {day === undefined ? (
          sessionName
        ) : day === 0 ? (
          <FormattedMessage {...messages.contextStartDay} values={{ session: sessionName }} />
        ) : (
          <FormattedMessage
            {...(day < 0 ? messages.contextBefore : messages.contextAfter)}
            values={{ days: formatNumber(Math.abs(day)), session: sessionName, date: formatDate(session.startsAt) }}
          />
        )}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {!compare ? (
          <FormattedMessage {...messages.contextNoCompare} />
        ) : alignment?.available ? (
          <FormattedMessage
            {...messages.contextCompare}
            values={{ compare: compareName, date: formatDate(alignment.compareDate) }}
          />
        ) : (
          <FormattedMessage {...messages.contextNoAlign} />
        )}
      </Typography>
    </Box>
  );

  /** ▲/▼ against the comparison session on the same day, then that session's own number. */
  const sameDayLine = (current: number | undefined, previous: number | undefined, mode: 'percent' | 'points') => {
    if (!compare) return null;
    if (!hasSameDay || previous === undefined) return <FormattedMessage {...messages.noSameDay} />;
    return (
      <>
        <Box>
          <Delta
            current={current}
            previous={previous}
            mode={mode}
            suffix={mode === 'points' ? <FormattedMessage {...messages.points} /> : undefined}
          />
        </Box>
        <FormattedMessage
          {...messages.vsSameDay}
          values={{ compare: compareName, value: mode === 'points' ? formatPercent(previous) : formatNumber(previous) }}
        />
      </>
    );
  };

  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { lg: 'center' } }}
      >
        {context || <Box />}
        {filtersRow}
      </Stack>

      {/* Where the session stands */}
      <Grid container spacing={2.5}>
        {HEADLINE_METRICS.map(({ metric: key, label }) => (
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }} key={key}>
            <HeadlineCard
              testId={`headline-${key}`}
              label={<FormattedMessage {...label} />}
              value={formatNumber(overview?.current[key])}
              comparison={sameDayLine(overview?.current[key], overview?.previousSameDay?.[key], 'percent')}
              footnote={
                overview?.previousFinal && (
                  <FormattedMessage
                    {...messages.endedWith}
                    values={{ compare: compareName, value: formatNumber(overview.previousFinal[key]) }}
                  />
                )
              }
              isLoading={isLoading}
            />
          </Grid>
        ))}
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <HeadlineCard
            testId="headline-remaining"
            label={<FormattedMessage {...messages.stillToReturn} />}
            value={pool?.compareSession ? formatNumber(pool.totals.remaining) : '—'}
            comparison={
              pool?.compareSession && (
                <FormattedMessage
                  {...messages.ofPool}
                  values={{ pool: formatNumber(pool.totals.pool), compare: sessionLabel(pool.compareSession) }}
                />
              )
            }
            isLoading={isPoolLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <HeadlineCard
            testId="headline-retention"
            label={<FormattedMessage {...messages.retentionRate} />}
            value={formatPercent(pool?.totals.retentionRate)}
            comparison={
              pool?.compareSession &&
              sameDayLine(pool.totals.retentionRate, pool.previous?.retentionRateSameDay, 'points')
            }
            footnote={
              pool?.previous?.retentionRateFinal !== undefined && (
                <FormattedMessage
                  {...messages.endedWith}
                  values={{ compare: compareName, value: formatPercent(pool.previous.retentionRateFinal) }}
                />
              )
            }
            isLoading={isPoolLoading}
          />
        </Grid>
      </Grid>

      {/* How it got there, and where applicants are now */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Panel
            title={<FormattedMessage {...messages.timelineTitle} />}
            subtitle={<FormattedMessage {...messages.timelineSubtitle} />}
            action={<MetricToggle value={metric} onChange={setMetric} testId="timeline-metric" />}
            isLoading={isTimelineLoading}
            loadingHeight={420}
          >
            {timeline && timeline.points.length > 0 ? (
              <CumulativeChart
                points={timeline.points}
                metric={metric}
                sessionName={sessionLabel(timeline.session)}
                compareName={timeline.compareSession?.startsAt ? sessionLabel(timeline.compareSession) : undefined}
                today={timeline.alignment.day}
                labels={chartLabels}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                <FormattedMessage {...messages.contextNoAlign} />
              </Typography>
            )}
          </Panel>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <FunnelPanel
            current={overview?.current}
            previousFinal={overview?.previousFinal}
            compareName={compareName}
            rejected={overview?.rejected}
            isLoading={isLoading}
          />
        </Grid>
      </Grid>

      {/* Who has not come back, who is new, and the fee days */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <ReturningPoolPanel pool={pool} isLoading={isPoolLoading} />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={2.5} sx={{ height: '100%' }}>
            <Box>
              <StudentMixPanel mix={overview?.studentMix} isLoading={isLoading} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <FeeDaysPanel fee={overview?.feeProgress} isLoading={isLoading} />
            </Box>
          </Stack>
        </Grid>
      </Grid>

      <BreakdownTable
        rows={overview?.breakdown ?? []}
        sessionName={sessionName}
        compareName={compare ? compareName : undefined}
        hasSameDay={hasSameDay}
        isLoading={isLoading}
      />

      <RecordStrip record={record} sessionId={session?.id} isLoading={isRecordLoading} />
    </Stack>
  );
}
