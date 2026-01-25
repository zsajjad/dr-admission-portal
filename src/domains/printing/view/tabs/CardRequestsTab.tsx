'use client';

import { useMemo, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import CancelIcon from '@mui/icons-material/Cancel';
import PrintIcon from '@mui/icons-material/Print';
import {
  Alert,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { GridColDef, GridRowId, GridRowSelectionModel } from '@mui/x-data-grid';

import { BranchFilter } from '@/components/BranchFilter';
import { DataTable } from '@/components/DataTable';
import { SessionFilter } from '@/components/SessionFilter';

import {
  CardPrintRequestEntity,
  CardPrintRequestEntityStatus,
  PrintingControllerCountCardPrintRequestsParams,
  PrintingControllerListCardPrintRequestsParams,
  PrintingControllerListCardPrintRequestsStatus,
} from '@/providers/service/app.schemas';
import {
  getPrintingControllerCountCardPrintRequestsQueryKey,
  getPrintingControllerListCardPrintRequestsQueryKey,
  usePrintingControllerCancelCardPrintRequest,
  usePrintingControllerCountCardPrintRequests,
  usePrintingControllerListCardPrintRequests,
  usePrintingControllerProcessCardPrintRequests,
} from '@/providers/service/printing/printing';

import FormattedMessage, { useFormattedMessage } from '@/theme/FormattedMessage';

import { useListingFilters } from '@/hooks/useListingFilters';

import { extractNetworkError } from '@/utils/extractNetworkError';

import componentMessages from '../../components/messages';
import viewMessages from '../messages';

interface FilterState {
  sessionId?: string;
  branchId?: string;
  status?: PrintingControllerListCardPrintRequestsStatus;
}

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString();
}

function getStatusColor(status: CardPrintRequestEntityStatus): 'warning' | 'success' | 'default' {
  switch (status) {
    case 'PENDING':
      return 'warning';
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
      return 'default';
    default:
      return 'default';
  }
}

export function CardRequestsTab() {
  const { filters, setFilter } = useListingFilters<FilterState>();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const formattedMessages = {
    grNumberHeader: useFormattedMessage(viewMessages.grNumberHeader),
    nameHeader: useFormattedMessage(viewMessages.nameHeader),
    fatherNameHeader: useFormattedMessage(viewMessages.fatherNameHeader),
    areaHeader: useFormattedMessage(viewMessages.areaHeader),
    classHeader: useFormattedMessage(viewMessages.classHeader),
    statusHeader: useFormattedMessage(viewMessages.statusHeader),
    requestedAtHeader: useFormattedMessage(viewMessages.requestedAtHeader),
    requestedByHeader: useFormattedMessage(viewMessages.requestedByHeader),
    batchIdHeader: useFormattedMessage(viewMessages.batchIdHeader),
    actionsHeader: useFormattedMessage(viewMessages.actionsHeader),
    noData: useFormattedMessage(componentMessages.noData),
    sessionRequired: useFormattedMessage(componentMessages.sessionRequired),
    processSuccess: useFormattedMessage(componentMessages.processSuccess),
    processError: useFormattedMessage(componentMessages.processError),
    cancelSuccess: useFormattedMessage(componentMessages.cancelSuccess),
    cancelError: useFormattedMessage(componentMessages.cancelError),
    statusFilter: useFormattedMessage(componentMessages.statusFilter),
    allStatuses: useFormattedMessage(componentMessages.allStatuses),
    selectSessionAndBranch: useFormattedMessage(componentMessages.selectSessionAndBranch),
  };

  const canFetch = !!filters.sessionId && !!filters.branchId;

  const listParams: PrintingControllerListCardPrintRequestsParams | undefined = canFetch
    ? {
        sessionId: filters.sessionId!,
        branchId: filters.branchId,
        status: filters.status,
      }
    : undefined;

  const countParams: PrintingControllerCountCardPrintRequestsParams | undefined = canFetch
    ? {
        sessionId: filters.sessionId!,
        branchId: filters.branchId,
      }
    : undefined;

  const {
    data: listData,
    isLoading,
    isError,
    error,
  } = usePrintingControllerListCardPrintRequests(listParams!, {
    query: {
      enabled: canFetch,
    },
  });

  const { data: countData } = usePrintingControllerCountCardPrintRequests(countParams!, {
    query: {
      enabled: canFetch,
    },
  });

  const processMutation = usePrintingControllerProcessCardPrintRequests({
    mutation: {
      onSuccess: () => {
        setSelectedIds([]);
        queryClient.invalidateQueries({
          queryKey: getPrintingControllerListCardPrintRequestsQueryKey(listParams),
        });
        queryClient.invalidateQueries({
          queryKey: getPrintingControllerCountCardPrintRequestsQueryKey(countParams),
        });
      },
    },
  });

  const cancelMutation = usePrintingControllerCancelCardPrintRequest({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getPrintingControllerListCardPrintRequestsQueryKey(listParams),
        });
        queryClient.invalidateQueries({
          queryKey: getPrintingControllerCountCardPrintRequestsQueryKey(countParams),
        });
      },
    },
  });

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setFilter({ status: value === '' ? undefined : (value as PrintingControllerListCardPrintRequestsStatus) });
  };

  const handleSelectionChange = (selectionModel: GridRowSelectionModel) => {
    // GridRowSelectionModel in v7+ is { type, ids } - extract the ids array
    const ids = Array.isArray(selectionModel) ? selectionModel : Array.from(selectionModel.ids || []);
    setSelectedIds(ids.map(String));
  };

  const handleProcessSelected = () => {
    if (!filters.sessionId || !filters.branchId || selectedIds.length === 0) return;

    // Get admission IDs from selected rows
    const selectedRows = listData?.data.filter((row) => selectedIds.includes(row.id)) || [];
    const admissionIds = selectedRows.map((row) => row.admissionId);

    processMutation.mutate({
      data: {
        admissionIds,
        status: 'PENDING',
      },
    });
  };

  const handleProcessAll = () => {
    if (!filters.sessionId || !filters.branchId) return;

    processMutation.mutate({
      data: {
        sessionId: filters.sessionId,
        branchId: filters.branchId,
        status: 'PENDING',
      },
    });
  };

  const handleCancel = (id: string) => {
    cancelMutation.mutate({ id });
  };

  const columns: GridColDef<CardPrintRequestEntity>[] = useMemo(
    () => [
      {
        field: 'grNumber',
        headerName: formattedMessages.grNumberHeader,
        width: 150,
        valueGetter: (_, row) => row.admission?.student?.grNumber || '-',
      },
      {
        field: 'name',
        headerName: formattedMessages.nameHeader,
        flex: 1,
        cellClassName: 'font-urdu',
        valueGetter: (_, row) => row.admission?.student?.name || '-',
      },
      {
        field: 'fatherName',
        headerName: formattedMessages.fatherNameHeader,
        flex: 1,
        cellClassName: 'font-urdu',
        valueGetter: (_, row) => row.admission?.student?.fatherName || '-',
      },
      {
        field: 'area',
        headerName: formattedMessages.areaHeader,
        width: 150,
        cellClassName: 'font-urdu',
        valueGetter: (_, row) => row.admission?.area?.name || '-',
      },
      {
        field: 'classLevel',
        headerName: formattedMessages.classHeader,
        width: 120,
        cellClassName: 'font-urdu',
        valueGetter: (_, row) => row.admission?.classLevel?.name || '-',
      },
      {
        field: 'status',
        headerName: formattedMessages.statusHeader,
        width: 120,
        renderCell: (params) => (
          <Chip label={params.value} color={getStatusColor(params.value)} size="small" variant="outlined" />
        ),
      },
      {
        field: 'requestedAt',
        headerName: formattedMessages.requestedAtHeader,
        width: 180,
        valueFormatter: (value) => formatDate(value),
      },
      {
        field: 'printBatchId',
        headerName: formattedMessages.batchIdHeader,
        width: 200,
        valueGetter: (_, row) => row.printBatchId || '-',
      },
      {
        field: 'actions',
        headerName: formattedMessages.actionsHeader,
        width: 100,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          if (params.row.status !== 'PENDING') return null;
          return (
            <Tooltip title="Cancel Request">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel(params.row.id);
                }}
                disabled={cancelMutation.isPending}
              >
                <CancelIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formattedMessages, cancelMutation.isPending],
  );

  // Get counts from byStatus object
  const byStatus = countData?.byStatus as Record<string, number> | undefined;
  const pendingCount = byStatus?.PENDING || 0;
  const completedCount = byStatus?.COMPLETED || 0;
  const cancelledCount = byStatus?.CANCELLED || 0;

  const selectedPendingCount = selectedIds.filter((id) => {
    const row = listData?.data.find((r) => r.id === id);
    return row?.status === 'PENDING';
  }).length;

  const isProcessing = processMutation.isPending;

  return (
    <Stack spacing={2}>
      {/* Filters */}
      <Stack direction="row" flexWrap="wrap" gap={2}>
        <SessionFilter size="small" minWidth={200} />
        <BranchFilter size="small" minWidth={200} />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>
            <FormattedMessage {...componentMessages.statusFilter} />
          </InputLabel>
          <Select value={filters.status || ''} label={formattedMessages.statusFilter} onChange={handleStatusChange}>
            <MenuItem value="">{formattedMessages.allStatuses}</MenuItem>
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Info messages */}
      {!canFetch && (
        <Alert severity="info">
          <FormattedMessage {...componentMessages.selectSessionAndBranch} />
        </Alert>
      )}

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {extractNetworkError(error)}
        </Alert>
      )}

      {processMutation.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formattedMessages.processError}
        </Alert>
      )}

      {processMutation.isSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <FormattedMessage
            {...componentMessages.processSuccess}
            values={{
              count: String(processMutation.data?.cardCount || 0),
              batchId: processMutation.data?.batchId || '',
            }}
          />
        </Alert>
      )}

      {cancelMutation.isSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {formattedMessages.cancelSuccess}
        </Alert>
      )}

      {canFetch && (
        <>
          {/* Status counts */}
          {countData && (
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip label={`Pending: ${pendingCount}`} color="warning" variant="outlined" size="small" />
              <Chip label={`Completed: ${completedCount}`} color="success" variant="outlined" size="small" />
              <Chip label={`Cancelled: ${cancelledCount}`} color="default" variant="outlined" size="small" />
              <Typography variant="body2" color="text.secondary">
                Total: {countData.count}
              </Typography>
            </Stack>
          )}

          {/* Action buttons */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body1">
              <FormattedMessage
                {...componentMessages.cardRequestsFound}
                values={{ count: String(listData?.count || 0) }}
              />
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={handleProcessSelected}
                disabled={isProcessing || selectedPendingCount === 0}
              >
                {isProcessing ? (
                  <FormattedMessage {...componentMessages.processing} />
                ) : (
                  <>
                    <FormattedMessage {...componentMessages.processSelected} />
                    {selectedPendingCount > 0 && ` (${selectedPendingCount})`}
                  </>
                )}
              </Button>
              <Button
                variant="contained"
                startIcon={<PrintIcon />}
                onClick={handleProcessAll}
                disabled={isProcessing || pendingCount === 0}
              >
                {isProcessing ? (
                  <FormattedMessage {...componentMessages.processing} />
                ) : (
                  <>
                    <FormattedMessage {...componentMessages.processAll} />
                    {pendingCount > 0 && ` (${pendingCount})`}
                  </>
                )}
              </Button>
            </Stack>
          </Stack>

          {/* Data table */}
          <DataTable<CardPrintRequestEntity>
            columns={columns}
            rows={listData?.data || []}
            isLoading={isLoading}
            getRowId={(row) => row.id}
            noDataFound={formattedMessages.noData}
            pageSizeOptions={[10, 25, 50, 100]}
            checkboxSelection
            rowSelectionModel={{ type: 'include', ids: new Set(selectedIds as GridRowId[]) }}
            onRowSelectionModelChange={handleSelectionChange}
            isRowSelectable={(params) => params.row.status === 'PENDING'}
            showPointer={false}
            showInfoColumn={false}
          />
        </>
      )}
    </Stack>
  );
}
