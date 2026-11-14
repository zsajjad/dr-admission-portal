'use client';

import { useEffect, useMemo, useState } from 'react';

import { useIntl } from 'react-intl';

import Link from 'next/link';

import { Alert, Button, Card, CardContent, Chip, Stack, Tab, Tabs, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';

import { DataTable } from '@/components/DataTable';
import { SessionFilter } from '@/components/SessionFilter';

import { StaffRole } from '@/providers/service/app.schemas';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { useListingFilters } from '@/hooks/useListingFilters';

import { routes } from '@/router/routes';

import { extractNetworkError } from '@/utils/extractNetworkError';

import { RECHECKS_PAGE_SIZES, RecheckRow, useRechecks } from '../../api/rechecks';
import { useWindows } from '../../api/setup';
import { StaffFilter, TrainingFilter, UrlDateFilter, UrlSelect } from '../../components/Filters';
import { useSessions } from '../../components/useCurrentSession';
import common from '../../messages';
import { useTrainingsAccess } from '../../permissions';
import { cardStyle, formatDate, formatDateTime, formatPct } from '../../utils';

import messages from './messages';
import { OverrideRecheckDialog, RecheckToOverride, RegisterWithTrainerDialog } from './RecheckDialogs';

/** The flagged-items review from the sync review stack; it lists flagged sync items */
const SYNC_REVIEW = '/sync-review';

const VIEWS = ['waiting', 'all'] as const;
type View = (typeof VIEWS)[number];

type Msg = { id: string; defaultMessage: string };

/** Columns both views share: student, training, score, tester (with the window) */
function useBaseColumns(): GridColDef<RecheckRow>[] {
  const intl = useIntl();
  return useMemo(
    () => [
      {
        field: 'studentName',
        headerName: intl.formatMessage(messages.student),
        flex: 1,
        minWidth: 170,
        sortable: false,
        renderCell: ({ row }) => (
          <Stack sx={{ py: 0.75, lineHeight: 1.2 }}>
            <Typography
              variant="body2"
              component={Link}
              href={routes.trainings.student(row.studentId)}
              sx={{
                fontWeight: 600,
                color: 'inherit',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {row.studentName}
            </Typography>
            <Typography variant="caption" color="text.secondary" dir="ltr">
              {row.grNumber}
            </Typography>
          </Stack>
        ),
      },
      {
        field: 'training',
        headerName: intl.formatMessage(common.training),
        width: 130,
        sortable: false,
        valueGetter: (_v, row) => `${row.code} · ${row.name}`,
      },
      {
        field: 'score',
        headerName: intl.formatMessage(messages.score),
        width: 130,
        sortable: false,
        renderCell: ({ row }) => (
          <Stack sx={{ py: 0.75, lineHeight: 1.2 }}>
            <Typography variant="body2" color={row.passed ? 'success.dark' : 'error.main'} sx={{ fontWeight: 600 }}>
              {intl.formatMessage(messages.scoreLine, {
                marks: row.marks,
                max: row.maxMarks,
                pct: formatPct(row.scorePct),
              })}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {intl.formatMessage(messages.passMarks, { pass: row.passMarks })}
            </Typography>
          </Stack>
        ),
      },
      {
        field: 'testerName',
        headerName: intl.formatMessage(common.tester),
        width: 140,
        sortable: false,
        renderCell: ({ row }) => (
          <Stack sx={{ py: 0.75, lineHeight: 1.2 }}>
            <Typography variant="body2">{row.testerName ?? '--'}</Typography>
            {row.windowName && (
              <Typography variant="caption" color="text.secondary">
                {row.windowName}
              </Typography>
            )}
          </Stack>
        ),
      },
    ],
    [intl],
  );
}

/** Failed rechecks with no trainer: register the student with one, by default their last trainer */
function WaitingForTrainer() {
  const intl = useIntl();
  const t = (m: Msg) => intl.formatMessage(m);
  const { canManage } = useTrainingsAccess();
  const { filters, handlePaginationModelChange } = useListingFilters<Record<string, string>>();
  const base = useBaseColumns();
  const [registering, setRegistering] = useState<RecheckRow | null>(null);

  const { data, isLoading, error } = useRechecks({
    awaitingTraining: true,
    sessionId: filters.sessionId,
    trainingId: filters.trainingId,
    skip: filters.page * filters.pageSize,
    take: Math.min(filters.pageSize, 100),
  });
  const rows = useMemo(() => data?.data ?? [], [data]);

  // One registration covers every training the student needs to train, so the dialog lists them all
  const student = useMemo(
    () =>
      registering
        ? {
            grNumber: registering.grNumber,
            studentName: registering.studentName,
            rows: rows.filter((r) => r.studentId === registering.studentId),
          }
        : null,
    [registering, rows],
  );

  const columns: GridColDef<RecheckRow>[] = useMemo(
    () => [
      ...base,
      {
        field: 'testedAt',
        headerName: t(messages.testedAt),
        width: 110,
        sortable: false,
        valueGetter: (_v, row) => formatDate(row.testedAt),
      },
      {
        field: 'lastTrainerName',
        headerName: t(messages.lastTrainer),
        width: 150,
        sortable: false,
        renderCell: ({ row }) =>
          row.lastTrainerName ?? (
            <Typography variant="body2" color="text.secondary" component="span">
              {t(messages.lastTrainerNone)}
            </Typography>
          ),
      },
      {
        field: 'sessionName',
        headerName: t(common.session),
        width: 120,
        sortable: false,
        valueGetter: (_v, row) => row.sessionName ?? '',
      },
      ...(canManage
        ? [
            {
              field: 'actions',
              headerName: '',
              width: 120,
              sortable: false,
              renderCell: ({ row }) => (
                <Stack direction="row" alignItems="center" sx={{ height: '100%' }}>
                  <Button size="small" variant="outlined" onClick={() => setRegistering(row)}>
                    {t(messages.registerShort)}
                  </Button>
                </Stack>
              ),
            } satisfies GridColDef<RecheckRow>,
          ]
        : []),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [intl, base, canManage],
  );

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        <FormattedMessage {...messages.waitingHelp} />
      </Typography>
      <Card sx={cardStyle}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap" alignItems="flex-start">
            <SessionFilter minWidth={180} />
            <TrainingFilter />
          </Stack>
        </CardContent>
      </Card>
      {!!error && (
        <Alert severity="error">
          <FormattedMessage {...common.loadError} />: {extractNetworkError(error)}
        </Alert>
      )}
      <DataTable<RecheckRow>
        pagination
        columns={columns}
        rows={rows}
        rowCount={data?.count ?? 0}
        getRowId={(row) => row.recheckId}
        isLoading={isLoading}
        paginationMode="server"
        paginationModel={{ page: filters.page, pageSize: filters.pageSize }}
        onPaginationModelChange={handlePaginationModelChange}
        pageSizeOptions={RECHECKS_PAGE_SIZES}
        disableColumnFilter
        disableColumnMenu
        showPointer={false}
        getRowHeight={() => 'auto'}
        noDataFound={t(messages.noWaiting)}
      />
      {canManage && <RegisterWithTrainerDialog student={student} onClose={() => setRegistering(null)} />}
    </Stack>
  );
}

/** Every recheck, filtered by session, training, result, flags, window, tester and dates; admins can change marks */
function AllRechecks() {
  const intl = useIntl();
  const t = (m: Msg) => intl.formatMessage(m);
  const { canOverride } = useTrainingsAccess();
  const { filters, setFilter, handlePaginationModelChange } = useListingFilters<Record<string, string>>();
  const { current } = useSessions();
  const base = useBaseColumns();
  const [overriding, setOverriding] = useState<RecheckToOverride | null>(null);

  // Start on the current session
  useEffect(() => {
    if (!filters.sessionId && current) setFilter({ sessionId: current.id });
  }, [filters.sessionId, current, setFilter]);

  const { data: windowsData } = useWindows({ sessionId: filters.sessionId, take: 100 });
  const { data, isLoading, error } = useRechecks(
    {
      sessionId: filters.sessionId,
      trainingId: filters.trainingId,
      passed: filters.passed === 'true' ? true : filters.passed === 'false' ? false : undefined,
      lateGrade: filters.lateGrade === 'true' ? true : undefined,
      overridden: filters.overridden === 'true' ? true : undefined,
      windowId: filters.windowId,
      testerStaffUserId: filters.tester,
      from: filters.from,
      to: filters.to,
      skip: filters.page * filters.pageSize,
      take: Math.min(filters.pageSize, 100),
    },
    !!filters.sessionId,
  );

  const columns: GridColDef<RecheckRow>[] = useMemo(
    () => [
      {
        field: 'testedAt',
        headerName: t(messages.testedAt),
        width: 150,
        sortable: false,
        valueGetter: (_v, row) => formatDateTime(row.testedAt),
      },
      ...base,
      {
        field: 'flags',
        headerName: t(messages.flags),
        flex: 1,
        minWidth: 180,
        sortable: false,
        renderCell: ({ row }) => (
          <Stack sx={{ py: 0.75 }} spacing={0.5} alignItems="flex-start">
            {!row.passed && (
              <Chip
                size="small"
                variant="outlined"
                color={row.retrainEnrollmentId ? 'info' : 'error'}
                label={t(row.retrainEnrollmentId ? messages.inTraining : messages.waiting)}
              />
            )}
            {row.lateGrade && <Chip size="small" color="warning" variant="outlined" label={t(messages.lateFlag)} />}
            {row.overridden && (
              <Typography variant="caption" color="warning.dark">
                {intl.formatMessage(messages.overriddenFlag, {
                  name: row.overriddenByName ?? t(common.admin),
                  reason: row.overrideReason ?? '',
                })}
              </Typography>
            )}
            {row.comment && (
              <Typography variant="caption" color="text.secondary">
                {row.comment}
              </Typography>
            )}
          </Stack>
        ),
      },
      {
        field: 'links',
        headerName: '',
        width: 140,
        sortable: false,
        renderCell: ({ row }) => (
          <Stack spacing={0.25} alignItems="flex-start" sx={{ py: 0.5 }}>
            {canOverride && (
              <Button size="small" color="warning" onClick={() => setOverriding(row)}>
                {t(messages.overrideMarks)}
              </Button>
            )}
            {row.retrainEnrollmentId && (
              <Button size="small" component={Link} href={routes.trainings.enrollment(row.retrainEnrollmentId)}>
                {t(messages.openEnrollment)}
              </Button>
            )}
            {row.syncItemId && (
              <Button size="small" component={Link} href={`${SYNC_REVIEW}?item=${row.syncItemId}`}>
                {t(messages.openSyncItem)}
              </Button>
            )}
          </Stack>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [intl, base, canOverride],
  );

  const yes = [{ value: 'true', label: t(messages.onlyThese) }];

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        <FormattedMessage {...messages.allHelp} />
      </Typography>
      <Card sx={cardStyle}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap" alignItems="flex-start">
            <SessionFilter minWidth={180} />
            <TrainingFilter />
            <UrlSelect
              param="passed"
              label={t(messages.result)}
              options={[
                { value: 'true', label: t(messages.passed) },
                { value: 'false', label: t(messages.failed) },
              ]}
            />
            <UrlSelect param="lateGrade" label={t(messages.late)} options={yes} />
            <UrlSelect param="overridden" label={t(messages.overridden)} options={yes} />
            <UrlSelect
              param="windowId"
              label={t(messages.window)}
              options={(windowsData?.data ?? []).map((w) => ({ value: w.id, label: w.name }))}
            />
            <StaffFilter param="tester" role={StaffRole.TESTER} label={t(common.tester)} />
            <UrlDateFilter param="from" label={t(messages.from)} />
            <UrlDateFilter param="to" label={t(messages.to)} />
          </Stack>
        </CardContent>
      </Card>
      {!!error && (
        <Alert severity="error">
          <FormattedMessage {...common.loadError} />: {extractNetworkError(error)}
        </Alert>
      )}
      <DataTable<RecheckRow>
        pagination
        columns={columns}
        rows={data?.data ?? []}
        rowCount={data?.count ?? 0}
        getRowId={(row) => row.recheckId}
        isLoading={isLoading}
        paginationMode="server"
        paginationModel={{ page: filters.page, pageSize: filters.pageSize }}
        onPaginationModelChange={handlePaginationModelChange}
        pageSizeOptions={RECHECKS_PAGE_SIZES}
        disableColumnFilter
        disableColumnMenu
        showPointer={false}
        getRowHeight={() => 'auto'}
        noDataFound={t(messages.noRows)}
      />
      {canOverride && <OverrideRecheckDialog recheck={overriding} onClose={() => setOverriding(null)} />}
    </Stack>
  );
}

/** Rechecks: failed ones waiting for a trainer, and every recheck with its filters */
export function RechecksView() {
  const intl = useIntl();
  const { filters, setFilter } = useListingFilters<Record<string, string>>();
  const view: View = VIEWS.includes(filters.view as View) ? (filters.view as View) : 'waiting';

  return (
    <Stack spacing={2}>
      <Tabs
        value={view}
        onChange={(_, v) => setFilter({ view: v, page: 0 })}
        variant="scrollable"
        scrollButtons="auto"
        // The second row of tabs on the page: a step smaller than the trainings tabs above it.
        sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0.75, fontSize: '0.875rem' } }}
      >
        {VIEWS.map((v) => (
          <Tab key={v} value={v} label={intl.formatMessage(messages[v])} />
        ))}
      </Tabs>
      {view === 'waiting' ? <WaitingForTrainer /> : <AllRechecks />}
    </Stack>
  );
}
