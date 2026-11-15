'use client';

import { KeyboardEvent, MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useIntl } from 'react-intl';

import { useRouter } from 'next/navigation';

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';

import { UrlTextFilter } from '@/domains/trainings/components/Filters';

import { AreaFilter } from '@/components/AreaFilter';
import { DataTable } from '@/components/DataTable';

import {
  ListSchoolsResponseDto,
  School,
  SchoolControllerFindAllParams,
  SchoolControllerFindAllSortBy,
  SchoolKind,
  UpdateSchoolDto,
} from '@/providers/service/app.schemas';
import { schoolControllerUpdate, useSchoolControllerFindAll } from '@/providers/service/school/school';

import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { useListingFilters } from '@/hooks/useListingFilters';

import { routes } from '@/router/routes';
import { useQueryParams } from '@/router/useQueryParams';

import { extractNetworkError } from '@/utils/extractNetworkError';

import {
  AttributeSelect,
  cardStyle,
  KIND_LABELS,
  KINDS,
  useAreas,
  useNotify,
  useRefreshSchools,
} from '../components/common';
import { CreateSchoolDialog, MergeDialog } from '../components/dialogs';
import messages from '../messages';
import { Attribute, ATTRIBUTES, bulkChanges, runInBatches } from '../rules';

interface SchoolFilters {
  search?: string;
  areaId?: string;
  kind?: SchoolKind;
  includeInActive?: string;
  sortBy?: string;
  create?: string;
  type?: string;
  feeBand?: string;
  medium?: string;
  attributesMissing?: string;
}

type Choice = Partial<Record<Attribute, string>>;

/** Keeps clicks and keys in a cell's editor from opening the school or moving the grid's focus */
const stop = (e: MouseEvent | KeyboardEvent) => e.stopPropagation();

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
  const [choice, setChoice] = useState<Choice>({});
  const [progress, setProgress] = useState<number | null>(null);
  const [savingCell, setSavingCell] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const notify = useNotify();
  const refresh = useRefreshSchools();

  const params: SchoolControllerFindAllParams = {
    search: filters.search || undefined,
    areaId: filters.areaId || undefined,
    kind: filters.kind || undefined,
    type: (filters.type as SchoolControllerFindAllParams['type']) || undefined,
    feeBand: (filters.feeBand as SchoolControllerFindAllParams['feeBand']) || undefined,
    medium: (filters.medium as SchoolControllerFindAllParams['medium']) || undefined,
    attributesMissing: filters.attributesMissing === 'true' || undefined,
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

  /** Puts a saved school into every loaded list page, so the row updates without a refetch (and stays put) */
  const putInLists = useCallback(
    (school: School) =>
      queryClient.setQueriesData<ListSchoolsResponseDto>({ predicate: (q) => q.queryKey[0] === '/school' }, (old) =>
        old ? { ...old, data: old.data.map((r) => (r.id === school.id ? school : r)) } : old,
      ),
    [queryClient],
  );

  // One detail of one school, straight from its cell
  const saveCell = useCallback(
    async (school: School, attribute: Attribute, value: string) => {
      const cell = `${school.id}:${attribute}`;
      setSavingCell(cell);
      try {
        const res = await schoolControllerUpdate(school.id, { [attribute]: value || null } as UpdateSchoolDto);
        if (res.data) putInLists(res.data);
      } catch (err) {
        notify.error(err);
      } finally {
        setSavingCell((c) => (c === cell ? null : c));
      }
    },
    [notify, putInLists],
  );

  // The chosen details on every selected school, a few at a time; the ones that fail stay selected
  const applyToSelected = async () => {
    const dto = bulkChanges(choice) as UpdateSchoolDto;
    if (!Object.keys(dto).length || !selected.length) return;
    setProgress(0);
    const { done, failed } = await runInBatches(selected, (s) => schoolControllerUpdate(s.id, dto), {
      onProgress: setProgress,
    });
    setProgress(null);
    await refresh();
    if (failed.length) {
      notify.error(
        intl.formatMessage(messages.appliedWithFailures, {
          done,
          failed: failed.length,
          names: failed.map((f) => f.item.name).join(', '),
        }),
      );
      setSelection({ type: 'include', ids: new Set(failed.map((f) => f.item.id)) });
    } else {
      notify.success(intl.formatMessage(messages.applied, { count: done }));
      setChoice({});
      clearSelection();
    }
  };
  const canApply = Object.keys(bulkChanges(choice)).length > 0 && progress === null;

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
                {intl.formatMessage(KIND_LABELS[row.kind])}
                {' · '}
                {intl.formatMessage(messages.otherSpellings, { count: row.aliases.length })}
              </Typography>
            </Tooltip>
          </Stack>
        ),
      },
      {
        field: 'areaIds',
        headerName: intl.formatMessage(messages.areas),
        flex: 0.7,
        minWidth: 100,
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
      ...ATTRIBUTES.map(
        (attribute): GridColDef<School> => ({
          field: attribute,
          headerName: intl.formatMessage(messages[attribute]),
          width: attribute === 'type' ? 245 : attribute === 'feeBand' ? 135 : 115,
          sortable: false,
          renderCell: ({ row }) => (
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{ height: '100%', cursor: 'default' }}
              onClick={stop}
              onKeyDown={stop}
            >
              <AttributeSelect
                attribute={attribute}
                value={row[attribute]}
                onChange={(v) => saveCell(row, attribute, v)}
                size="small"
                variant="standard"
                label={false}
                disabled={savingCell === `${row.id}:${attribute}`}
              />
              {savingCell === `${row.id}:${attribute}` && <CircularProgress size={14} />}
            </Stack>
          ),
        }),
      ),
      {
        field: 'admissionCount',
        headerName: intl.formatMessage(messages.admissions),
        width: 100,
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
        width: 90,
        sortable: false,
        renderCell: ({ row }) =>
          row.isActive === false ? <Chip size="small" label={intl.formatMessage(messages.inactive)} /> : null,
      },
    ],
    [intl, areasById, saveCell, savingCell],
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
          {ATTRIBUTES.map((attribute) => (
            <AttributeSelect
              key={attribute}
              attribute={attribute}
              value={filters[attribute]}
              onChange={(v) => setFilter({ [attribute]: v || undefined, page: 0 })}
              emptyLabel={messages.all}
              size="small"
            />
          ))}
          <TextField
            select
            size="small"
            label={intl.formatMessage(messages.detailsMissing)}
            value={filters.attributesMissing === 'true' ? 'true' : ''}
            onChange={(e) => setFilter({ attributesMissing: e.target.value || undefined, page: 0 })}
            slotProps={EMPTY_SHOWS}
          >
            <MenuItem value="">{intl.formatMessage(messages.detailsAll)}</MenuItem>
            <MenuItem value="true">{intl.formatMessage(messages.detailsMissingOnly)}</MenuItem>
          </TextField>
        </Box>
      </Box>

      {selected.length > 0 && (
        <Box sx={{ ...cardStyle, py: 1.5, bgcolor: 'var(--mui-palette-brand-goldSoft)' }}>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {intl.formatMessage(messages.selected, { count: selected.length })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {intl.formatMessage(messages.setForSelected)}
            </Typography>
            {ATTRIBUTES.map((attribute) => (
              <Box key={attribute} sx={{ width: attribute === 'type' ? 220 : 150 }}>
                <AttributeSelect
                  attribute={attribute}
                  value={choice[attribute]}
                  onChange={(v) => setChoice((c) => ({ ...c, [attribute]: v || undefined }))}
                  emptyLabel={messages.keepAsIs}
                  size="small"
                  disabled={progress !== null}
                />
              </Box>
            ))}
            <Button
              size="small"
              variant="contained"
              disabled={!canApply}
              onClick={applyToSelected}
              startIcon={progress !== null ? <CircularProgress size={14} color="inherit" /> : undefined}
            >
              {progress !== null
                ? intl.formatMessage(messages.applying, { done: progress, total: selected.length })
                : intl.formatMessage(messages.apply)}
            </Button>
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
