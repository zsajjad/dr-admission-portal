'use client';

import { ReactNode } from 'react';

import { useIntl } from 'react-intl';

import { Alert, Box, Card, CardContent, Skeleton, Stack, Tab, Tabs, Tooltip, Typography } from '@mui/material';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

import { AreaFilter } from '@/components/AreaFilter';
import { BranchFilter } from '@/components/BranchFilter';
import { BarChart } from '@/components/Charts';
import { GenderFilter } from '@/components/GenderFilter';
import { SessionFilter } from '@/components/SessionFilter';

import { StaffRole } from '@/providers/service/app.schemas';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { useListingFilters } from '@/hooks/useListingFilters';

import { extractNetworkError } from '@/utils/extractNetworkError';

import { ENROLLMENT_STATES } from '../../api/operations';
import {
  ReportFilters,
  ReportName,
  REPORTS,
  ResultsRow,
  usePayoutsReport,
  usePipelineReport,
  useResultsReport,
  useTestersReport,
  useTrainersReport,
  useTrainingsReport,
} from '../../api/reports';
import { StaffFilter, TrainingFilter, UrlDateFilter, UrlSelect, UrlTextFilter } from '../../components/Filters';
import common from '../../messages';
import { cardStyle, formatAmount, formatPct } from '../../utils';

import messages from './messages';

interface Column<T> {
  label: ReactNode;
  value: (row: T) => ReactNode;
  align?: 'right';
}

/** A plain report table; the first column names the group (or the row) */
function ReportTable<T>({ columns, rows, total }: { columns: Column<T>[]; rows: T[]; total?: T }) {
  if (!rows.length) {
    return (
      <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
        <FormattedMessage {...messages.noData} />
      </Typography>
    );
  }
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ '& td, & th': { whiteSpace: 'nowrap' } }}>
        <TableHead>
          <TableRow>
            {columns.map((c, i) => (
              <TableCell key={i} align={c.align}>
                {c.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, r) => (
            <TableRow key={r} hover>
              {columns.map((c, i) => (
                <TableCell key={i} align={c.align} sx={{ fontWeight: i === 0 ? 600 : 400 }}>
                  {c.value(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {total && (
            <TableRow sx={{ '& td': { fontWeight: 700, borderTop: 2, borderColor: 'divider' } }}>
              {columns.map((c, i) => (
                <TableCell key={i} align={c.align}>
                  {i === 0 ? <FormattedMessage {...messages.total} /> : c.value(total)}
                </TableCell>
              ))}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
}

type ResultsTableRow = ResultsRow & { group: string; label?: string };

const num = (n?: number | null) => (n === undefined || n === null ? '--' : n.toLocaleString('en-PK'));

/** The six trainings reports, sharing one filter bar; groupBy splits by gender, area or branch */
export function ReportsView() {
  const intl = useIntl();
  const t = (m: { id: string; defaultMessage: string }) => intl.formatMessage(m);
  const { filters, setFilter } = useListingFilters<Record<string, string>>();
  const report: ReportName = REPORTS.includes(filters.report as ReportName)
    ? (filters.report as ReportName)
    : 'pipeline';

  const params: ReportFilters = {
    from: filters.from,
    to: filters.to,
    sessionId: filters.sessionId,
    trainingId: filters.trainingId,
    trainerStaffUserId: filters.trainer,
    testerStaffUserId: filters.tester,
    branchId: filters.branchId,
    areaId: filters.areaId,
    gender: filters.gender as ReportFilters['gender'],
    groupBy: filters.groupBy as ReportFilters['groupBy'],
    stuckDays: filters.stuckDays ? Number(filters.stuckDays) : undefined,
  };

  const pipeline = usePipelineReport(params, report === 'pipeline');
  const results = useResultsReport(params, report === 'results');
  const trainings = useTrainingsReport(params, report === 'trainings');
  const trainers = useTrainersReport(params, report === 'trainers');
  const testers = useTestersReport(params, report === 'testers');
  const payouts = usePayoutsReport(params, report === 'payouts');
  const queries: Record<ReportName, { error: unknown; isLoading: boolean }> = {
    pipeline,
    results,
    trainings,
    trainers,
    testers,
    payouts,
  };
  const current = queries[report];

  const groupLabel = (g: { group: string; label?: string }) =>
    g.label ?? (!g.group || g.group.toUpperCase() === 'ALL' ? t(messages.allStudents) : g.group);
  const groupCol = <T extends { group: string; label?: string }>(): Column<T> => ({
    label: t(messages.group),
    value: groupLabel,
  });

  const body = (() => {
    switch (report) {
      case 'pipeline':
        return (
          <ReportTable
            rows={pipeline.data?.groups ?? []}
            columns={[
              groupCol(),
              ...ENROLLMENT_STATES.map((s) => ({
                label: t(common[s]),
                align: 'right' as const,
                value: (g: { states: object }) => num((g.states as Record<string, number>)[s] ?? 0),
              })),
              { label: t(messages.total), align: 'right', value: (g) => num(g.total) },
              { label: t(messages.stuck), align: 'right', value: (g) => num(g.stuck) },
            ]}
          />
        );
      case 'results': {
        const groups = results.data?.groups ?? [];
        // v3 reports per training inside each group; v2 has one row per group
        const rows: ResultsTableRow[] = groups.flatMap((g) =>
          g.trainings?.length ? g.trainings.map((r) => ({ ...r, group: g.group, label: g.label })) : [g],
        );
        const first = groups[0];
        return (
          <Stack spacing={2}>
            <ReportTable
              rows={rows}
              columns={[
                groupCol(),
                ...(rows.some((r) => r.code)
                  ? [{ label: t(messages.training), value: (r: ResultsTableRow) => r.code ?? '' }]
                  : []),
                { label: t(messages.tested), align: 'right', value: (r) => num(r.tested) },
                { label: t(messages.passed), align: 'right', value: (r) => num(r.passed) },
                { label: t(messages.passRate), align: 'right', value: (r) => formatPct(r.passRate) },
                { label: t(messages.averageScore), align: 'right', value: (r) => formatPct(r.averageScore) },
                { label: t(messages.retested), align: 'right', value: (r) => num(r.retested) },
                { label: t(messages.firstAttempt), align: 'right', value: (r) => formatPct(r.firstAttemptAverage) },
                { label: t(messages.secondAttempt), align: 'right', value: (r) => formatPct(r.secondAttemptAverage) },
                { label: t(messages.improvement), align: 'right', value: (r) => formatPct(r.averageImprovement) },
              ]}
            />
            {first?.distribution?.length ? (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  <FormattedMessage {...messages.distribution} values={{ group: groupLabel(first) }} />
                </Typography>
                <BarChart
                  height={260}
                  xKey="bucket"
                  barKeys={['students']}
                  data={first.distribution.map((count, i) => ({
                    bucket: i === 9 ? '90–100' : `${i * 10}–${i * 10 + 9}`,
                    students: count,
                  }))}
                />
              </Box>
            ) : null}
          </Stack>
        );
      }
      case 'trainings':
        return (
          <ReportTable
            rows={(trainings.data?.groups ?? []).flatMap((g) => g.trainings.map((r) => ({ ...r, g })))}
            columns={[
              { label: t(messages.group), value: (r) => groupLabel(r.g) },
              { label: t(messages.training), value: (r) => `${r.code} · ${r.name}` },
              { label: t(messages.graded), align: 'right', value: (r) => num(r.graded) },
              { label: t(messages.passRate), align: 'right', value: (r) => formatPct(r.passRate) },
              { label: t(messages.averagePct), align: 'right', value: (r) => formatPct(r.averagePct) },
            ]}
          />
        );
      case 'trainers':
        return (
          <ReportTable
            rows={(trainers.data?.groups ?? []).flatMap((g) => g.trainers.map((r) => ({ ...r, g })))}
            columns={[
              { label: t(messages.group), value: (r) => groupLabel(r.g) },
              { label: t(common.trainer), value: (r) => r.name },
              ...((trainers.data?.groups ?? []).some((g) => g.trainers.some((r) => r.code))
                ? [{ label: t(messages.training), value: (r: { code?: string }) => r.code ?? '' }]
                : []),
              { label: t(messages.students), align: 'right', value: (r) => num(r.students) },
              { label: t(messages.tested), align: 'right', value: (r) => num(r.tested) },
              { label: t(messages.averageScore), align: 'right', value: (r) => formatPct(r.averageScore) },
              { label: t(messages.retrainRate), align: 'right', value: (r) => formatPct(r.retrainRate) },
              { label: t(messages.payoutTotal), align: 'right', value: (r) => formatAmount(r.payoutTotal) },
            ]}
          />
        );
      case 'testers':
        return (
          <ReportTable
            rows={(testers.data?.groups ?? []).flatMap((g) => g.testers.map((r) => ({ ...r, g })))}
            columns={[
              { label: t(messages.group), value: (r) => groupLabel(r.g) },
              { label: t(common.tester), value: (r) => r.name },
              { label: t(messages.window), value: (r) => r.windowId ?? '--' },
              { label: t(messages.graded), align: 'right', value: (r) => num(r.graded) },
              { label: t(messages.averageGiven), align: 'right', value: (r) => formatPct(r.averageScore) },
              { label: t(messages.overridden), align: 'right', value: (r) => num(r.overridden) },
              {
                label: (
                  <Tooltip title={t(messages.justAbovePassHelp)}>
                    <span>{t(messages.justAbovePass)}</span>
                  </Tooltip>
                ),
                align: 'right',
                value: (r) => (
                  <Typography
                    component="span"
                    variant="body2"
                    color={r.graded && r.justAbovePass / r.graded >= 0.3 ? 'error' : 'text.primary'}
                    sx={{ fontWeight: r.graded && r.justAbovePass / r.graded >= 0.3 ? 700 : 400 }}
                  >
                    {num(r.justAbovePass)}
                  </Typography>
                ),
              },
            ]}
          />
        );
      case 'payouts':
        return (
          <ReportTable
            rows={payouts.data?.trainers ?? []}
            total={payouts.data?.total}
            columns={[
              { label: t(common.trainer), value: (r) => r.name },
              { label: t(messages.pending), align: 'right', value: (r) => formatAmount(r.pending) },
              { label: t(messages.payable), align: 'right', value: (r) => formatAmount(r.payable) },
              { label: t(messages.approved), align: 'right', value: (r) => formatAmount(r.approved) },
              { label: t(messages.paid), align: 'right', value: (r) => formatAmount(r.paid) },
            ]}
          />
        );
      default:
        return null;
    }
  })();

  return (
    <Stack spacing={2}>
      <Tabs
        value={report}
        onChange={(_, v) => setFilter({ report: v })}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}
      >
        {REPORTS.map((r) => (
          <Tab key={r} value={r} label={t(messages[r])} />
        ))}
      </Tabs>

      <Card sx={cardStyle}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap" alignItems="flex-start">
            <UrlDateFilter param="from" label={t(messages.from)} />
            <UrlDateFilter param="to" label={t(messages.to)} />
            <SessionFilter minWidth={180} />
            <TrainingFilter />
            <StaffFilter param="trainer" role={StaffRole.TRAINER} label={t(common.trainer)} />
            <StaffFilter param="tester" role={StaffRole.TESTER} label={t(common.tester)} />
            <BranchFilter minWidth={180} resetFiltersOnChange={['areaId']} />
            <AreaFilter minWidth={180} />
            <GenderFilter minWidth={130} />
            <UrlSelect
              param="groupBy"
              label={t(messages.groupBy)}
              options={(['gender', 'area', 'branch'] as const).map((g) => ({ value: g, label: t(messages[g]) }))}
            />
            {report === 'pipeline' && (
              <UrlTextFilter param="stuckDays" type="number" minWidth={150} label={t(messages.stuckDays)} />
            )}
          </Stack>
        </CardContent>
      </Card>

      {!!current.error && (
        <Alert severity="error">
          <FormattedMessage {...common.loadError} />: {extractNetworkError(current.error)}
        </Alert>
      )}
      <Card sx={cardStyle}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          {current.isLoading ? <Skeleton variant="rounded" height={160} /> : body}
        </CardContent>
      </Card>
    </Stack>
  );
}
