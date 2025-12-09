'use client';

import { useEffect, useMemo, useState } from 'react';

import { Alert, Stack } from '@mui/material';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

import { DataTable } from '@/components/DataTable';
import { RowActions } from '@/components/RowActions';

import { KEYS } from '@/providers/constants/key';
import { Branch, BranchControllerFindAllSortBy } from '@/providers/service/app.schemas';
import {
  useBranchControllerActivate,
  useBranchControllerDeactivate,
  useBranchControllerFindAll,
} from '@/providers/service/branch/branch';

import { useFormattedMessage } from '@/theme/FormattedMessage';

import { useActivationHandlers } from '@/hooks/useActivationHandlers';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { useListingFilters } from '@/hooks/useListingFilters';
import { useMutationHandlers } from '@/hooks/useMutationHandlers';

import { routes } from '@/router/routes';
import { useQueryParams } from '@/router/useQueryParams';

import { extractNetworkError } from '@/utils/extractNetworkError';

import messages from './messages';

export default function BranchesListing() {
  const { route } = useQueryParams();
  const activateBranch = useBranchControllerActivate();
  const deactivateBranch = useBranchControllerDeactivate();
  const { isAuthenticated: enabled } = useAuthenticatedApi();

  const formattedMessages = {
    errorUpdate: useFormattedMessage(messages.errorSuccess),
    noRowsLabel: useFormattedMessage(messages.noData),
    successUpdate: useFormattedMessage(messages.updateSuccess),
    codeHeaderName: useFormattedMessage(messages.codeHeaderName),
    nameHeaderName: useFormattedMessage(messages.nameHeaderName),
    actionsHeaderName: useFormattedMessage(messages.actionsHeaderName),
  };

  const { onSuccess, onError } = useMutationHandlers({
    queryKey: [KEYS.BRANCH_LISTING],
    supportQueryKey: [KEYS.BRANCH_DETAIL],
    messages: {
      successUpdate: formattedMessages.successUpdate,
      errorUpdate: formattedMessages.errorUpdate,
    },
  });

  const { handleActivate, handleDeactivate } = useActivationHandlers<Branch>(
    activateBranch,
    deactivateBranch,
    onSuccess,
    onError,
  );

  const { filters, handleSortModelChange, handleFilterModelChange, handlePaginationModelChange } = useListingFilters();

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
    data: branches,
    isLoading,
    isError,
    error,
  } = useBranchControllerFindAll(
    {
      sortBy: filters.sortBy as BranchControllerFindAllSortBy,
      sortOrder: filters.sortOrder || 'desc',
      skip: filters.page * filters.pageSize,
      take: filters.pageSize,
      includeInActive: filters.includeInActive,
      name: filters?.name as string,
      code: filters?.code as string,
    },
    {
      query: {
        enabled,
        queryKey: [KEYS.BRANCH_LISTING, filters],
      },
    },
  );

  const rowCount = useMemo(() => {
    return branches?.count;
  }, [branches?.count]);

  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'code', headerName: formattedMessages.codeHeaderName, flex: 1 },
      { field: 'name', headerName: formattedMessages.nameHeaderName, flex: 1 },
      {
        field: 'actions',
        headerName: formattedMessages.actionsHeaderName,
        headerAlign: 'right',
        renderCell: (params) => (
          <RowActions
            onEdit={params.row.isActive ? () => route({ url: routes.branches.edit(params?.row?.id) }) : undefined}
            onActivate={params.row.isActive ? undefined : () => handleActivate(params.row)}
            onDeactivate={params.row.isActive ? () => handleDeactivate(params.row) : undefined}
            isLoading={
              (activateBranch.isPending && activateBranch.variables?.id === params.row.id) ||
              (deactivateBranch.isPending && deactivateBranch.variables?.id === params.row.id)
            }
          />
        ),
        width: 150,
        sortable: false,
        filterable: false,
      },
    ],
    [
      activateBranch.isPending,
      activateBranch.variables?.id,
      deactivateBranch.isPending,
      deactivateBranch.variables?.id,
      formattedMessages.actionsHeaderName,
      formattedMessages.codeHeaderName,
      formattedMessages.nameHeaderName,
      handleActivate,
      handleDeactivate,
      route,
    ],
  );

  return (
    <Stack>
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {extractNetworkError(error)}
        </Alert>
      )}
      <DataTable<Branch>
        pagination
        columns={columns}
        filterMode="server"
        sortingMode="server"
        paginationMode="server"
        filterDebounceMs={500}
        isLoading={isLoading}
        rows={branches?.data || []}
        getRowId={(row) => row?.id}
        rowCount={rowCount}
        pageSizeOptions={[10, 20, 50, 100]}
        onSortModelChange={handleSortModelChange}
        onFilterModelChange={handleFilterModelChange}
        onPaginationModelChange={handlePaginationModelChange}
        paginationModel={paginationModel}
        noDataFound={formattedMessages.noRowsLabel}
        rowClickUrl={(row) => (row.isActive ? `${routes.branches.detail(row?.id?.toString())}` : '')}
      />
    </Stack>
  );
}
