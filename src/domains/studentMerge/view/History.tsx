'use client';

import { useMemo, useState } from 'react';

import { useIntl } from 'react-intl';

import Link from 'next/link';

import { Undo as UndoIcon } from '@mui/icons-material';
import { Button, Chip, FormControlLabel, Stack, Switch, TextField, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';

import { cardStyle, formatDateTime } from '@/domains/students/utils';

import { DataTable } from '@/components/DataTable';

import { StudentMergeEntity } from '@/providers/service/app.schemas';
import { useStudentMergeControllerFindAll } from '@/providers/service/student-merge/student-merge';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import { routes } from '@/router/routes';

import { UndoDialog } from '../dialogs/UndoDialog';
import messages from '../messages';

/** Every merge, link and backfill, newest first, each with Undo while it can still be undone. */
export function MergeHistory() {
  const intl = useIntl();
  const [gr, setGr] = useState('');
  const [includeUndone, setIncludeUndone] = useState(true);
  const [pagination, setPagination] = useState({ page: 0, pageSize: 50 });
  const [undoing, setUndoing] = useState<StudentMergeEntity | null>(null);

  const { data, isLoading } = useStudentMergeControllerFindAll({
    gr: gr.trim() || undefined,
    includeUndone,
    sortOrder: 'desc',
    skip: pagination.page * pagination.pageSize,
    take: pagination.pageSize,
  });

  const text = {
    when: useFormattedMessage(messages.colWhen),
    kind: useFormattedMessage(messages.colKind),
    kept: useFormattedMessage(messages.colKept),
    merged: useFormattedMessage(messages.colMerged),
    reason: useFormattedMessage(messages.colReason),
    by: useFormattedMessage(messages.colBy),
    none: useFormattedMessage(messages.noHistory),
  };

  const columns: GridColDef<StudentMergeEntity>[] = useMemo(
    () => [
      {
        field: 'createdAt',
        headerName: text.when,
        width: 160,
        sortable: false,
        valueGetter: (_, r) => formatDateTime(r.createdAt),
      },
      {
        field: 'kind',
        headerName: text.kind,
        width: 170,
        sortable: false,
        renderCell: ({ row }) => (
          <Chip size="small" variant="outlined" label={<FormattedMessage {...messages[`kind${row.kind}`]} />} />
        ),
      },
      {
        field: 'survivorGrNumber',
        headerName: text.kept,
        width: 190,
        sortable: false,
        renderCell: ({ row }) => (
          <Link href={routes.students.profile(row.survivorStudentId)} style={{ fontFamily: 'monospace' }}>
            {row.survivorGrNumber}
          </Link>
        ),
      },
      {
        field: 'mergedGrNumbers',
        headerName: text.merged,
        width: 200,
        sortable: false,
        renderCell: ({ row }) => (
          <span style={{ fontFamily: 'monospace' }}>{row.mergedGrNumbers.join(', ') || '—'}</span>
        ),
      },
      { field: 'reason', headerName: text.reason, flex: 1, minWidth: 200, sortable: false },
      {
        field: 'createdBy',
        headerName: text.by,
        width: 150,
        sortable: false,
        valueGetter: (_, r) => r.createdBy?.name ?? '',
      },
      {
        field: 'undo',
        headerName: '',
        width: 230,
        sortable: false,
        renderCell: ({ row }) =>
          row.undoneAt ? (
            <Typography variant="caption" color="text.secondary">
              {intl.formatMessage(messages.undone, {
                name: row.undoneBy?.name ?? '?',
                date: formatDateTime(row.undoneAt),
              })}
            </Typography>
          ) : (
            <Button size="small" color="warning" startIcon={<UndoIcon />} onClick={() => setUndoing(row)}>
              <FormattedMessage {...messages.undo} />
            </Button>
          ),
      },
    ],
    [text.when, text.kind, text.kept, text.merged, text.reason, text.by, intl],
  );

  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{ ...cardStyle, bgcolor: 'background.paper', px: 2, py: 1.5 }}
      >
        <TextField
          size="small"
          sx={{ minWidth: 260 }}
          label={<FormattedMessage {...messages.historyGr} />}
          value={gr}
          onChange={(e) => {
            setGr(e.target.value);
            setPagination((p) => ({ ...p, page: 0 }));
          }}
        />
        <FormControlLabel
          control={<Switch size="small" checked={includeUndone} onChange={(e) => setIncludeUndone(e.target.checked)} />}
          label={
            <Typography variant="body2">
              <FormattedMessage {...messages.includeUndone} />
            </Typography>
          }
        />
      </Stack>
      <DataTable<StudentMergeEntity>
        columns={columns}
        rows={data?.data || []}
        getRowId={(r) => r.id}
        isLoading={isLoading}
        rowCount={data?.count ?? 0}
        paginationMode="server"
        paginationModel={pagination}
        onPaginationModelChange={setPagination}
        pageSizeOptions={[50, 100]}
        noDataFound={text.none}
        disableColumnFilter
        disableRowSelectionOnClick
      />
      <UndoDialog merge={undoing} onClose={() => setUndoing(null)} />
    </Stack>
  );
}
