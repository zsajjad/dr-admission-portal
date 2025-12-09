'use client';

import { useEffect, useMemo, useState } from 'react';

import { Alert, Stack } from '@mui/material';
import { getGridStringOperators, GridColDef, GridPaginationModel } from '@mui/x-data-grid';

import { DataTable } from '@/components/DataTable';
import { RowActions } from '@/components/RowActions';

import { KEYS } from '@/providers/constants/key';
import {
  useAdminAuthControllerEnableLogin,
  useAdminAuthControllerGetAdminDetails,
} from '@/providers/service/admin-auth/admin-auth';
import {
  useAdminUsersControllerActivate,
  useAdminUsersControllerDeactivate,
  useAdminUsersControllerFindAll,
} from '@/providers/service/admin-users/admin-users';
import { AdminUser, AdminUsersControllerFindAllParams } from '@/providers/service/app.schemas';

import { useFormattedMessage } from '@/theme/FormattedMessage';

import { useActivationHandlers } from '@/hooks/useActivationHandlers';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { useListingFilters } from '@/hooks/useListingFilters';
import { useMutationHandlers } from '@/hooks/useMutationHandlers';

import { extractNetworkError } from '@/utils/extractNetworkError';

import messages from './messages';

const adminFilterKeys: (keyof AdminUsersControllerFindAllParams)[] = [
  'email',
  'name',
  'includeInActive',
  'skip',
  'sortBy',
  'sortOrder',
  'take',
];

export default function AdminUsersListing() {
  const { isAuthenticated: enabled } = useAuthenticatedApi();
  const activateAdminUser = useAdminUsersControllerActivate();
  const deactivateAdminUser = useAdminUsersControllerDeactivate();

  const { mutateAsync, isPending } = useAdminAuthControllerEnableLogin();

  const formattedMessages = {
    errorUpdate: useFormattedMessage(messages.errorSuccess),
    noRowsLabel: useFormattedMessage(messages.noData),
    successUpdate: useFormattedMessage(messages.updateSuccess),
    loginDisabled: useFormattedMessage(messages.loginDisabled),

    // Column Headers
    email: useFormattedMessage(messages.email),
    name: useFormattedMessage(messages.name),
    role: useFormattedMessage(messages.role),
    createdAt: useFormattedMessage(messages.createdAt),
    actions: useFormattedMessage(messages.actions),
  };

  const { onSuccess, onError } = useMutationHandlers({
    queryKey: [KEYS.ADMIN_USERS_LISTING],
    messages: {
      successUpdate: formattedMessages.successUpdate,
      errorUpdate: formattedMessages.errorUpdate,
    },
  });

  const { handleActivate, handleDeactivate } = useActivationHandlers<AdminUser>(
    activateAdminUser,
    deactivateAdminUser,
    onSuccess,
    onError,
  );

  const { filters, handleSortModelChange, handleFilterModelChange, handlePaginationModelChange } =
    useListingFilters<AdminUsersControllerFindAllParams>();

  const queryFilterKeys = useMemo(() => {
    return Object.entries(filters).filter(([key]) =>
      adminFilterKeys.includes(key as keyof AdminUsersControllerFindAllParams),
    );
  }, [filters]);

  const { data: adminDetails } = useAdminAuthControllerGetAdminDetails();

  const { data, isLoading, error, isError, refetch } = useAdminUsersControllerFindAll(
    {
      sortBy: filters?.sortBy,
      sortOrder: filters?.sortOrder,
      skip: filters.page * filters.pageSize,
      take: filters.pageSize,
      email: filters?.email,
      name: filters?.name,
      includeInActive: filters?.includeInActive,
    },
    {
      query: { queryKey: [KEYS.ADMIN_USERS_LISTING, queryFilterKeys], enabled },
    },
  );

  const rowCount = useMemo(() => {
    return data?.count;
  }, [data?.count]);

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
        field: 'email',
        headerName: formattedMessages.email,
        flex: 1,
        filterOperators: getGridStringOperators().filter((operator) => operator.value === 'contains'),
      },
      {
        field: 'name',
        headerName: formattedMessages.name,
        flex: 1,
        filterOperators: getGridStringOperators().filter((operator) => operator.value === 'contains'),
      },
      {
        field: 'role',
        headerName: formattedMessages.role,
        flex: 1,
        sortable: false,
        filterable: false,
      },
      {
        field: 'loginDisabled',
        headerName: formattedMessages.loginDisabled,
        filterable: false,
        sortable: false,
        headerAlign: 'right',
        renderCell: (params) => {
          if (params.row.id === adminDetails?.data.id || !params.row.isLoginDisabled) {
            return <RowActions empty />;
          }
          return (
            <RowActions
              messageKeys={{
                deactivate: 'enable',
              }}
              onActivate={() =>
                mutateAsync(
                  {
                    data: {
                      adminUserId: params.row.id,
                    },
                  },
                  {
                    onSuccess: () => {
                      refetch();
                    },
                  },
                )
              }
              isLoading={isPending}
            />
          );
        },
      },
      {
        field: 'actions',
        headerName: formattedMessages.actions,
        filterable: false,
        sortable: false,
        headerAlign: 'right',
        renderCell: (params) => {
          if (params.row.id === adminDetails?.data.id) {
            return <RowActions empty />;
          }
          return (
            <RowActions
              onActivate={params.row.isActive ? undefined : () => handleActivate(params.row)}
              onDeactivate={params.row.isActive ? () => handleDeactivate(params.row) : undefined}
              isLoading={
                (activateAdminUser.isPending && activateAdminUser.variables?.id === params.row.id) ||
                (deactivateAdminUser.isPending && deactivateAdminUser.variables?.id === params.row.id)
              }
            />
          );
        },
      },
    ],
    [
      formattedMessages.email,
      formattedMessages.name,
      formattedMessages.role,
      formattedMessages.loginDisabled,
      formattedMessages.actions,
      adminDetails?.data.id,
      isPending,
      mutateAsync,
      refetch,
      activateAdminUser.isPending,
      activateAdminUser.variables?.id,
      deactivateAdminUser.isPending,
      deactivateAdminUser.variables?.id,
      handleActivate,
      handleDeactivate,
    ],
  );

  return (
    <Stack>
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {extractNetworkError(error)}
        </Alert>
      )}
      <DataTable<AdminUser>
        pagination
        columns={columns}
        filterMode="server"
        sortingMode="server"
        paginationMode="server"
        filterDebounceMs={500}
        isLoading={isLoading}
        rows={data?.data || []}
        getRowId={(row) => row.id}
        rowCount={rowCount}
        pageSizeOptions={[10, 20, 50, 100]}
        onSortModelChange={handleSortModelChange}
        onFilterModelChange={handleFilterModelChange}
        onPaginationModelChange={handlePaginationModelChange}
        paginationModel={paginationModel}
        noDataFound={formattedMessages.noRowsLabel}
        showPointer={false}
      />
    </Stack>
  );
}
