'use client';

import { useMemo, useState } from 'react';

import { useIntl } from 'react-intl';

import Link from 'next/link';

import { DoneAll as ReviewIcon, Undo as ReopenIcon } from '@mui/icons-material';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { GridColDef, GridPaginationModel, GridRowSelectionModel } from '@mui/x-data-grid';

import { useAllStaffUsers } from '@/domains/staffUsers/hooks/useAllStaffUsers';
import { cardStyle, formatDateTime } from '@/domains/students/utils';

import { DataTable } from '@/components/DataTable';
import { PageHeading } from '@/components/PageHeading';

import { StaffSyncFlagReason, StaffSyncReviewItem, StaffUserEntity } from '@/providers/service/app.schemas';
import { useStaffSyncReviewControllerFindAll } from '@/providers/service/staff-sync-review/staff-sync-review';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import { routes } from '@/router/routes';

import { extractNetworkError } from '@/utils/extractNetworkError';

import { ItemDialog } from '../dialogs/ItemDialog';
import { ReviewDialog } from '../dialogs/ReviewDialog';
import { useDescribeItem } from '../hooks/useDescribeItem';
import messages from '../messages';

const REASONS: StaffSyncFlagReason[] = [StaffSyncFlagReason.SENT_AFTER_LOGOUT, StaffSyncFlagReason.LATE_DAY];
const emptySelection = (): GridRowSelectionModel => ({ type: 'include', ids: new Set() });

/**
 * Staff app work the server flagged on sync: sent after the phone was logged out, or attendance
 * for an earlier day. It was saved when it arrived; admins check it and mark it reviewed.
 */
export function SyncReviewView() {
  const [tab, setTab] = useState<'todo' | 'done'>('todo');
  const [flagReason, setFlagReason] = useState<StaffSyncFlagReason | ''>('');
  const [staffUser, setStaffUser] = useState<StaffUserEntity | null>(null);
  const [pagination, setPagination] = useState<GridPaginationModel>({ page: 0, pageSize: 50 });
  const [selection, setSelection] = useState<GridRowSelectionModel>(emptySelection);
  const [dialog, setDialog] = useState<'review' | null>(null);
  const [open, setOpen] = useState<StaffSyncReviewItem | null>(null);
  const describe = useDescribeItem();
  const intl = useIntl();
  const { data: staff } = useAllStaffUsers({ includeInActive: true });

  const reviewed = tab === 'done';
  const { data, isLoading, isError, error } = useStaffSyncReviewControllerFindAll({
    reviewed,
    flagReason: flagReason || undefined,
    staffUserId: staffUser?.id,
    skip: pagination.page * pagination.pageSize,
    take: pagination.pageSize,
  });
  const selected = [...selection.ids].map(String);

  const resetPage = () => {
    setPagination((p) => ({ ...p, page: 0 }));
    setSelection(emptySelection());
  };

  const text = {
    received: useFormattedMessage(messages.colReceived),
    what: useFormattedMessage(messages.colWhat),
    why: useFormattedMessage(messages.colWhy),
    who: useFormattedMessage(messages.colWho),
    phone: useFormattedMessage(messages.colPhone),
    madeAt: useFormattedMessage(messages.colMadeAt),
    reviewedCol: useFormattedMessage(messages.colReviewed),
    staffFilter: useFormattedMessage(messages.staffFilter),
    noRows: useFormattedMessage(reviewed ? messages.noRowsReviewed : messages.noRowsToReview),
  };

  const columns: GridColDef<StaffSyncReviewItem>[] = useMemo(
    () => [
      {
        field: 'receivedAt',
        headerName: text.received,
        width: 170,
        sortable: false,
        valueGetter: (_, row) => formatDateTime(row.receivedAt),
      },
      {
        field: 'type',
        headerName: text.what,
        flex: 1.4,
        minWidth: 240,
        sortable: false,
        valueGetter: (_, row) => describe(row),
      },
      {
        field: 'flagReason',
        headerName: text.why,
        width: 160,
        sortable: false,
        renderCell: ({ row }) => (
          <Tooltip title={intl.formatMessage(messages[`reason${row.flagReason}Hint`])}>
            <Chip
              size="small"
              variant="outlined"
              color={row.flagReason === StaffSyncFlagReason.SENT_AFTER_LOGOUT ? 'warning' : 'info'}
              label={<FormattedMessage {...messages[`reason${row.flagReason}`]} />}
            />
          </Tooltip>
        ),
      },
      {
        field: 'staffUser',
        headerName: text.who,
        flex: 1,
        minWidth: 170,
        sortable: false,
        renderCell: ({ row }) => (
          <Link href={routes.staffUsers.detail(row.staffUser.id)} onClick={(e) => e.stopPropagation()}>
            {row.staffUser.name} · {row.staffUser.staffId}
          </Link>
        ),
      },
      {
        field: 'device',
        headerName: text.phone,
        flex: 1,
        minWidth: 180,
        sortable: false,
        renderCell: ({ row }) => (
          <Box sx={{ lineHeight: 1.3, py: 0.75 }}>
            <Typography variant="body2">{row.device?.label ?? <FormattedMessage {...messages.phoneGone} />}</Typography>
            {row.device?.revokedAt && (
              <Typography variant="caption" color="text.secondary">
                <FormattedMessage
                  {...messages.phoneLoggedOut}
                  values={{ date: formatDateTime(row.device.revokedAt) }}
                />
                {row.device.discardUnsent && (
                  <>
                    {' · '}
                    <FormattedMessage {...messages.phoneDiscarded} />
                  </>
                )}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        field: 'clientTime',
        headerName: text.madeAt,
        width: 170,
        sortable: false,
        valueGetter: (_, row) => formatDateTime(row.clientTime),
      },
      ...(reviewed
        ? [
            {
              field: 'reviewedAt',
              headerName: text.reviewedCol,
              flex: 1,
              minWidth: 200,
              sortable: false,
              valueGetter: (_: unknown, row: StaffSyncReviewItem) =>
                [
                  intl.formatMessage(messages.reviewedBy, {
                    name: row.reviewedBy?.name ?? '?',
                    date: formatDateTime(row.reviewedAt),
                  }),
                  row.reviewNote,
                ]
                  .filter(Boolean)
                  .join(' · '),
            } satisfies GridColDef<StaffSyncReviewItem>,
          ]
        : []),
    ],
    [text.received, text.what, text.why, text.who, text.phone, text.madeAt, text.reviewedCol, reviewed, describe, intl],
  );

  return (
    <Stack>
      <PageHeading heading={messages.title} />

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        <FormattedMessage {...messages.intro} />
      </Typography>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ md: 'center' }}
        sx={{ ...cardStyle, bgcolor: 'background.paper', px: 2, py: 1, mb: 2 }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => {
            setTab(v);
            resetPage();
          }}
        >
          <Tab value="todo" label={<FormattedMessage {...messages.toReview} />} />
          <Tab value="done" label={<FormattedMessage {...messages.reviewed} />} />
        </Tabs>
        <Box sx={{ flex: 1 }} />
        <TextField
          select
          size="small"
          sx={{ minWidth: 200 }}
          label={<FormattedMessage {...messages.reasonFilter} />}
          value={flagReason}
          onChange={(e) => {
            setFlagReason(e.target.value as StaffSyncFlagReason | '');
            resetPage();
          }}
        >
          <MenuItem value="">
            <FormattedMessage {...messages.allReasons} />
          </MenuItem>
          {REASONS.map((r) => (
            <MenuItem key={r} value={r}>
              <FormattedMessage {...messages[`reason${r}`]} />
            </MenuItem>
          ))}
        </TextField>
        <Autocomplete<StaffUserEntity, false>
          size="small"
          sx={{ minWidth: 240 }}
          options={staff || []}
          value={staffUser}
          getOptionLabel={(o) => `${o.name} · ${o.staffId}`}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          onChange={(_, v) => {
            setStaffUser(v);
            resetPage();
          }}
          renderInput={(params) => <TextField {...params} label={text.staffFilter} />}
        />
      </Stack>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {extractNetworkError(error)}
        </Alert>
      )}

      {selected.length > 0 && (
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ ...cardStyle, bgcolor: 'background.paper', px: 2, py: 1, mb: 2 }}
        >
          <Typography variant="body2">
            <FormattedMessage {...messages.selected} values={{ count: String(selected.length) }} />
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={reviewed ? <ReopenIcon /> : <ReviewIcon />}
            onClick={() => setDialog('review')}
          >
            <FormattedMessage {...(reviewed ? messages.backToReview : messages.markReviewed)} />
          </Button>
        </Stack>
      )}

      <DataTable<StaffSyncReviewItem>
        columns={columns}
        rows={data?.data || []}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        rowCount={data?.count ?? 0}
        paginationMode="server"
        paginationModel={pagination}
        onPaginationModelChange={setPagination}
        pageSizeOptions={[50, 100]}
        checkboxSelection
        keepNonExistentRowsSelected
        disableRowSelectionOnClick
        rowSelectionModel={selection}
        onRowSelectionModelChange={setSelection}
        onRowClick={(params, event) => {
          if ((event.target as HTMLElement).closest('.MuiDataGrid-cellCheckbox, a')) return;
          setOpen(params.row as StaffSyncReviewItem);
        }}
        getRowHeight={() => 'auto'}
        noDataFound={text.noRows}
        disableColumnFilter
      />

      <ReviewDialog
        open={dialog === 'review'}
        ids={selected}
        reviewed={!reviewed}
        onClose={() => setDialog(null)}
        onDone={() => setSelection(emptySelection())}
      />
      <ItemDialog item={open} onClose={() => setOpen(null)} />
    </Stack>
  );
}
