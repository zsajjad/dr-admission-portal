'use client';

import { useEffect, useMemo, useState } from 'react';

import { useIntl } from 'react-intl';

import { useRouter } from 'next/navigation';

import { Alert, Box, Button, Chip, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';

import { UrlTextFilter } from '@/domains/trainings/components/Filters';

import { AreaFilter } from '@/components/AreaFilter';
import { DataTable } from '@/components/DataTable';

import { School, SchoolControllerFindAllSortBy, SchoolKind } from '@/providers/service/app.schemas';
import { useSchoolControllerFindAll } from '@/providers/service/school/school';

import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { useListingFilters } from '@/hooks/useListingFilters';

import { routes } from '@/router/routes';
import { useQueryParams } from '@/router/useQueryParams';

import { extractNetworkError } from '@/utils/extractNetworkError';

import { cardStyle, KIND_LABELS, KINDS, useAreas } from '../components/common';
import { CreateSchoolDialog, MergeDialog } from '../components/dialogs';
import messages from '../messages';

interface SchoolFilters {
  search?: string;
  areaId?: string;
  kind?: SchoolKind;
  includeInActive?: string;
  sortBy?: string;
  create?: string;
}

/** Selects show their empty choice ("All") instead of a blank box */
const EMPTY_SHOWS = { select: { displayEmpty: true }, inputLabel: { shrink: true } } as const;

const EMPTY_SELECTION: GridRowSelectionModel = { type: 'include', ids: new Set() };

export function SchoolsList() {
  const intl = useIntl();
  const router = useRouter();
  const { deleteParams } = useQueryParams();
  const { isAuthenticated: enabled } = useAuthenticatedApi();
  const { filters, setFilter, handleSortModelChange, handlePaginationModelChange } = useListingFilters<SchoolFilters>();
  const { byId: areasById } = useAreas();

  const [selection, setSelection] = useState<GridRowSelectionModel>(EMPTY_SELECTION);
  // Selected rows stay selected across pages, so keep the rows themselves too
  const [picked, setPicked] = useState<Map<string, School>>(new Map());
  const [merging, setMerging] = useState(false);

  const params = {
    search: filters.search || undefined,
    areaId: filters.areaId || undefined,
    kind: filters.kind || undefined,
    includeInActive: filters.includeInActive === 'true' || undefined,
    sortBy: (filters.sortBy as SchoolControllerFindAllSortBy) || 'name',
    sortOrder: filters.sortOrder || 'asc',
    skip: filters.page * filters.pageSize,
    take: Math.min(filters.pageSize, 100),
  };
  const { data, isLoading, isError, error } = useSchoolControllerFindAll(params, { query: { enabled } });
  const rows = useMemo(() => data?.data ?? [], [data]);

  useEffect(() => {
    setPicked((prev) => {
      const next = new Map<string, School>();
      for (const id of selection.ids) {
        const row = rows.find((r) => r.id === id) ?? prev.get(String(id));
        if (row) next.set(String(id), row);
      }
      return next;
    });
  }, [selection, rows]);

  const selected = [...picked.values()];
  const clearSelection = () => setSelection(EMPTY_SELECTION);

  const columns: GridColDef<School>[] = useMemo(
    () => [
      {
        field: 'name',
        headerName: intl.formatMessage(messages.name),
        flex: 1.4,
        minWidth: 220,
        renderCell: ({ row }) => (
          <Stack sx={{ py: 0.75, lineHeight: 1.2, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {row.name}
            </Typography>
            <Tooltip title={row.aliases.join(' · ')} placement="bottom-start" disableInteractive>
              <Typography variant="caption" color="text.secondary" noWrap>
                {intl.formatMessage(messages.otherSpellings, { count: row.aliases.length })}
              </Typography>
            </Tooltip>
          </Stack>
        ),
      },
      {
        field: 'kind',
        headerName: intl.formatMessage(messages.kind),
        width: 110,
        sortable: false,
        valueGetter: (_v, row) => intl.formatMessage(KIND_LABELS[row.kind]),
      },
      {
        field: 'areaIds',
        headerName: intl.formatMessage(messages.areas),
        flex: 1,
        minWidth: 160,
        sortable: false,
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ height: '100%', overflow: 'hidden' }}>
            {row.areaIds.map((id) => {
              const area = areasById.get(id);
              return (
                <Chip
                  key={id}
                  size="small"
                  variant="outlined"
                  className="font-urdu"
                  label={area ? area.name : '?'}
                  title={area ? `${area.code} · ${area.name}` : id}
                />
              );
            })}
          </Stack>
        ),
      },
      {
        field: 'admissionCount',
        headerName: intl.formatMessage(messages.admissions),
        width: 110,
        align: 'right',
        headerAlign: 'right',
        sortable: false,
        renderCell: ({ row }) =>
          row.admissionCount === undefined ? (
            <Tooltip title={intl.formatMessage(messages.admissionsUnknown)}>
              <span>--</span>
            </Tooltip>
          ) : (
            <span dir="ltr">{intl.formatNumber(row.admissionCount)}</span>
          ),
      },
      {
        field: 'isActive',
        headerName: intl.formatMessage(messages.status),
        width: 100,
        sortable: false,
        renderCell: ({ row }) =>
          row.isActive === false ? <Chip size="small" label={intl.formatMessage(messages.inactive)} /> : null,
      },
    ],
    [intl, areasById],
  );

  return (
    <Stack spacing={2.5}>
      <Typography variant="body2" color="text.secondary">
        {intl.formatMessage(messages.listHelp)}
      </Typography>

      <Box sx={cardStyle}>
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
          }}
        >
          <UrlTextFilter param="search" label={intl.formatMessage(messages.search)} minWidth={0} />
          <AreaFilter minWidth={0} />
          <TextField
            select
            size="small"
            label={intl.formatMessage(messages.kind)}
            value={filters.kind ?? ''}
            onChange={(e) => setFilter({ kind: e.target.value || undefined, page: 0 })}
            slotProps={EMPTY_SHOWS}
          >
            <MenuItem value="">{intl.formatMessage(messages.all)}</MenuItem>
            {KINDS.map((k) => (
              <MenuItem key={k} value={k}>
                {intl.formatMessage(KIND_LABELS[k])}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label={intl.formatMessage(messages.status)}
            value={filters.includeInActive === 'true' ? 'true' : ''}
            onChange={(e) => setFilter({ includeInActive: e.target.value || undefined, page: 0 })}
            slotProps={EMPTY_SHOWS}
          >
            <MenuItem value="">{intl.formatMessage(messages.activeOnly)}</MenuItem>
            <MenuItem value="true">{intl.formatMessage(messages.activeAndInactive)}</MenuItem>
          </TextField>
        </Box>
      </Box>

      {selected.length > 0 && (
        <Box sx={{ ...cardStyle, py: 1.5, bgcolor: 'var(--mui-palette-brand-goldSoft)' }}>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {intl.formatMessage(messages.selected, { count: selected.length })}
            </Typography>
            {selected.length === 2 && (
              <Button size="small" variant="outlined" color="error" onClick={() => setMerging(true)}>
                {intl.formatMessage(messages.mergeSelected)}
              </Button>
            )}
            <Box sx={{ flex: 1 }} />
            <Button size="small" onClick={clearSelection}>
              {intl.formatMessage(messages.clearSelection)}
            </Button>
          </Stack>
        </Box>
      )}

      {isError && <Alert severity="error">{extractNetworkError(error)}</Alert>}

      <DataTable<School>
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        rowCount={data?.count ?? 0}
        paginationMode="server"
        sortingMode="server"
        paginationModel={{ page: filters.page, pageSize: filters.pageSize }}
        onPaginationModelChange={handlePaginationModelChange}
        sortModel={filters.sortBy ? [{ field: filters.sortBy, sort: filters.sortOrder ?? 'asc' }] : []}
        onSortModelChange={handleSortModelChange}
        pageSizeOptions={[20, 50, 100]}
        checkboxSelection
        keepNonExistentRowsSelected
        disableRowSelectionOnClick
        rowSelectionModel={selection}
        onRowSelectionModelChange={setSelection}
        // Not rowClickUrl: that skips inactive rows, and they must open to be reactivated
        onRowClick={(p, event) => {
          if ((event.target as HTMLElement).closest('.MuiDataGrid-cellCheckbox')) return;
          router.push(routes.schools.detail(String(p.id)));
        }}
        noDataFound={intl.formatMessage(messages.noSchools)}
        disableColumnFilter
      />

      <CreateSchoolDialog
        open={filters.create === 'true'}
        onClose={() => deleteParams(['create'])}
        onCreated={(school) => router.push(routes.schools.detail(school.id))}
      />
      <MergeDialog
        open={merging}
        keep={selected[0] ?? null}
        remove={selected[1] ?? null}
        onClose={() => setMerging(false)}
        onMerged={clearSelection}
      />
    </Stack>
  );
}
