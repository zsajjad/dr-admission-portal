'use client';

import { useMemo, useState } from 'react';

import { useIntl } from 'react-intl';

import { Add as AddIcon, PlayArrow as RunIcon } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';

import { AreaFilter } from '@/components/AreaFilter';
import { BranchFilter } from '@/components/BranchFilter';
import { DataTable } from '@/components/DataTable';
import { GenderFilter } from '@/components/GenderFilter';
import { SessionFilter } from '@/components/SessionFilter';

import { StaffRole } from '@/providers/service/app.schemas';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { useListingFilters } from '@/hooks/useListingFilters';

import { routes } from '@/router/routes';

import { extractNetworkError } from '@/utils/extractNetworkError';

import {
  ENROLLMENT_STATES,
  EnrollmentFilters,
  EnrollmentListItem,
  EnrollmentState,
  useEnrollments,
  useRunAutoClose,
} from '../../api/operations';
import { CourseFilter, StaffFilter, UrlSelect, UrlTextFilter } from '../../components/Filters';
import { PayoutChip } from '../../components/PayoutChip';
import { useStaffNames } from '../../components/StaffUserSelect';
import { StateChip } from '../../components/StateChip';
import { useSessions } from '../../components/useCurrentSession';
import { useNotify } from '../../components/useNotify';
import common from '../../messages';
import { useTrainingsAccess } from '../../permissions';
import { cardStyle, formatAmount, formatDate, formatPct } from '../../utils';

import { EnrollDialog } from './EnrollDialog';
import messages from './messages';

const FILTER_KEYS = [
  'sessionId',
  'state',
  'courseId',
  'trainer',
  'tester',
  'branchId',
  'areaId',
  'gender',
  'q',
  'stuckDays',
] as const;

/** Every enrollment, with the contract's filters plus "stuck for N days" */
export function EnrollmentList() {
  const { canManage } = useTrainingsAccess();
  const notify = useNotify();
  const { filters, setFilter, handlePaginationModelChange } = useListingFilters<Record<string, string>>();
  const [enrollOpen, setEnrollOpen] = useState(false);
  const runAutoClose = useRunAutoClose();

  const intl = useIntl();
  const text = useMemo(() => {
    const t = (m: { id: string; defaultMessage: string }) => intl.formatMessage(m);
    return {
      gr: t(messages.grNumber),
      student: t(messages.student),
      course: t(common.course),
      state: t(messages.state),
      trainer: t(common.trainer),
      tester: t(common.tester),
      attempts: t(messages.attempts),
      best: t(messages.bestPct),
      payout: t(messages.payout),
      enrolled: t(messages.enrolled_col),
      autoCloseAt: t(messages.autoCloseAt),
      unassigned: t(common.unassigned),
      noRows: t(messages.noEnrollments),
      states: Object.fromEntries(ENROLLMENT_STATES.map((st) => [st, t(common[st])])) as Record<EnrollmentState, string>,
    };
  }, [intl]);

  const params: EnrollmentFilters = {
    sessionId: filters.sessionId,
    state: filters.state as EnrollmentState | undefined,
    courseId: filters.courseId,
    trainerStaffUserId: filters.trainer,
    testerStaffUserId: filters.tester,
    branchId: filters.branchId,
    areaId: filters.areaId,
    gender: filters.gender as EnrollmentFilters['gender'],
    q: filters.q,
    stuckDays: filters.stuckDays ? Number(filters.stuckDays) : undefined,
    skip: filters.page * filters.pageSize,
    take: filters.pageSize,
  };
  const { data, isLoading, error } = useEnrollments(params);
  const hasFilters = FILTER_KEYS.some((k) => filters[k]);
  const staffName = useStaffNames();
  const { sessions } = useSessions();

  const columns: GridColDef<EnrollmentListItem>[] = useMemo(
    () => [
      {
        field: 'grNumber',
        headerName: text.gr,
        width: 170,
        sortable: false,
        renderCell: ({ row }) => (
          <Box component="span" sx={{ fontFamily: 'monospace' }} dir="ltr">
            {row.grNumber}
          </Box>
        ),
      },
      {
        field: 'name',
        headerName: text.student,
        flex: 1.2,
        minWidth: 180,
        sortable: false,
        renderCell: ({ row }) => (
          <Stack sx={{ py: 0.75, lineHeight: 1.2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {[row.branchCode, row.classLevelCode, sessions.find((x) => x.id === row.sessionId)?.name]
                .filter(Boolean)
                .join(' · ')}
            </Typography>
          </Stack>
        ),
      },
      {
        field: 'course',
        headerName: text.course,
        width: 90,
        sortable: false,
        valueGetter: (_v, row) => row.course.code,
      },
      {
        field: 'state',
        headerName: text.state,
        width: 150,
        sortable: false,
        renderCell: ({ row }) => <StateChip state={row.state} closureReason={row.closureReason} />,
      },
      {
        field: 'trainer',
        headerName: text.trainer,
        flex: 1,
        minWidth: 140,
        sortable: false,
        renderCell: ({ row }) =>
          row.trainerName ?? (
            <Typography variant="body2" color="warning.dark" component="span">
              {text.unassigned}
            </Typography>
          ),
      },
      {
        field: 'tester',
        headerName: text.tester,
        flex: 0.8,
        minWidth: 120,
        sortable: false,
        valueGetter: (_v, row) => staffName(row.testerStaffUserId) ?? '',
      },
      {
        field: 'attemptsUsed',
        headerName: text.attempts,
        width: 90,
        sortable: false,
        align: 'center',
        headerAlign: 'center',
      },
      {
        field: 'bestPct',
        headerName: text.best,
        width: 90,
        sortable: false,
        align: 'right',
        headerAlign: 'right',
        valueGetter: (_v, row) => formatPct(row.bestPct),
      },
      {
        field: 'payout',
        headerName: text.payout,
        width: 150,
        sortable: false,
        renderCell: ({ row }) =>
          row.payout.amount === null ? (
            '--'
          ) : (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%' }}>
              <span>{formatAmount(row.payout.amount)}</span>
              <PayoutChip status={row.payout.status} />
            </Stack>
          ),
      },
      {
        field: 'createdAt',
        headerName: text.enrolled,
        width: 120,
        sortable: false,
        valueGetter: (_v, row) => formatDate(row.createdAt),
      },
      {
        field: 'autoCloseAt',
        headerName: text.autoCloseAt,
        width: 120,
        sortable: false,
        valueGetter: (_v, row) => (row.state === 'CLOSED' ? '' : formatDate(row.autoCloseAt)),
      },
    ],
    [text, staffName, sessions],
  );

  const handleRunAutoClose = () =>
    runAutoClose.mutate(undefined, {
      onSuccess: (res) =>
        notify.success(
          intl.formatMessage(messages.autoCloseDone, { closed: res?.closed ?? 0, reminded: res?.reminded ?? 0 }),
        ),
      onError: notify.error,
    });

  return (
    <Stack spacing={2}>
      <Card sx={cardStyle}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap" alignItems="flex-start">
            <UrlTextFilter param="q" label={<FormattedMessage {...messages.search} />} />
            <SessionFilter minWidth={180} />
            <UrlSelect
              param="state"
              label={<FormattedMessage {...messages.state} />}
              options={ENROLLMENT_STATES.map((s) => ({ value: s, label: text.states[s] }))}
            />
            <CourseFilter />
            <StaffFilter param="trainer" role={StaffRole.TRAINER} label={<FormattedMessage {...common.trainer} />} />
            <StaffFilter param="tester" role={StaffRole.TESTER} label={<FormattedMessage {...common.tester} />} />
            <BranchFilter minWidth={180} resetFiltersOnChange={['areaId']} />
            <AreaFilter minWidth={180} />
            <GenderFilter minWidth={130} />
            <UrlTextFilter
              param="stuckDays"
              type="number"
              minWidth={150}
              label={<FormattedMessage {...messages.stuckDays} />}
              helperText={<FormattedMessage {...messages.stuckDaysHelp} />}
            />
            {hasFilters && (
              <Button
                size="small"
                sx={{ mt: 0.75 }}
                onClick={() => setFilter(Object.fromEntries(FILTER_KEYS.map((k) => [k, undefined])))}
              >
                <FormattedMessage {...messages.clearFilters} />
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      {canManage && (
        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button
            variant="outlined"
            startIcon={<RunIcon />}
            onClick={handleRunAutoClose}
            disabled={runAutoClose.isPending}
          >
            <FormattedMessage {...messages.runAutoClose} />
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setEnrollOpen(true)}>
            <FormattedMessage {...messages.enroll} />
          </Button>
        </Stack>
      )}

      {!!error && (
        <Alert severity="error">
          <FormattedMessage {...common.loadError} />: {extractNetworkError(error)}
        </Alert>
      )}

      <DataTable<EnrollmentListItem>
        pagination
        columns={columns}
        rows={data?.data ?? []}
        rowCount={data?.count ?? 0}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        paginationMode="server"
        paginationModel={{ page: filters.page, pageSize: filters.pageSize }}
        onPaginationModelChange={handlePaginationModelChange}
        pageSizeOptions={[20, 50, 100]}
        disableColumnFilter
        disableColumnMenu
        getRowHeight={() => 'auto'}
        noDataFound={text.noRows}
        rowClickUrl={(row) => routes.trainings.enrollment(row.id)}
      />

      {canManage && <EnrollDialog open={enrollOpen} onClose={() => setEnrollOpen(false)} />}
    </Stack>
  );
}
