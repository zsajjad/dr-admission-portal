'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Alert, Autocomplete, Box, Chip, Stack, TextField } from '@mui/material';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

import { AssetsDrawer } from '@/domains/admission/components/AssetsDrawer';
import { VanChip } from '@/domains/van/components/VanChip';

import { AreaFilter } from '@/components/AreaFilter';
import { BranchFilter } from '@/components/BranchFilter';
import { ClassLevelChip } from '@/components/ClassLevelChip';
import { DataTable } from '@/components/DataTable';
import { RowActions } from '@/components/RowActions';
import { SessionFilter } from '@/components/SessionFilter';

import { KEYS } from '@/providers/constants/key';
import { useAdmissionsControllerFindAll } from '@/providers/service/admissions/admissions';
import {
  Admission,
  AdmissionsControllerFindAllSortBy,
  AdmissionsControllerFindAllStatus,
} from '@/providers/service/app.schemas';

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
  areaId?: string;
}

const cardStyle = {
  bgcolor: 'background.paper',
  borderRadius: 3,
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  p: 2.5,
};

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
    classLevelColumnName: useFormattedMessage(messages.classLevelColumnName),
    vanColumnName: useFormattedMessage(messages.vanColumnName),
    branchColumnName: useFormattedMessage(messages.branchColumnName),
    actionsColumnName: useFormattedMessage(messages.actionsColumnName),

    // Filter labels
    statusFilterLabel: useFormattedMessage(messages.statusFilterLabel),
  };

  const { filters, setFilter, handleSortModelChange, handleFilterModelChange, handlePaginationModelChange } =
    useListingFilters<AdmissionFilters>();

  // Find selected values for controlled Autocomplete
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
      branchId: filters.branchId,
      sessionId: filters.sessionId,
      areaId: filters.areaId,
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
        maxWidth: 200,
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
        maxWidth: 100,
        renderCell: (params) => getSafeValue(params.row.branch?.code),
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
        field: 'classLevel',
        headerName: formattedMessages.classLevelColumnName,
        flex: 1,
        maxWidth: 120,
        sortable: false,
        filterable: false,
        renderCell: (params) => <ClassLevelChip classLevelId={params.row.classLevel?.id} />,
      },
      {
        field: 'van',
        headerName: formattedMessages.vanColumnName,
        flex: 1,
        maxWidth: 120,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <VanChip
            areaId={params.row.area?.id}
            branchId={params.row.branch?.id}
            gender={params.row.student?.gender}
            classLevelName={params.row.classLevel?.name}
            hasVan={params.row.area?.hasVan}
            hasBoysVan={params.row.area?.hasBoysVan}
          />
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
      formattedMessages.statusColumnName,
      formattedMessages.classLevelColumnName,
      formattedMessages.vanColumnName,
      formattedMessages.actionsColumnName,
      route,
      handleOpenDrawer,
    ],
  );

  return (
    <Stack spacing={2.5}>
      {isError && (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {extractNetworkError(error)}
        </Alert>
      )}

      {/* Filter Dropdowns */}
      <Box sx={cardStyle}>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <BranchFilter resetFiltersOnChange={['areaId']} />
          <SessionFilter />
          <AreaFilter />
          <Autocomplete
            size="small"
            sx={{ minWidth: 180 }}
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
      </Box>

      {/* Data Table */}
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
