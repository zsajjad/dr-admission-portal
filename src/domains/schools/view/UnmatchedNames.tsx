'use client';

import { useMemo, useState } from 'react';

import { useIntl } from 'react-intl';

import LinkIcon from '@mui/icons-material/Link';
import { Alert, Box, Button, Stack, Tooltip, Typography } from '@mui/material';
import { GridColDef, GridPaginationModel, GridRowSelectionModel } from '@mui/x-data-grid';

import { DataTable } from '@/components/DataTable';
import { SessionFilter } from '@/components/SessionFilter';

import { UnmatchedSchoolName } from '@/providers/service/app.schemas';
import { useSchoolControllerUnmatchedNames } from '@/providers/service/school/school';

import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { useListingFilters } from '@/hooks/useListingFilters';

import { extractNetworkError } from '@/utils/extractNetworkError';

import { cardStyle } from '../components/common';
import { CreateSchoolDialog, LinkAdmissionsDialog, LinkNamesDialog } from '../components/dialogs';
import messages from '../messages';

/** The most names the API returns */
const TAKE = 1000;

const EMPTY_SELECTION: GridRowSelectionModel = { type: 'include', ids: new Set() };

export function UnmatchedNames() {
  const intl = useIntl();
  const { isAuthenticated: enabled } = useAuthenticatedApi();
  const { filters } = useListingFilters<{ sessionId?: string }>();
  const sessionId = filters.sessionId || undefined;

  const [pagination, setPagination] = useState<GridPaginationModel>({ page: 0, pageSize: 50 });
  const [selection, setSelection] = useState<GridRowSelectionModel>(EMPTY_SELECTION);
  const [linking, setLinking] = useState<UnmatchedSchoolName[] | null>(null);
  const [creating, setCreating] = useState<UnmatchedSchoolName | null>(null);
  const [linkingAll, setLinkingAll] = useState(false);

  const { data, isLoading, isError, error } = useSchoolControllerUnmatchedNames(
    { sessionId, take: TAKE },
    { query: { enabled } },
  );
  const rows = useMemo(() => data?.data ?? [], [data]);
  const total = data?.count ?? 0;
  const selected = rows.filter((r) => selection.ids.has(r.name));
  const clearSelection = () => setSelection(EMPTY_SELECTION);

  const columns: GridColDef<UnmatchedSchoolName>[] = useMemo(
    () => [
      {
        field: 'name',
        headerName: intl.formatMessage(messages.typedName),
        flex: 1,
        minWidth: 260,
        sortable: false,
        renderCell: ({ row }) => (
          <Stack sx={{ py: 0.75, lineHeight: 1.2, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {row.name}
            </Typography>
            {row.spellings.length > 0 && (
              <Tooltip title={row.spellings.join(' · ')} placement="bottom-start" disableInteractive>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {row.spellings.join(' · ')}
                </Typography>
              </Tooltip>
            )}
          </Stack>
        ),
      },
      {
        field: 'count',
        headerName: intl.formatMessage(messages.admissions),
        width: 120,
        align: 'right',
        headerAlign: 'right',
        sortable: false,
        renderCell: ({ row }) => <span dir="ltr">{intl.formatNumber(row.count)}</span>,
      },
      {
        field: 'actions',
        headerName: '',
        width: 260,
        sortable: false,
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%' }}>
            <Button size="small" variant="outlined" onClick={() => setLinking([row])}>
              {intl.formatMessage(messages.linkToSchool)}
            </Button>
            <Button size="small" onClick={() => setCreating(row)}>
              {intl.formatMessage(messages.newSchool)}
            </Button>
          </Stack>
        ),
      },
    ],
    [intl],
  );

  return (
    <Stack spacing={2.5}>
      <Typography variant="body2" color="text.secondary">
        {intl.formatMessage(messages.unmatchedHelp)}
      </Typography>

      <Box sx={cardStyle}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <SessionFilter />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {intl.formatMessage(messages.unmatchedCount, { count: total })}
            {total > rows.length && (
              <Typography component="span" variant="body2" color="text.secondary">
                {' · '}
                {intl.formatMessage(messages.unmatchedShowing, { shown: rows.length })}
              </Typography>
            )}
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Button variant="outlined" startIcon={<LinkIcon />} onClick={() => setLinkingAll(true)}>
            {intl.formatMessage(messages.linkAll)}
          </Button>
        </Stack>
      </Box>

      {selected.length > 0 && (
        <Box sx={{ ...cardStyle, py: 1.5, bgcolor: 'var(--mui-palette-brand-goldSoft)' }}>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {intl.formatMessage(messages.namesSelected, { count: selected.length })}
            </Typography>
            <Button size="small" variant="contained" onClick={() => setLinking(selected)}>
              {intl.formatMessage(messages.linkSelected)}
            </Button>
            <Box sx={{ flex: 1 }} />
            <Button size="small" onClick={clearSelection}>
              {intl.formatMessage(messages.clearSelection)}
            </Button>
          </Stack>
        </Box>
      )}

      {isError && <Alert severity="error">{extractNetworkError(error)}</Alert>}

      <DataTable<UnmatchedSchoolName>
        columns={columns}
        rows={rows}
        getRowId={(row) => row.name}
        isLoading={isLoading}
        paginationModel={pagination}
        onPaginationModelChange={setPagination}
        pageSizeOptions={[20, 50, 100]}
        checkboxSelection
        disableRowSelectionOnClick
        rowSelectionModel={selection}
        onRowSelectionModelChange={setSelection}
        showPointer={false}
        noDataFound={intl.formatMessage(messages.noUnmatched)}
        disableColumnFilter
        disableColumnMenu
      />

      <LinkNamesDialog names={linking} onClose={() => setLinking(null)} onLinked={clearSelection} />
      <CreateSchoolDialog open={!!creating} from={creating} onClose={() => setCreating(null)} />
      <LinkAdmissionsDialog open={linkingAll} sessionId={sessionId} onClose={() => setLinkingAll(false)} />
    </Stack>
  );
}
