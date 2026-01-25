'use client';

import { useEffect, useMemo, useState } from 'react';

import { Alert, Chip, Stack, Typography } from '@mui/material';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

import { DataTable } from '@/components/DataTable';
import { RowActions } from '@/components/RowActions';

import { KEYS } from '@/providers/constants/key';
import { Van, VanControllerFindAllSortBy } from '@/providers/service/app.schemas';
import {
  useVanControllerActivate,
  useVanControllerDeactivate,
  useVanControllerFindAll,
} from '@/providers/service/van/van';

import FormattedMessage, { useFormattedMessage } from '@/theme/FormattedMessage';

import { useActivationHandlers } from '@/hooks/useActivationHandlers';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { useListingFilters } from '@/hooks/useListingFilters';
import { useMutationHandlers } from '@/hooks/useMutationHandlers';

import { routes } from '@/router/routes';
import { useQueryParams } from '@/router/useQueryParams';

import { extractNetworkError } from '@/utils/extractNetworkError';

import messages from './messages';

// Helper function to determine text color based on background luminance
function getContrastColor(hexColor: string): string {
  if (!hexColor || !hexColor.startsWith('#')) return '#000000';
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

interface VanFilters {
  branchId?: string;
}

export default function VanListing() {
  const { route } = useQueryParams();
  const activateVan = useVanControllerActivate();
  const deactivateVan = useVanControllerDeactivate();
  const { isAuthenticated: enabled } = useAuthenticatedApi();

  const formattedMessages = {
    errorUpdate: useFormattedMessage(messages.errorSuccess),
    noRowsLabel: useFormattedMessage(messages.noData),
    successUpdate: useFormattedMessage(messages.updateSuccess),
    codeHeaderName: useFormattedMessage(messages.codeHeaderName),
    nameHeaderName: useFormattedMessage(messages.nameHeaderName),
    colorHeaderName: useFormattedMessage(messages.colorHeaderName),
    areasHeaderName: useFormattedMessage(messages.areasHeaderName),
    maleConfirmedHeaderName: useFormattedMessage(messages.maleConfirmedHeaderName),
    maleAppliedHeaderName: useFormattedMessage(messages.maleAppliedHeaderName),
    femaleConfirmedHeaderName: useFormattedMessage(messages.femaleConfirmedHeaderName),
    femaleAppliedHeaderName: useFormattedMessage(messages.femaleAppliedHeaderName),
    actionsHeaderName: useFormattedMessage(messages.actionsHeaderName),
  };

  const { onSuccess, onError } = useMutationHandlers({
    queryKey: [KEYS.VAN_LISTING],
    supportQueryKey: [KEYS.VAN_DETAIL],
    messages: {
      successUpdate: formattedMessages.successUpdate,
      errorUpdate: formattedMessages.errorUpdate,
    },
  });

  const { handleActivate, handleDeactivate } = useActivationHandlers<Van>(
    activateVan,
    deactivateVan,
    onSuccess,
    onError,
  );

  const { filters, handleSortModelChange, handleFilterModelChange, handlePaginationModelChange } =
    useListingFilters<VanFilters>();

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

  const {
    data: vans,
    isLoading,
    isError,
    error,
  } = useVanControllerFindAll(
    {
      sortBy: filters.sortBy as VanControllerFindAllSortBy,
      sortOrder: filters.sortOrder || 'desc',
      skip: filters.page * filters.pageSize,
      take: filters.pageSize,
      includeInActive: filters.includeInActive,
      branchId: filters.branchId,
    },
    {
      query: {
        enabled,
        queryKey: [KEYS.VAN_LISTING, filters],
      },
    },
  );

  const rowCount = useMemo(() => {
    return vans?.count;
  }, [vans?.count]);

  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'code', headerName: formattedMessages.codeHeaderName, flex: 1 },
      { field: 'name', headerName: formattedMessages.nameHeaderName, flex: 1 },
      {
        field: 'color',
        headerName: formattedMessages.colorHeaderName,
        flex: 1,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Chip
            label={params.row.colorName}
            size="small"
            sx={{
              backgroundColor: params.row.colorHex,
              color: getContrastColor(params.row.colorHex),
            }}
          />
        ),
      },
      {
        field: 'areas',
        headerName: formattedMessages.areasHeaderName,
        flex: 2,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ py: 0.5 }}>
            {params.row.areas?.map((area: { id: string; name: string }) => (
              <Chip key={area.id} label={area.name} size="small" variant="outlined" className="font-urdu" />
            )) || '-'}
          </Stack>
        ),
      },
      {
        field: 'maleConfirmedCount',
        headerName: formattedMessages.maleConfirmedHeaderName,
        width: 100,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => params.row.maleConfirmedCount ?? 0,
      },
      {
        field: 'maleAppliedCount',
        headerName: formattedMessages.maleAppliedHeaderName,
        width: 100,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => params.row.maleAppliedCount ?? 0,
      },
      {
        field: 'femaleConfirmedCount',
        headerName: formattedMessages.femaleConfirmedHeaderName,
        width: 100,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => params.row.femaleConfirmedCount ?? 0,
      },
      {
        field: 'femaleAppliedCount',
        headerName: formattedMessages.femaleAppliedHeaderName,
        width: 100,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => params.row.femaleAppliedCount ?? 0,
      },
      {
        field: 'actions',
        headerName: formattedMessages.actionsHeaderName,
        headerAlign: 'right',
        renderCell: (params) => (
          <RowActions
            onEdit={params.row.isActive ? () => route({ url: routes.van.edit(params?.row?.id) }) : undefined}
            onActivate={params.row.isActive ? undefined : () => handleActivate(params.row)}
            onDeactivate={params.row.isActive ? () => handleDeactivate(params.row) : undefined}
            isLoading={
              (activateVan.isPending && activateVan.variables?.id === params.row.id) ||
              (deactivateVan.isPending && deactivateVan.variables?.id === params.row.id)
            }
          />
        ),
        width: 150,
        sortable: false,
        filterable: false,
      },
    ],
    [
      activateVan.isPending,
      activateVan.variables?.id,
      deactivateVan.isPending,
      deactivateVan.variables?.id,
      formattedMessages.actionsHeaderName,
      formattedMessages.areasHeaderName,
      formattedMessages.codeHeaderName,
      formattedMessages.colorHeaderName,
      formattedMessages.nameHeaderName,
      formattedMessages.maleConfirmedHeaderName,
      formattedMessages.maleAppliedHeaderName,
      formattedMessages.femaleConfirmedHeaderName,
      formattedMessages.femaleAppliedHeaderName,
      handleActivate,
      handleDeactivate,
      route,
    ],
  );

  return (
    <Stack>
      {/* Van Rules Description */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        <FormattedMessage {...messages.vanRulesDescription} />
      </Typography>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {extractNetworkError(error)}
        </Alert>
      )}

      <DataTable<Van>
        pagination
        columns={columns}
        filterMode="server"
        sortingMode="server"
        paginationMode="server"
        filterDebounceMs={500}
        isLoading={isLoading}
        rows={vans?.data || []}
        getRowId={(row) => row?.id}
        rowCount={rowCount}
        pageSizeOptions={[10, 20, 50, 100]}
        onSortModelChange={handleSortModelChange}
        onFilterModelChange={handleFilterModelChange}
        onPaginationModelChange={handlePaginationModelChange}
        paginationModel={paginationModel}
        noDataFound={formattedMessages.noRowsLabel}
        rowClickUrl={(row) => (row.isActive ? `${routes.van.detail(row?.id?.toString())}` : '')}
      />
    </Stack>
  );
}
