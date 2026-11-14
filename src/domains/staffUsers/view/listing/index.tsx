'use client';

import { useEffect, useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Print as PrintIcon, Search as SearchIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { GridColDef, GridPaginationModel, GridRowSelectionModel } from '@mui/x-data-grid';

import { cardStyle } from '@/domains/students/utils';

import { DataTable } from '@/components/DataTable';
import { PageHeading } from '@/components/PageHeading';

import { StaffRole, StaffUserEntity } from '@/providers/service/app.schemas';
import { useBranchControllerFindAll } from '@/providers/service/branch/branch';
import { useStaffUserControllerFindAll } from '@/providers/service/staff-user/staff-user';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import { routes } from '@/router/routes';

import { extractNetworkError } from '@/utils/extractNetworkError';

import { RoleChips } from '../../components/RoleChips';
import { StaffUserDialog } from '../../dialogs/StaffUserDialog';
import messages from '../../messages';
import { roleMessage, STAFF_ROLES } from '../../utils';

/** Staff app users: search, filter by role, add, open one, and pick some to print cards */
export function StaffUsersListing() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<StaffRole | ''>('');
  const [includeInActive, setIncludeInActive] = useState(false);
  const [pagination, setPagination] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [selection, setSelection] = useState<GridRowSelectionModel>({ type: 'include', ids: new Set() });
  const [creating, setCreating] = useState(false);

  // Search as they type, after a short pause
  useEffect(() => {
    const t = setTimeout(() => setSearch(input.trim()), 300);
    return () => clearTimeout(t);
  }, [input]);
  useEffect(() => setPagination((p) => ({ ...p, page: 0 })), [search, role, includeInActive]);

  const text = {
    staffId: useFormattedMessage(messages.staffId),
    name: useFormattedMessage(messages.name),
    phone: useFormattedMessage(messages.phone),
    branches: useFormattedMessage(messages.branches),
    roles: useFormattedMessage(messages.roles),
    activePhones: useFormattedMessage(messages.activePhones),
    status: useFormattedMessage(messages.status),
    noRows: useFormattedMessage(messages.noStaffUsers),
  };

  const { data, isLoading, isError, error } = useStaffUserControllerFindAll({
    search: search || undefined,
    role: role || undefined,
    includeInActive,
    skip: pagination.page * pagination.pageSize,
    take: pagination.pageSize,
  });

  const { data: branches } = useBranchControllerFindAll({ take: 100 });
  const branchCode = useMemo(() => new Map((branches?.data || []).map((b) => [b.id, b.code])), [branches?.data]);

  const columns: GridColDef<StaffUserEntity>[] = useMemo(
    () => [
      {
        field: 'staffId',
        headerName: text.staffId,
        width: 110,
        sortable: false,
        renderCell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
              {row.staffId}
            </Typography>
          </Box>
        ),
      },
      { field: 'name', headerName: text.name, flex: 1, minWidth: 160, sortable: false },
      {
        field: 'roles',
        headerName: text.roles,
        flex: 1,
        minWidth: 200,
        sortable: false,
        renderCell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <RoleChips roles={row.roles} />
          </Box>
        ),
      },
      {
        field: 'branchIds',
        headerName: text.branches,
        width: 110,
        sortable: false,
        valueGetter: (_, row) => (row.branchIds ?? []).map((id) => branchCode.get(id) ?? id).join(', '),
      },
      { field: 'phone', headerName: text.phone, width: 150, sortable: false },
      { field: 'activeDevices', headerName: text.activePhones, width: 140, sortable: false, type: 'number' },
      {
        field: 'isActive',
        headerName: text.status,
        width: 130,
        sortable: false,
        renderCell: ({ row }) => (
          <Chip
            size="small"
            color={row.isActive ? 'success' : 'default'}
            variant={row.isActive ? 'filled' : 'outlined'}
            label={<FormattedMessage {...(row.isActive ? messages.active : messages.deactivated)} />}
          />
        ),
      },
    ],
    [text.staffId, text.name, text.roles, text.branches, text.phone, text.activePhones, text.status, branchCode],
  );

  const selectedIds = [...selection.ids].map(String);

  return (
    <Stack>
      <PageHeading
        heading={messages.listingTitle}
        onAddPress={() => setCreating(true)}
        rightActions={
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => router.push(routes.staffUsers.cards(selectedIds))}
            sx={{ borderRadius: '999px', textTransform: 'none', fontWeight: 600 }}
          >
            {selectedIds.length ? (
              <FormattedMessage {...messages.printSelectedCards} values={{ count: String(selectedIds.length) }} />
            ) : (
              <FormattedMessage {...messages.printCards} />
            )}
          </Button>
        }
      />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ sm: 'center' }}
        sx={{ ...cardStyle, bgcolor: 'background.paper', p: 2, mb: 2 }}
      >
        <TextField
          size="small"
          sx={{ flex: 1, maxWidth: 420 }}
          label={<FormattedMessage {...messages.searchLabel} />}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          select
          size="small"
          sx={{ minWidth: 180 }}
          label={<FormattedMessage {...messages.roleFilter} />}
          value={role}
          onChange={(e) => setRole(e.target.value as StaffRole | '')}
        >
          <MenuItem value="">
            <FormattedMessage {...messages.allRoles} />
          </MenuItem>
          {STAFF_ROLES.map((r) => (
            <MenuItem key={r} value={r}>
              <FormattedMessage {...roleMessage(r)} />
            </MenuItem>
          ))}
        </TextField>
        <FormControlLabel
          control={<Checkbox checked={includeInActive} onChange={(e) => setIncludeInActive(e.target.checked)} />}
          label={<FormattedMessage {...messages.showDeactivated} />}
        />
      </Stack>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {extractNetworkError(error)}
        </Alert>
      )}

      <DataTable<StaffUserEntity>
        columns={columns}
        rows={data?.data || []}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        rowCount={data?.count ?? 0}
        paginationMode="server"
        paginationModel={pagination}
        onPaginationModelChange={setPagination}
        pageSizeOptions={[20, 50, 100]}
        checkboxSelection
        keepNonExistentRowsSelected
        disableRowSelectionOnClick
        rowSelectionModel={selection}
        onRowSelectionModelChange={setSelection}
        // Not rowClickUrl: that skips deactivated rows, and they must open to be reactivated
        onRowClick={(params, event) => {
          if ((event.target as HTMLElement).closest('.MuiDataGrid-cellCheckbox')) return;
          router.push(routes.staffUsers.detail(String(params.id)));
        }}
        noDataFound={text.noRows}
        disableColumnFilter
      />

      <StaffUserDialog
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={(user) => router.push(routes.staffUsers.detail(user.id))}
      />
    </Stack>
  );
}
