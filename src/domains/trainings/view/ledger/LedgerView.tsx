'use client';

import { useMemo, useState } from 'react';

import { useIntl } from 'react-intl';

import Link from 'next/link';

import {
  Add as AddIcon,
  DoneAll as ApproveIcon,
  FileDownload as ExportIcon,
  Payments as PayIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';

import { DataTable } from '@/components/DataTable';

import { StaffRole } from '@/providers/service/app.schemas';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { useListingFilters } from '@/hooks/useListingFilters';

import { routes } from '@/router/routes';

import { downloadBlob } from '@/utils/downloadFile';
import { extractNetworkError } from '@/utils/extractNetworkError';

import {
  exportLedger,
  LEDGER_KINDS,
  LEDGER_STATUSES,
  LedgerEntry,
  LedgerFilters,
  payableEntryIds,
  TrainerTotals,
  useApproveEntries,
  useLedger,
  useLedgerTrainers,
} from '../../api/ledger';
import { ActionDialog } from '../../components/ActionDialog';
import { StaffFilter, UrlDateFilter, UrlSelect } from '../../components/Filters';
import { LedgerKindLabel, LedgerStatusChip } from '../../components/LedgerChips';
import { Section } from '../../components/Section';
import { useStaffNames } from '../../components/StaffUserSelect';
import { useNotify } from '../../components/useNotify';
import common from '../../messages';
import { useTrainingsAccess } from '../../permissions';
import { cardStyle, formatAmount, formatDate, formatDateTime } from '../../utils';

import { AdhocDialog, AdjustmentDialog, PaymentDialog, VoidDialog } from './LedgerDialogs';
import messages from './messages';

const TOTAL_KEYS = ['projected', 'awaitingApproval', 'approved', 'paid', 'due'] as const;
const FILTER_KEYS = ['trainer', 'kind', 'status', 'from', 'to'] as const;

/** Rows picked in the grid; "exclude" means every row on the page except those listed */
function selectedIds(model: GridRowSelectionModel, rows: LedgerEntry[]): string[] {
  const payable = rows.filter((r) => r.status === 'PAYABLE').map((r) => r.id);
  return model.type === 'include'
    ? payable.filter((id) => model.ids.has(id))
    : payable.filter((id) => !model.ids.has(id));
}

/** Per-trainer totals, the entries, approvals, payments, adjustments, voids and the CSV export */
export function LedgerView() {
  const intl = useIntl();
  const notify = useNotify();
  const { canPayouts } = useTrainingsAccess();
  const staffName = useStaffNames();
  const { filters, setFilter, handlePaginationModelChange } = useListingFilters<Record<string, string>>();
  const params: LedgerFilters = {
    trainerStaffUserId: filters.trainer,
    kind: filters.kind as LedgerFilters['kind'],
    status: filters.status as LedgerFilters['status'],
    from: filters.from,
    to: filters.to,
    skip: filters.page * filters.pageSize,
    take: filters.pageSize,
  };

  const { data: totalsData, isLoading: totalsLoading } = useLedgerTrainers({ from: params.from, to: params.to });
  const { data, isLoading, error } = useLedger(params);
  const approve = useApproveEntries();
  const rows = useMemo(() => data?.data ?? [], [data]);
  const totals = useMemo(() => totalsData?.data ?? [], [totalsData]);

  const [selection, setSelection] = useState<GridRowSelectionModel>({ type: 'include', ids: new Set() });
  const [approving, setApproving] = useState<{ ids: string[]; amount: number } | null>(null);
  const [payment, setPayment] = useState<{ trainerId?: string } | null>(null);
  const [adjustment, setAdjustment] = useState<{ trainerId?: string } | null>(null);
  const [adhoc, setAdhoc] = useState<{ trainerId?: string } | null>(null);
  const [voiding, setVoiding] = useState<LedgerEntry | null>(null);
  const [exporting, setExporting] = useState(false);

  const picked = selectedIds(selection, rows);
  const pickedAmount = rows.filter((r) => picked.includes(r.id)).reduce((s, r) => s + r.amount, 0);
  const sum = (key: (typeof TOTAL_KEYS)[number]) => totalsData?.totals?.[key] ?? 0;

  const approveAllFor = async (t: TrainerTotals) => {
    try {
      const ids = await payableEntryIds(t.trainerStaffUserId);
      if (!ids.length) {
        notify.success(intl.formatMessage(messages.approveNone, { name: t.name }));
        return;
      }
      setApproving({ ids, amount: t.totals.awaitingApproval });
    } catch (err) {
      notify.error(err);
    }
  };

  const handleApprove = () => {
    if (!approving) return;
    approve.mutate(
      { entryIds: approving.ids },
      {
        onSuccess: () => {
          notify.success(intl.formatMessage(messages.approved_ok));
          setApproving(null);
          setSelection({ type: 'include', ids: new Set() });
        },
        onError: notify.error,
      },
    );
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportLedger(params);
      if (!res.ok) throw new Error((await res.text()) || 'Export failed');
      downloadBlob(await res.blob(), `trainer-ledger-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (err) {
      notify.error(err);
    } finally {
      setExporting(false);
    }
  };

  const columns: GridColDef<LedgerEntry>[] = useMemo(
    () => [
      {
        field: 'createdAt',
        headerName: intl.formatMessage(messages.date),
        width: 120,
        sortable: false,
        valueGetter: (_v, row) => formatDate(row.date ?? row.createdAt),
      },
      {
        field: 'trainer',
        headerName: intl.formatMessage(common.trainer),
        flex: 1,
        minWidth: 150,
        sortable: false,
        valueGetter: (_v, row) => staffName(row.trainerStaffUserId) ?? '',
      },
      {
        field: 'kind',
        headerName: intl.formatMessage(messages.kind),
        width: 120,
        sortable: false,
        renderCell: ({ row }) => <LedgerKindLabel kind={row.kind} />,
      },
      {
        field: 'training',
        headerName: intl.formatMessage(common.training),
        width: 110,
        sortable: false,
        renderCell: ({ row }) =>
          row.training ? (
            <Stack sx={{ py: 0.75, lineHeight: 1.2 }}>
              <span>{row.training.code}</span>
              {row.itemKind === 'IMPROVEMENT' && (
                <Typography variant="caption" color="info.main">
                  {intl.formatMessage(messages.improvement)}
                </Typography>
              )}
            </Stack>
          ) : (
            ''
          ),
      },
      {
        field: 'student',
        headerName: intl.formatMessage(messages.student),
        flex: 1,
        minWidth: 170,
        sortable: false,
        renderCell: ({ row }) =>
          row.student && row.enrollmentId ? (
            <Link href={routes.trainings.enrollment(row.enrollmentId)} onClick={(e) => e.stopPropagation()}>
              {row.student.name} · {row.student.grNumber}
            </Link>
          ) : (
            ''
          ),
      },
      {
        field: 'amount',
        headerName: intl.formatMessage(messages.amount),
        width: 150,
        sortable: false,
        align: 'right',
        headerAlign: 'right',
        renderCell: ({ row }) => (
          <Stack sx={{ py: 0.75, alignItems: 'flex-end', lineHeight: 1.2 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                textDecoration: row.status === 'VOIDED' || row.status === 'CANCELLED' ? 'line-through' : 'none',
                color: row.kind === 'PAYMENT' ? 'success.dark' : row.amount < 0 ? 'error.main' : 'text.primary',
              }}
            >
              {row.kind === 'PAYMENT' ? `− ${formatAmount(row.amount)}` : formatAmount(row.amount)}
            </Typography>
            {row.status === 'PART_PAID' && (
              <Typography variant="caption" color="text.secondary">
                {intl.formatMessage(messages.covered, {
                  paid: formatAmount(row.paidAmount),
                  amount: formatAmount(row.amount),
                })}
              </Typography>
            )}
          </Stack>
        ),
      },
      {
        field: 'status',
        headerName: intl.formatMessage(messages.status),
        width: 160,
        sortable: false,
        renderCell: ({ row }) => <LedgerStatusChip status={row.status} />,
      },
      {
        field: 'details',
        headerName: intl.formatMessage(messages.details),
        flex: 1.4,
        minWidth: 200,
        sortable: false,
        renderCell: ({ row }) => (
          <Stack sx={{ py: 0.75, lineHeight: 1.2 }}>
            <Typography variant="body2">
              {[row.title, row.reference, row.reason].filter(Boolean).join(' · ')}
            </Typography>
            {row.voidedAt && (
              <Typography variant="caption" color="text.secondary">
                {intl.formatMessage(messages.voided, {
                  at: formatDateTime(row.voidedAt),
                  reason: row.voidReason ?? '',
                })}
              </Typography>
            )}
          </Stack>
        ),
      },
      ...(canPayouts
        ? [
            {
              field: 'actions',
              headerName: '',
              width: 90,
              sortable: false,
              renderCell: ({ row }: { row: LedgerEntry }) =>
                row.kind !== 'PAYOUT' && row.status !== 'VOIDED' ? (
                  <Button
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVoiding(row);
                    }}
                  >
                    {intl.formatMessage(messages.void)}
                  </Button>
                ) : null,
            } as GridColDef<LedgerEntry>,
          ]
        : []),
    ],
    [intl, canPayouts, staffName],
  );

  const hasFilters = FILTER_KEYS.some((k) => filters[k]);

  return (
    <Stack spacing={2.5}>
      <Typography variant="body2" color="text.secondary">
        <FormattedMessage {...messages.help} />
      </Typography>

      {/* Per-trainer totals */}
      <Section
        title={<FormattedMessage {...messages.trainers} />}
        actions={
          canPayouts && (
            <Stack direction="row" spacing={1}>
              <Button size="small" startIcon={<AddIcon />} onClick={() => setAdjustment({})}>
                <FormattedMessage {...messages.addAdjustment} />
              </Button>
              <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => setAdhoc({})}>
                <FormattedMessage {...messages.addAmount} />
              </Button>
              <Button size="small" variant="contained" startIcon={<PayIcon />} onClick={() => setPayment({})}>
                <FormattedMessage {...messages.recordPayment} />
              </Button>
            </Stack>
          )
        }
      >
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 900, '& td, & th': { whiteSpace: 'nowrap' } }}>
            <TableHead>
              <TableRow>
                <TableCell>
                  <FormattedMessage {...common.trainer} />
                </TableCell>
                {TOTAL_KEYS.map((k) => (
                  <TableCell key={k} align="right">
                    <FormattedMessage {...messages[k]} />
                  </TableCell>
                ))}
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {totalsLoading && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Skeleton height={28} />
                  </TableCell>
                </TableRow>
              )}
              {!totalsLoading && totals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography color="text.secondary" sx={{ py: 1.5, textAlign: 'center' }}>
                      <FormattedMessage {...messages.noTrainers} />
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {totals.map((t) => (
                <TableRow
                  key={t.trainerStaffUserId}
                  hover
                  selected={filters.trainer === t.trainerStaffUserId}
                  sx={{ cursor: 'pointer' }}
                  onClick={() =>
                    setFilter({
                      trainer: filters.trainer === t.trainerStaffUserId ? undefined : t.trainerStaffUserId,
                      page: 0,
                    })
                  }
                >
                  <TableCell sx={{ fontWeight: 600 }}>{t.name}</TableCell>
                  {TOTAL_KEYS.map((k) => (
                    <TableCell
                      key={k}
                      align="right"
                      sx={{
                        fontWeight: k === 'due' ? 700 : 400,
                        color:
                          k === 'projected'
                            ? 'text.secondary'
                            : k === 'awaitingApproval' && t.totals[k]
                              ? 'warning.dark'
                              : undefined,
                      }}
                    >
                      {formatAmount(t.totals[k])}
                    </TableCell>
                  ))}
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    {canPayouts && (
                      <>
                        <Button size="small" disabled={!t.totals.awaitingApproval} onClick={() => approveAllFor(t)}>
                          <FormattedMessage {...messages.approveAll} />
                        </Button>
                        <Button size="small" onClick={() => setPayment({ trainerId: t.trainerStaffUserId })}>
                          <FormattedMessage {...messages.recordPayment} />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {totals.length > 1 && (
                <TableRow sx={{ '& td': { fontWeight: 700, borderTop: 2, borderColor: 'divider' } }}>
                  <TableCell>
                    <FormattedMessage {...messages.total} />
                  </TableCell>
                  {TOTAL_KEYS.map((k) => (
                    <TableCell key={k} align="right">
                      {formatAmount(sum(k))}
                    </TableCell>
                  ))}
                  <TableCell />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Section>

      {/* Entries */}
      <Card sx={cardStyle}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap" alignItems="center">
            <StaffFilter param="trainer" role={StaffRole.TRAINER} label={<FormattedMessage {...common.trainer} />} />
            <UrlSelect
              param="kind"
              label={<FormattedMessage {...messages.kind} />}
              options={LEDGER_KINDS.map((k) => ({ value: k, label: intl.formatMessage(common[k]) }))}
            />
            <UrlSelect
              param="status"
              label={<FormattedMessage {...messages.status} />}
              options={LEDGER_STATUSES.map((s) => ({ value: s, label: intl.formatMessage(common[s]) }))}
              minWidth={180}
            />
            <UrlDateFilter param="from" label={<FormattedMessage {...messages.from} />} />
            <UrlDateFilter param="to" label={<FormattedMessage {...messages.to} />} />
            {hasFilters && (
              <Button
                size="small"
                onClick={() => setFilter(Object.fromEntries(FILTER_KEYS.map((k) => [k, undefined])))}
              >
                <FormattedMessage {...common.clearFilters} />
              </Button>
            )}
            <Box sx={{ flex: 1 }} />
            <Button variant="outlined" startIcon={<ExportIcon />} onClick={handleExport} disabled={exporting}>
              <FormattedMessage {...messages.exportCsv} />
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {canPayouts && picked.length > 0 && (
        <Stack direction="row" justifyContent="flex-end">
          <Button
            variant="contained"
            color="success"
            startIcon={<ApproveIcon />}
            onClick={() => setApproving({ ids: picked, amount: pickedAmount })}
          >
            <FormattedMessage
              {...messages.approveSelected}
              values={{ count: String(picked.length), amount: formatAmount(pickedAmount) }}
            />
          </Button>
        </Stack>
      )}

      {!!error && (
        <Alert severity="error">
          <FormattedMessage {...common.loadError} />: {extractNetworkError(error)}
        </Alert>
      )}

      <DataTable<LedgerEntry>
        pagination
        columns={columns}
        rows={rows}
        rowCount={data?.count ?? 0}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        paginationMode="server"
        paginationModel={{ page: filters.page, pageSize: filters.pageSize }}
        onPaginationModelChange={handlePaginationModelChange}
        pageSizeOptions={[20, 50, 100]}
        disableColumnFilter
        disableColumnMenu
        showPointer={false}
        getRowHeight={() => 'auto'}
        noDataFound={intl.formatMessage(messages.noEntries)}
        checkboxSelection={canPayouts}
        isRowSelectable={({ row }) => row.status === 'PAYABLE'}
        rowSelectionModel={selection}
        onRowSelectionModelChange={setSelection}
        keepNonExistentRowsSelected={false}
      />

      <ActionDialog
        open={!!approving}
        onClose={() => setApproving(null)}
        onSubmit={handleApprove}
        isSubmitting={approve.isPending}
        title={<FormattedMessage {...messages.approveTitle} values={{ count: String(approving?.ids.length ?? 0) }} />}
        submitLabel={<FormattedMessage {...messages.approveAll} />}
        submitColor="success"
        maxWidth="xs"
      >
        <Typography>
          <FormattedMessage {...messages.approveExplain} values={{ amount: formatAmount(approving?.amount ?? 0) }} />
        </Typography>
      </ActionDialog>
      {canPayouts && (
        <>
          <PaymentDialog
            open={!!payment}
            onClose={() => setPayment(null)}
            trainerId={payment?.trainerId ?? filters.trainer}
            totals={totals}
          />
          <AdjustmentDialog
            open={!!adjustment}
            onClose={() => setAdjustment(null)}
            trainerId={adjustment?.trainerId ?? filters.trainer}
          />
          <AdhocDialog open={!!adhoc} onClose={() => setAdhoc(null)} trainerId={adhoc?.trainerId ?? filters.trainer} />
          <VoidDialog entry={voiding} onClose={() => setVoiding(null)} />
        </>
      )}
    </Stack>
  );
}
