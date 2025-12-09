'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Alert, Autocomplete, Chip, Stack, TextField } from '@mui/material';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

import { AssetsDrawer } from '@/domains/admission/components/AssetsDrawer';

import { DataTable } from '@/components/DataTable';
import { RowActions } from '@/components/RowActions';

import { KEYS } from '@/providers/constants/key';
import { useAdmissionsControllerFindAll } from '@/providers/service/admissions/admissions';
import {
  Admission,
  AdmissionsControllerFindAllSortBy,
  AdmissionsControllerFindAllStatus,
} from '@/providers/service/app.schemas';
import { useBranchControllerFindAll } from '@/providers/service/branch/branch';
import { useSessionControllerFindAll } from '@/providers/service/session/session';

import FormattedMessage, { useFormattedMessage } from '@/theme/FormattedMessage';

import { useListingFilters } from '@/hooks/useListingFilters';

import { routes } from '@/router/routes';
import { useQueryParams } from '@/router/useQueryParams';

import { extractNetworkError } from '@/utils/extractNetworkError';

import { getSafeValue } from '@/utils';

import messages from './messages';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'VERIFIED':
      return 'success';
    case 'REJECTED':
      return 'error';
    case 'DUPLICATE_MERGED':
      return 'warning';
    default:
      return 'default';
  }
};

// Status options for filter dropdown
const statusOptions = [
  { id: AdmissionsControllerFindAllStatus.UNVERIFIED, label: 'Unverified' },
  { id: AdmissionsControllerFindAllStatus.VERIFIED, label: 'Verified' },
  { id: AdmissionsControllerFindAllStatus.REJECTED, label: 'Rejected' },
  { id: AdmissionsControllerFindAllStatus.DUPLICATE_MERGED, label: 'Duplicate Merged' },
];

interface AdmissionFilters {
  branchId?: string;
  sessionId?: string;
  status?: string;
}

export function AdmissionListing() {
  const { route } = useQueryParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);

  const handleOpenDrawer = useCallback((admission: Admission) => {
    setSelectedAdmission(admission);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setSelectedAdmission(null);
  }, []);

  const formattedMessages = {
    errorUpdate: useFormattedMessage(messages.errorSuccess),
    noRowsLabel: useFormattedMessage(messages.noData),
    successUpdate: useFormattedMessage(messages.updateSuccess),

    //Column Names
    grNumberColumnName: useFormattedMessage(messages.grNumberColumnName),
    nameColumnName: useFormattedMessage(messages.nameColumnName),
    fatherNameColumnName: useFormattedMessage(messages.fatherNameColumnName),
    phoneColumnName: useFormattedMessage(messages.phoneColumnName),
    statusColumnName: useFormattedMessage(messages.statusColumnName),
    branchColumnName: useFormattedMessage(messages.branchColumnName),
    sessionColumnName: useFormattedMessage(messages.sessionColumnName),
    actionsColumnName: useFormattedMessage(messages.actionsColumnName),

    // Filter labels
    branchFilterLabel: useFormattedMessage(messages.branchFilterLabel),
    sessionFilterLabel: useFormattedMessage(messages.sessionFilterLabel),
    statusFilterLabel: useFormattedMessage(messages.statusFilterLabel),
  };

  const { filters, setFilter, handleSortModelChange, handleFilterModelChange, handlePaginationModelChange } =
    useListingFilters<AdmissionFilters>();

  // Fetch branches for filter dropdown
  const { data: branchesData } = useBranchControllerFindAll({ take: 100 });
  const branches = branchesData?.data || [];

  // Fetch sessions for filter dropdown
  const { data: sessionsData } = useSessionControllerFindAll({ take: 100 });
  const sessions = sessionsData?.data || [];

  // Find selected values for controlled Autocomplete
  const selectedBranch = useMemo(
    () => branches.find((b) => b.id === filters.branchId) || null,
    [branches, filters.branchId],
  );
  const selectedSession = useMemo(
    () => sessions.find((s) => s.id === filters.sessionId) || null,
    [sessions, filters.sessionId],
  );
  const selectedStatus = useMemo(() => statusOptions.find((s) => s.id === filters.status) || null, [filters.status]);

  const {
    data: admissions,
    isLoading,
    isError,
    error,
  } = useAdmissionsControllerFindAll(
    {
      sortBy: filters.sortBy as AdmissionsControllerFindAllSortBy,
      sortOrder: filters.sortOrder,
      skip: filters.page * filters.pageSize,
      take: filters.pageSize,
      includeInActive: filters.includeInActive,
      sessionId: filters.sessionId,
      status: filters.status as AdmissionsControllerFindAllStatus,
    },
    {
      query: {
        queryKey: [KEYS.ADMISSION_LISTING, filters],
      },
    },
  );

  const rowCount = useMemo(() => {
    return admissions?.count;
  }, [admissions?.count]);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: filters.page,
    pageSize: filters.pageSize,
  });

  useEffect(() => {
    setPaginationModel({
      page: filters.page,
      pageSize: filters.pageSize,
    });
  }, [filters.page, filters.pageSize]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'grNumber',
        headerName: formattedMessages.grNumberColumnName,
        flex: 1,
        maxWidth: 150,
        sortable: false,
        renderCell: (params) => getSafeValue(params.row.student?.grNumber),
      },
      {
        field: 'name',
        headerName: formattedMessages.nameColumnName,
        flex: 1,
        renderCell: (params) => getSafeValue(params.row.student?.name),
      },
      {
        field: 'fatherName',
        headerName: formattedMessages.fatherNameColumnName,
        flex: 1,
        renderCell: (params) => getSafeValue(params.row.student?.fatherName),
      },
      {
        field: 'phone',
        headerName: formattedMessages.phoneColumnName,
        flex: 1,
        maxWidth: 150,
        renderCell: (params) => getSafeValue(params.row.student?.phone),
      },
      {
        field: 'branch',
        headerName: formattedMessages.branchColumnName,
        flex: 1,
        renderCell: (params) => getSafeValue(params.row.branch?.name),
      },
      {
        field: 'session',
        headerName: formattedMessages.sessionColumnName,
        flex: 1,
        renderCell: (params) => getSafeValue(params.row.session?.name),
      },
      {
        field: 'status',
        headerName: formattedMessages.statusColumnName,
        flex: 1,
        maxWidth: 150,
        renderCell: (params) => (
          <Chip label={params.row.status} color={getStatusColor(params.row.status)} size="small" />
        ),
      },
      {
        field: 'actions',
        headerName: formattedMessages.actionsColumnName,
        renderCell: (params) => (
          <RowActions
            onView={() => handleOpenDrawer(params.row)}
            onEdit={() => route({ url: routes.admission.edit(params?.row?.id) })}
          />
        ),
        filterable: false,
        sortable: false,
        width: 150,
      },
    ],
    [
      formattedMessages.grNumberColumnName,
      formattedMessages.nameColumnName,
      formattedMessages.fatherNameColumnName,
      formattedMessages.phoneColumnName,
      formattedMessages.branchColumnName,
      formattedMessages.sessionColumnName,
      formattedMessages.statusColumnName,
      formattedMessages.actionsColumnName,
      route,
      handleOpenDrawer,
    ],
  );
  return (
    <Stack>
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {extractNetworkError(error)}
        </Alert>
      )}

      {/* Filter Dropdowns */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Autocomplete
          size="small"
          sx={{ minWidth: 200 }}
          options={branches}
          getOptionLabel={(option) => option.name || ''}
          value={selectedBranch}
          onChange={(_, newValue) => {
            setFilter({ branchId: newValue?.id, page: 0 });
          }}
          renderInput={(params) => (
            <TextField {...params} label={<FormattedMessage {...messages.branchFilterLabel} />} />
          )}
        />
        <Autocomplete
          size="small"
          sx={{ minWidth: 200 }}
          options={sessions}
          getOptionLabel={(option) => option.name || ''}
          value={selectedSession}
          onChange={(_, newValue) => {
            setFilter({ sessionId: newValue?.id, page: 0 });
          }}
          renderInput={(params) => (
            <TextField {...params} label={<FormattedMessage {...messages.sessionFilterLabel} />} />
          )}
        />
        <Autocomplete
          size="small"
          sx={{ minWidth: 200 }}
          options={statusOptions}
          getOptionLabel={(option) => option.label}
          value={selectedStatus}
          onChange={(_, newValue) => {
            setFilter({ status: newValue?.id, page: 0 });
          }}
          renderInput={(params) => (
            <TextField {...params} label={<FormattedMessage {...messages.statusFilterLabel} />} />
          )}
        />
      </Stack>

      <DataTable<Admission>
        getRowId={(row) => row?.id}
        pagination
        columns={columns}
        filterMode="server"
        sortingMode="server"
        paginationMode="server"
        filterDebounceMs={500}
        isLoading={isLoading}
        rows={admissions?.data || []}
        rowCount={rowCount}
        pageSizeOptions={[10, 20, 50, 100]}
        onSortModelChange={handleSortModelChange}
        onFilterModelChange={handleFilterModelChange}
        onPaginationModelChange={handlePaginationModelChange}
        paginationModel={paginationModel}
        noDataFound={formattedMessages.noRowsLabel}
        rowClickUrl={(row) => `${routes.admission.detail(row?.id?.toString())}`}
      />

      {/* Assets Drawer */}
      <AssetsDrawer open={drawerOpen} onClose={handleCloseDrawer} admission={selectedAdmission} />
    </Stack>
  );
}
