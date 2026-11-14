'use client';

import { useEffect, useMemo } from 'react';

import { useIntl } from 'react-intl';

import Link from 'next/link';

import { Alert, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';

import { DataTable } from '@/components/DataTable';
import { SessionFilter } from '@/components/SessionFilter';

import { StaffRole } from '@/providers/service/app.schemas';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { useListingFilters } from '@/hooks/useListingFilters';

import { routes } from '@/router/routes';

import { extractNetworkError } from '@/utils/extractNetworkError';

import { AttemptRow, useAttemptsToReview } from '../../api/operations';
import { useWindows } from '../../api/setup';
import { StaffFilter, UrlDateFilter, UrlSelect } from '../../components/Filters';
import { useSessions } from '../../components/useCurrentSession';
import common from '../../messages';
import { cardStyle, formatDateTime, formatPct } from '../../utils';

import messages from './messages';

/** The flagged-items review from the sync review stack; it lists flagged sync items */
const SYNC_REVIEW = '/sync-review';

/** Late grades and changed marks, filtered by window, tester and dates, linked to their enrollment */
export function GradesReview() {
  const intl = useIntl();
  const t = (m: { id: string; defaultMessage: string }) => intl.formatMessage(m);
  const { filters, setFilter, handlePaginationModelChange } = useListingFilters<Record<string, string>>();
  const { current } = useSessions();

  // Start on the current session, showing late grades
  useEffect(() => {
    if (!filters.sessionId && current) setFilter({ sessionId: current.id, lateGrade: filters.lateGrade ?? 'true' });
  }, [filters.sessionId, filters.lateGrade, current, setFilter]);

  const { data: windowsData } = useWindows({ sessionId: filters.sessionId, take: 100 });
  const { data, isLoading, error } = useAttemptsToReview({
    sessionId: filters.sessionId,
    lateGrade: filters.lateGrade === 'true' ? true : undefined,
    overridden: filters.overridden === 'true' ? true : undefined,
    windowId: filters.windowId,
    testerStaffUserId: filters.tester,
    from: filters.from,
    to: filters.to,
    skip: filters.page * filters.pageSize,
    take: filters.pageSize,
  });

  const columns: GridColDef<AttemptRow>[] = useMemo(
    () => [
      {
        field: 'testedAt',
        headerName: t(messages.testedAt),
        width: 170,
        sortable: false,
        valueGetter: (_v, row) => formatDateTime(row.testedAt),
      },
      {
        field: 'name',
        headerName: t(messages.student),
        flex: 1,
        minWidth: 180,
        sortable: false,
        renderCell: ({ row }) => (
          <Stack sx={{ py: 0.75, lineHeight: 1.2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" dir="ltr">
              {row.grNumber}
            </Typography>
          </Stack>
        ),
      },
      { field: 'attemptNo', headerName: t(messages.attempt), width: 80, sortable: false, align: 'center' },
      {
        field: 'testerName',
        headerName: t(common.tester),
        width: 150,
        sortable: false,
        valueGetter: (_v, row) => row.testerName ?? '',
      },
      {
        field: 'windowName',
        headerName: t(messages.window),
        width: 140,
        sortable: false,
        valueGetter: (_v, row) => row.windowName ?? '',
      },
      {
        field: 'marks',
        headerName: t(messages.marks),
        flex: 1,
        minWidth: 160,
        sortable: false,
        valueGetter: (_v, row) =>
          row.marks.map((m) => `${m.marks}/${m.maxMarks} (${formatPct(m.scorePct)})`).join(', '),
      },
      {
        field: 'flags',
        headerName: t(messages.flags),
        flex: 1,
        minWidth: 200,
        sortable: false,
        renderCell: ({ row }) => (
          <Stack sx={{ py: 0.75 }} spacing={0.5} alignItems="flex-start">
            {row.lateGrade && <Chip size="small" color="warning" variant="outlined" label={t(messages.lateFlag)} />}
            {row.overridden && (
              <Typography variant="caption" color="warning.dark">
                {intl.formatMessage(messages.overriddenFlag, {
                  name: row.overriddenByName ?? t(common.admin),
                  reason: row.overrideReason ?? '',
                })}
              </Typography>
            )}
          </Stack>
        ),
      },
      {
        field: 'links',
        headerName: '',
        width: 200,
        sortable: false,
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ height: '100%' }}>
            <Button size="small" component={Link} href={routes.trainings.enrollment(row.enrollmentId)}>
              {t(messages.openEnrollment)}
            </Button>
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
    [intl],
  );

  const yes = [{ value: 'true', label: t(messages.yes) }];

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        <FormattedMessage {...messages.help} />
      </Typography>
      <Card sx={cardStyle}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap" alignItems="flex-start">
            <SessionFilter minWidth={180} />
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
      <DataTable<AttemptRow>
        pagination
        columns={columns}
        rows={data?.data ?? []}
        rowCount={data?.count ?? 0}
        getRowId={(row) => row.attemptId}
        isLoading={isLoading}
        paginationMode="server"
        paginationModel={{ page: filters.page, pageSize: filters.pageSize }}
        onPaginationModelChange={handlePaginationModelChange}
        pageSizeOptions={[20, 50, 100]}
        disableColumnFilter
        disableColumnMenu
        showPointer={false}
        getRowHeight={() => 'auto'}
        noDataFound={t(messages.noRows)}
      />
    </Stack>
  );
}
