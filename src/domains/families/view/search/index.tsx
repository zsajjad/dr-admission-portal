'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

import { useIntl } from 'react-intl';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { Search as SearchIcon } from '@mui/icons-material';
import { Alert, Box, Button, Chip, Link as MuiLink, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';

import { cardStyle } from '@/domains/schools/components/common';

import { BranchFilter } from '@/components/BranchFilter';
import { DataTable } from '@/components/DataTable';
import { SessionFilter } from '@/components/SessionFilter';

import { FamilyEntity, FamilyRelationScope, FamilySplit } from '@/providers/service/app.schemas';
import { useFamiliesControllerFindAll } from '@/providers/service/families/families';

import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { useListingFilters } from '@/hooks/useListingFilters';

import { routes } from '@/router/routes';

import { extractNetworkError } from '@/utils/extractNetworkError';

import { SearchRow, useFamilySearch } from '../../api';
import messages from '../../messages';
import {
  ageOn,
  byBirthOrder,
  digitsOf,
  firstFew,
  foldName,
  formatPhone,
  mostCommonFirst,
  queryKind,
} from '../../rules';

const EMPTY_SHOWS = { select: { displayEmpty: true }, inputLabel: { shrink: true } } as const;

/** A cell with several lines; rows grow to fit (Urdu names in Nastaliq are tall) */
const cellSx = { py: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0.25, minWidth: 0 };

/** The helper under the box: what will be searched */
function useQueryHint(input: string) {
  const intl = useIntl();
  const kind = queryKind(input);
  const q = input.trim();
  if (!q) return intl.formatMessage(messages.hintShort);
  if (kind === 'PHONE') return intl.formatMessage(messages.hintPhone, { q: `⁦${digitsOf(q)}⁩` });
  if (kind === 'GR') return intl.formatMessage(messages.hintGr, { q: `⁦${q}⁩` });
  if (kind === 'FATHER_NAME') return intl.formatMessage(messages.hintName, { q: foldName(q) });
  return intl.formatMessage(messages.hintShort);
}

interface ListFilters {
  q?: string;
  sessionId?: string;
  branchId?: string;
  minChildren?: string;
  split?: string;
  relationScope?: string;
}

/**
 * Families (UX spec, screen 2): one box for a phone, a name or a GR. Before a search, the confirmed households,
 * filtered by session, branch, children attending and split. Households start empty, so a search also shows
 * possible households built from matches, which open with Confirm buttons.
 */
export function FamiliesSearch() {
  const intl = useIntl();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [input, setInput] = useState(query);
  const hint = useQueryHint(input);

  useEffect(() => setInput(query), [query]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    router.replace(q ? routes.families.search(q) : routes.families.listing);
  };

  return (
    <Stack spacing={2.5}>
      <Box component="form" onSubmit={submit} sx={{ ...cardStyle, p: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <TextField
            autoFocus
            size="small"
            fullWidth
            label={intl.formatMessage(messages.searchLabel)}
            helperText={hint}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button type="submit" variant="contained" startIcon={<SearchIcon />} sx={{ minWidth: 120 }}>
            {intl.formatMessage(messages.searchButton)}
          </Button>
        </Stack>
      </Box>
      {query.trim() ? <SearchResults q={query.trim()} /> : <ConfirmedFamilies />}
    </Stack>
  );
}

/** One line per child (eldest first, up to four): the name, bold when it matched, then age, class and branch */
function ChildrenList({ items }: { items: { key: string; name: string; detail: string; bold?: boolean }[] }) {
  const intl = useIntl();
  const { shown, more } = firstFew(items, 4);
  return (
    <>
      {shown.map((c) => (
        <Typography key={c.key} variant="body2" sx={{ whiteSpace: 'normal' }}>
          <Box component="span" sx={{ fontWeight: c.bold ? 700 : 400 }}>
            {c.name}
          </Box>
          {c.detail && (
            <Typography component="span" variant="body2" color="text.secondary">
              {` · ${c.detail}`}
            </Typography>
          )}
        </Typography>
      ))}
      {more > 0 && (
        <Typography variant="caption" color="text.secondary">
          {intl.formatMessage(messages.more, { count: more })}
        </Typography>
      )}
    </>
  );
}

function SearchResults({ q }: { q: string }) {
  const intl = useIntl();
  const router = useRouter();
  const kind = queryKind(q);
  const [pagination, setPagination] = useState({ page: 0, pageSize: 20 });
  useEffect(() => setPagination((p) => ({ ...p, page: 0 })), [q]);
  const { rows, count, truncated, normalized, isLoading, isError, error } = useFamilySearch(
    q,
    pagination.page,
    pagination.pageSize,
  );
  const matchedPhone = kind === 'PHONE' ? (normalized ?? digitsOf(q).slice(-10)) : '';

  const columns = useMemo<GridColDef<SearchRow>[]>(
    () => [
      {
        field: 'fatherName',
        headerName: intl.formatMessage(messages.colFatherName),
        flex: 1,
        minWidth: 170,
        sortable: false,
        renderCell: ({ row }) => (
          <Box sx={cellSx}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {row.fatherNames[0] ?? '--'}
            </Typography>
            {row.fatherNames.length > 1 && (
              <Typography variant="caption" color="text.secondary">
                {intl.formatMessage(messages.also, { names: row.fatherNames.slice(1).join(', ') })}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        // Named `phone` so the grid keeps it left to right in Urdu
        field: 'phone',
        headerName: intl.formatMessage(messages.colPhones),
        width: 150,
        sortable: false,
        renderCell: ({ row }) => (
          <Box sx={cellSx} dir="ltr">
            {row.phones.map((p) => (
              <Typography
                key={p}
                variant="body2"
                sx={{ fontWeight: matchedPhone && digitsOf(p).endsWith(matchedPhone) ? 700 : 400 }}
              >
                {formatPhone(p)}
              </Typography>
            ))}
          </Box>
        ),
      },
      {
        field: 'children',
        headerName: intl.formatMessage(messages.colChildren),
        flex: 1.6,
        minWidth: 260,
        sortable: false,
        renderCell: ({ row }) => (
          <Box sx={cellSx}>
            <ChildrenList
              items={[...row.children].sort(byBirthOrder).map((c) => ({
                key: c.id,
                name: c.name,
                detail: [
                  ageOn(c.dateOfBirth),
                  c.latest && `${c.latest.classLevelName} · ${c.latest.branchCode} (${c.latest.sessionName})`,
                ]
                  .filter((x) => x !== undefined && x !== null && x !== '')
                  .join(' · '),
                bold: c.matched,
              }))}
            />
          </Box>
        ),
      },
      {
        field: 'areas',
        headerName: intl.formatMessage(messages.colArea),
        flex: 0.8,
        minWidth: 120,
        sortable: false,
        renderCell: ({ row }) => (
          <Box sx={cellSx}>
            <Typography variant="body2">{row.areas.map((a) => a.name).join(', ') || '--'}</Typography>
          </Box>
        ),
      },
      {
        field: 'schools',
        headerName: intl.formatMessage(messages.colSchools),
        flex: 1,
        minWidth: 140,
        sortable: false,
        renderCell: ({ row }) => (
          <Box sx={cellSx}>
            <Typography variant="body2" color={row.schools.length ? 'text.primary' : 'text.secondary'}>
              {row.schools.join(', ') || intl.formatMessage(messages.unknown)}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'kind',
        headerName: '',
        width: 110,
        sortable: false,
        renderCell: ({ row }) => (
          <Box sx={cellSx}>
            {row.kind === 'HOUSEHOLD' ? (
              <Chip size="small" color="primary" variant="outlined" label={intl.formatMessage(messages.chipFamily)} />
            ) : (
              <Chip
                size="small"
                color="warning"
                variant="outlined"
                sx={{ borderStyle: 'dashed' }}
                label={intl.formatMessage(messages.chipPossible)}
              />
            )}
          </Box>
        ),
      },
    ],
    [intl, matchedPhone],
  );

  if (isError) return <Alert severity="error">{extractNetworkError(error)}</Alert>;
  if (kind === 'TOO_SHORT') return <Alert severity="info">{intl.formatMessage(messages.hintShort)}</Alert>;

  return (
    <Stack spacing={1.5}>
      {truncated && <Alert severity="warning">{intl.formatMessage(messages.truncated)}</Alert>}
      {!isLoading && rows.length === 0 ? (
        <Alert severity="info">
          {intl.formatMessage(messages.noSearchResults, { q })}{' '}
          <MuiLink component={Link} href={`${routes.students.listing}?q=${encodeURIComponent(q)}`}>
            {intl.formatMessage(messages.searchStudents)}
          </MuiLink>
        </Alert>
      ) : (
        <>
          <Typography variant="subtitle2" color="text.secondary">
            {intl.formatMessage(messages.resultsCount, { count })}
          </Typography>
          <DataTable<SearchRow>
            columns={columns}
            rows={rows}
            getRowId={(row) => row.familyId ?? `p-${row.anchorStudentId}`}
            isLoading={isLoading}
            getRowHeight={() => 'auto'}
            rowCount={count}
            paginationMode="server"
            paginationModel={pagination}
            onPaginationModelChange={setPagination}
            pageSizeOptions={[20, 50]}
            onRowClick={(p) =>
              router.push(
                p.row.familyId
                  ? routes.families.detail(p.row.familyId)
                  : routes.families.possible(p.row.anchorStudentId),
              )
            }
            noDataFound={intl.formatMessage(messages.noSearchResults, { q })}
            disableColumnFilter
          />
        </>
      )}
    </Stack>
  );
}

/** Confirmed households, before a search */
function ConfirmedFamilies() {
  const intl = useIntl();
  const { isAuthenticated } = useAuthenticatedApi();
  const { filters, setFilter, handlePaginationModelChange } = useListingFilters<ListFilters>();

  const { data, isLoading, isError, error } = useFamiliesControllerFindAll(
    {
      sessionId: filters.sessionId || undefined,
      branchId: filters.branchId || undefined,
      minChildren: filters.minChildren ? Number(filters.minChildren) : undefined,
      split: (filters.split as FamilySplit) || undefined,
      relationScope: (filters.relationScope as FamilyRelationScope) || undefined,
      sortBy: 'childrenAttending',
      skip: filters.page * filters.pageSize,
      take: Math.min(filters.pageSize, 100),
    },
    { query: { enabled: isAuthenticated } },
  );
  const rows = data?.data ?? [];
  const sessionName = data?.session?.name;

  const columns = useMemo<GridColDef<FamilyEntity>[]>(
    () => [
      {
        field: 'children',
        headerName: intl.formatMessage(messages.colChildren),
        flex: 1.8,
        minWidth: 320,
        sortable: false,
        renderCell: ({ row }) => (
          <Box sx={cellSx}>
            {[...row.members].sort(byBirthOrder).map((m) => (
              <Typography
                key={m.membershipId}
                variant="body2"
                color={m.admission?.attending ? 'text.primary' : 'text.secondary'}
              >
                <Box component="span" sx={{ fontWeight: 600 }}>
                  {m.name}
                </Box>
                {m.admission
                  ? ` · ${m.admission.classLevel.name}${m.admission.section ? ` ${m.admission.section.letter}` : ''} · ${m.admission.branch.code}`
                  : ` · ${intl.formatMessage(messages.notIn, { session: sessionName ?? '' })}`}
              </Typography>
            ))}
          </Box>
        ),
      },
      {
        field: 'fatherName',
        headerName: intl.formatMessage(messages.colFatherName),
        flex: 1,
        minWidth: 170,
        sortable: false,
        renderCell: ({ row }) => {
          const names = mostCommonFirst(
            row.members.map((m) => m.fatherName),
            foldName,
          );
          return (
            <Box sx={cellSx}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {names[0] ?? '--'}
              </Typography>
              {names.length > 1 && (
                <Typography variant="caption" color="text.secondary">
                  {intl.formatMessage(messages.also, { names: names.slice(1).join(', ') })}
                </Typography>
              )}
            </Box>
          );
        },
      },
      {
        field: 'childrenAttending',
        headerName: intl.formatMessage(messages.colAttending),
        width: 100,
        sortable: false,
        renderCell: ({ row }) => (
          <Box sx={cellSx}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {row.childrenAttending}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'branchCodes',
        headerName: intl.formatMessage(messages.colBranches),
        flex: 1,
        minWidth: 200,
        sortable: false,
        renderCell: ({ row }) => (
          <Box sx={cellSx}>
            <Typography variant="body2">{row.branchCodes.join(', ') || '--'}</Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {row.splitBranches && (
                <Chip
                  size="small"
                  color="warning"
                  variant="outlined"
                  label={intl.formatMessage(messages.splitBranches)}
                />
              )}
              {row.splitSections && (
                <Chip
                  size="small"
                  color="warning"
                  variant="outlined"
                  label={intl.formatMessage(messages.splitSections)}
                />
              )}
            </Stack>
          </Box>
        ),
      },
    ],
    [intl, sessionName],
  );

  return (
    <Stack spacing={1.5}>
      <Box sx={{ ...cardStyle, p: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(5, minmax(0, 1fr))' },
          }}
        >
          <SessionFilter minWidth={0} defaultToActive />
          <BranchFilter minWidth={0} />
          <TextField
            select
            size="small"
            label={intl.formatMessage(messages.filterMinChildren)}
            value={filters.minChildren ?? ''}
            onChange={(e) => setFilter({ minChildren: e.target.value || undefined, page: 0 })}
            slotProps={EMPTY_SHOWS}
          >
            <MenuItem value="">{intl.formatMessage(messages.minChildrenAny)}</MenuItem>
            {[1, 2, 3, 4].map((n) => (
              <MenuItem key={n} value={String(n)}>
                {intl.formatMessage(messages.minChildrenN, { count: n })}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label={intl.formatMessage(messages.filterSplit)}
            value={filters.split ?? ''}
            onChange={(e) => setFilter({ split: e.target.value || undefined, page: 0 })}
            slotProps={EMPTY_SHOWS}
          >
            <MenuItem value="">{intl.formatMessage(messages.splitNone)}</MenuItem>
            <MenuItem value={FamilySplit.BRANCHES}>{intl.formatMessage(messages.splitBranches)}</MenuItem>
            <MenuItem value={FamilySplit.SECTIONS}>{intl.formatMessage(messages.splitSections)}</MenuItem>
            <MenuItem value={FamilySplit.ANY}>{intl.formatMessage(messages.splitAny)}</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label={intl.formatMessage(messages.filterCount)}
            value={filters.relationScope ?? ''}
            onChange={(e) => setFilter({ relationScope: e.target.value || undefined, page: 0 })}
            slotProps={EMPTY_SHOWS}
          >
            <MenuItem value="">{intl.formatMessage(messages.scopeHOUSEHOLD)}</MenuItem>
            <MenuItem value={FamilyRelationScope.SIBLINGS}>{intl.formatMessage(messages.scopeSIBLINGS)}</MenuItem>
            <MenuItem value={FamilyRelationScope.FULL_SIBLINGS}>
              {intl.formatMessage(messages.scopeFULL_SIBLINGS)}
            </MenuItem>
          </TextField>
        </Box>
      </Box>

      {isError && <Alert severity="error">{extractNetworkError(error)}</Alert>}

      {!isLoading && !isError && (data?.count ?? 0) === 0 ? (
        <Alert
          severity="info"
          action={
            <Button size="small" color="inherit" component={Link} href={routes.families.review}>
              {intl.formatMessage(messages.goToReview)}
            </Button>
          }
        >
          {intl.formatMessage(messages.noConfirmedFamilies)}
        </Alert>
      ) : (
        <>
          <Typography variant="subtitle2" color="text.secondary">
            {intl.formatMessage(messages.confirmedFamilies, { count: data?.count ?? 0 })}
          </Typography>
          <DataTable<FamilyEntity>
            columns={columns}
            rows={rows}
            getRowId={(row) => row.id}
            isLoading={isLoading}
            rowCount={data?.count ?? 0}
            paginationMode="server"
            paginationModel={{ page: filters.page, pageSize: filters.pageSize }}
            onPaginationModelChange={handlePaginationModelChange}
            pageSizeOptions={[20, 50, 100]}
            getRowHeight={() => 'auto'}
            rowClickUrl={(row) => routes.families.detail(row.id)}
            disableColumnFilter
          />
        </>
      )}
    </Stack>
  );
}
