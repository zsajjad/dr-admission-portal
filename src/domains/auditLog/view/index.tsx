'use client';

import { useMemo, useState } from 'react';

import { useIntl } from 'react-intl';

import { FactCheck as VerifyIcon } from '@mui/icons-material';
import {
  Alert,
  Autocomplete,
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
import { GridColDef } from '@mui/x-data-grid';

import { cardStyle, formatDateTime } from '@/domains/students/utils';

import { DataTable } from '@/components/DataTable';
import { PageHeading } from '@/components/PageHeading';

import {
  AuditActorType,
  AuditLogActorFacet,
  AuditLogEntry,
  VerifyAuditLogResponseDto,
} from '@/providers/service/app.schemas';
import {
  auditLogControllerVerify,
  useAuditLogControllerFacets,
  useAuditLogControllerFindAll,
} from '@/providers/service/audit-log/audit-log';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import { useListingFilters } from '@/hooks/useListingFilters';
import { usePermissions } from '@/hooks/usePermissions';

import { extractNetworkError } from '@/utils/extractNetworkError';

import { ActorLabel } from '../dialogs/ActorLabel';
import { EntryDialog } from '../dialogs/EntryDialog';
import messages from '../messages';

interface AuditFilters {
  actor?: string; // "ADMIN:<id>" or "STAFF:<id>"
  entityType?: string;
  entityId?: string;
  action?: string;
  from?: string; // YYYY-MM-DD
  to?: string;
}

const dayStart = (d?: string) => (d ? new Date(`${d}T00:00:00`).toISOString() : undefined);
const dayEnd = (d?: string) => (d ? new Date(`${d}T23:59:59.999`).toISOString() : undefined);

/** Read-only audit log with filters, the entry detail, and (for super admins) the hash-chain check. */
export function AuditLogView() {
  const intl = useIntl();
  const { isSuperAdmin } = usePermissions();
  const { filters, setFilter, resetFilters } = useListingFilters<AuditFilters>();
  const [open, setOpen] = useState<AuditLogEntry | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState<VerifyAuditLogResponseDto | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const page = Number(filters.page ?? 0);
  const pageSize = Number(filters.pageSize ?? 50);
  const [actorType, actorId] = (filters.actor ?? '').split(':');

  const { data: facets } = useAuditLogControllerFacets({ query: { staleTime: 60 * 1000 } });
  const { data, isLoading, isError, error } = useAuditLogControllerFindAll({
    skip: page * pageSize,
    take: pageSize,
    sortOrder: 'desc',
    entityType: filters.entityType || undefined,
    entityId: filters.entityId || undefined,
    action: filters.action || undefined,
    adminUserId: actorType === AuditActorType.ADMIN ? actorId : undefined,
    staffUserId: actorType === AuditActorType.STAFF ? actorId : undefined,
    from: dayStart(filters.from),
    to: dayEnd(filters.to),
  });

  const actors = facets?.data.actors || [];
  const selectedActor = actors.find((a) => `${a.actorType}:${a.id}` === filters.actor) ?? null;
  const set = (patch: Partial<Record<keyof AuditFilters, string | undefined>>) => setFilter({ ...patch, page: 0 });

  const text = {
    seq: useFormattedMessage(messages.colSeq),
    when: useFormattedMessage(messages.colWhen),
    who: useFormattedMessage(messages.colWho),
    action: useFormattedMessage(messages.colAction),
    record: useFormattedMessage(messages.colRecord),
    reason: useFormattedMessage(messages.colReason),
    noRows: useFormattedMessage(messages.noRows),
  };

  const columns: GridColDef<AuditLogEntry>[] = useMemo(
    () => [
      { field: 'seq', headerName: text.seq, width: 80, sortable: false },
      {
        field: 'createdAt',
        headerName: text.when,
        width: 170,
        sortable: false,
        valueGetter: (_, row) => formatDateTime(row.createdAt),
      },
      {
        field: 'actor',
        headerName: text.who,
        flex: 1,
        minWidth: 220,
        sortable: false,
        renderCell: ({ row }) => <ActorLabel entry={row} />,
      },
      {
        field: 'action',
        headerName: text.action,
        flex: 1,
        minWidth: 200,
        sortable: false,
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {row.action}
          </Typography>
        ),
      },
      {
        field: 'entity',
        headerName: text.record,
        flex: 1,
        minWidth: 200,
        sortable: false,
        renderCell: ({ row }) => (
          <Tooltip title={row.entityId}>
            <Typography variant="body2" noWrap>
              {row.entityType}{' '}
              <Box component="span" sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: 12 }}>
                {row.entityId.slice(0, 8)}
              </Box>
            </Typography>
          </Tooltip>
        ),
      },
      {
        field: 'reason',
        headerName: text.reason,
        flex: 1.4,
        minWidth: 220,
        sortable: false,
        valueGetter: (_, row) => row.reason ?? '',
      },
    ],
    [text.seq, text.when, text.who, text.action, text.record, text.reason],
  );

  const verify = async () => {
    setVerifying(true);
    setVerified(null);
    setVerifyError(null);
    try {
      setVerified(await auditLogControllerVerify());
    } catch (e) {
      setVerifyError(extractNetworkError(e) || intl.formatMessage(messages.verifyFailed));
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Stack>
      <PageHeading
        heading={messages.title}
        rightActions={
          isSuperAdmin ? (
            <Tooltip title={intl.formatMessage(messages.verifyHint)}>
              <span>
                <Button
                  variant="outlined"
                  startIcon={verifying ? <CircularProgress size={16} /> : <VerifyIcon />}
                  onClick={verify}
                  disabled={verifying}
                >
                  <FormattedMessage {...(verifying ? messages.verifying : messages.verify)} />
                </Button>
              </span>
            </Tooltip>
          ) : undefined
        }
      />
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        <FormattedMessage {...messages.intro} />
      </Typography>

      {verified && (
        <Alert severity={verified.ok ? 'success' : 'error'} sx={{ mb: 2 }} onClose={() => setVerified(null)}>
          {verified.ok ? (
            <FormattedMessage {...messages.verifyOk} values={{ count: String(verified.checked) }} />
          ) : (
            <FormattedMessage
              {...messages.verifyBad}
              values={{
                seq: String(verified.firstBadSeq ?? '?'),
                count: String(verified.checked),
                problem: verified.problem ?? '',
              }}
            />
          )}
        </Alert>
      )}
      {verifyError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setVerifyError(null)}>
          {verifyError}
        </Alert>
      )}

      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={2}
        alignItems={{ lg: 'center' }}
        flexWrap="wrap"
        useFlexGap
        sx={{ ...cardStyle, bgcolor: 'background.paper', px: 2, py: 1.5, mb: 2 }}
      >
        <Autocomplete<AuditLogActorFacet, false>
          size="small"
          sx={{ minWidth: 240 }}
          options={actors}
          value={selectedActor}
          groupBy={(o) => intl.formatMessage(messages[`actor${o.actorType}`])}
          getOptionLabel={(o) => (o.staffId ? `${o.name} · ${o.staffId}` : o.name)}
          isOptionEqualToValue={(a, b) => a.id === b.id && a.actorType === b.actorType}
          onChange={(_, v) => set({ actor: v ? `${v.actorType}:${v.id}` : undefined })}
          renderInput={(params) => <TextField {...params} label={<FormattedMessage {...messages.actor} />} />}
        />
        <TextField
          select
          size="small"
          sx={{ minWidth: 200 }}
          label={<FormattedMessage {...messages.entityType} />}
          value={filters.entityType ?? ''}
          onChange={(e) => set({ entityType: e.target.value || undefined })}
        >
          <MenuItem value="">
            <FormattedMessage {...messages.any} />
          </MenuItem>
          {(facets?.data.entityTypes || []).map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          sx={{ minWidth: 200 }}
          label={<FormattedMessage {...messages.entityId} />}
          value={filters.entityId ?? ''}
          onChange={(e) => set({ entityId: e.target.value.trim() || undefined })}
        />
        <Autocomplete<string, false>
          size="small"
          sx={{ minWidth: 240 }}
          options={facets?.data.actions || []}
          value={filters.action ?? null}
          onChange={(_, v) => set({ action: v ?? undefined })}
          renderOption={(props, o) => (
            <li {...props} key={o} style={{ fontFamily: 'monospace' }}>
              {o}
            </li>
          )}
          renderInput={(params) => <TextField {...params} label={<FormattedMessage {...messages.action} />} />}
        />
        <TextField
          size="small"
          type="date"
          label={<FormattedMessage {...messages.from} />}
          value={filters.from ?? ''}
          onChange={(e) => set({ from: e.target.value || undefined })}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          size="small"
          type="date"
          label={<FormattedMessage {...messages.to} />}
          value={filters.to ?? ''}
          onChange={(e) => set({ to: e.target.value || undefined })}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        {(filters.actor || filters.entityType || filters.entityId || filters.action || filters.from || filters.to) && (
          <Chip label={<FormattedMessage {...messages.clear} />} onDelete={resetFilters} onClick={resetFilters} />
        )}
      </Stack>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {extractNetworkError(error) || <FormattedMessage {...messages.loadFailed} />}
        </Alert>
      )}

      <DataTable<AuditLogEntry>
        columns={columns}
        rows={data?.data || []}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        rowCount={data?.count ?? 0}
        paginationMode="server"
        paginationModel={{ page, pageSize }}
        onPaginationModelChange={(m) => setFilter({ page: m.page, pageSize: m.pageSize })}
        pageSizeOptions={[50, 100]}
        onRowClick={(params) => setOpen(params.row as AuditLogEntry)}
        noDataFound={text.noRows}
        disableColumnFilter
        showPointer
      />

      <EntryDialog entry={open} onClose={() => setOpen(null)} />
    </Stack>
  );
}
