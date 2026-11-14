'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { Search as SearchIcon } from '@mui/icons-material';
import { Alert, Box, Button, Chip, Stack, TextField, Typography } from '@mui/material';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

import { DataTable } from '@/components/DataTable';

import { KEYS } from '@/providers/constants/key';
import { StudentListItem } from '@/providers/service/app.schemas';
import { useStudentsControllerFindAll } from '@/providers/service/students/students';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import { routes } from '@/router/routes';

import { extractNetworkError } from '@/utils/extractNetworkError';

import messages from '../../messages';
import { admissionStatusColor, admissionStatusMessage, cardStyle, GR_NUMBER_PATTERN } from '../../utils';

/** GR search: find a student by GR number, name, father name or phone, then open the profile */
export function StudentSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [input, setInput] = useState(query);
  const [pagination, setPagination] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });

  useEffect(() => setInput(query), [query]);

  const columnsText = {
    grNumber: useFormattedMessage(messages.grNumber),
    name: useFormattedMessage(messages.name),
    fatherName: useFormattedMessage(messages.fatherName),
    phone: useFormattedMessage(messages.phone),
    branch: useFormattedMessage(messages.branchArea),
    latest: useFormattedMessage(messages.latestAdmissionColumn),
    admissions: useFormattedMessage(messages.admissionsColumn),
    noRows: useFormattedMessage(messages.noStudentsFound),
  };

  const enabled = query.trim().length >= 2;
  const { data, isLoading, isError, error } = useStudentsControllerFindAll(
    { search: query.trim(), skip: pagination.page * pagination.pageSize, take: pagination.pageSize },
    { query: { queryKey: [KEYS.STUDENT_LISTING, query, pagination], enabled } },
  );

  // A full GR number with a single exact match goes straight to the profile
  useEffect(() => {
    const q = query.trim();
    if (!GR_NUMBER_PATTERN.test(q) || data?.count !== 1) return;
    const [only] = data.data;
    if (only?.grNumber === q) router.replace(routes.students.profile(only.id));
  }, [data, query, router]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPagination((p) => ({ ...p, page: 0 }));
    const q = input.trim();
    router.replace(q ? `${routes.students.listing}?q=${encodeURIComponent(q)}` : routes.students.listing);
  };

  const columns: GridColDef<StudentListItem>[] = useMemo(
    () => [
      {
        field: 'grNumber',
        headerName: columnsText.grNumber,
        width: 190,
        sortable: false,
        renderCell: ({ row }) => <span style={{ fontFamily: 'monospace' }}>{row.grNumber}</span>,
      },
      { field: 'name', headerName: columnsText.name, flex: 1, minWidth: 150, sortable: false },
      { field: 'fatherName', headerName: columnsText.fatherName, flex: 1, minWidth: 150, sortable: false },
      { field: 'phone', headerName: columnsText.phone, width: 140, sortable: false },
      {
        field: 'branch',
        headerName: columnsText.branch,
        width: 160,
        sortable: false,
        valueGetter: (_, row) => [row.branch?.code, row.area?.name].filter(Boolean).join(' · '),
      },
      {
        field: 'latestAdmission',
        headerName: columnsText.latest,
        minWidth: 340,
        flex: 1,
        sortable: false,
        renderCell: ({ row }) =>
          row.latestAdmission ? (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%' }}>
              <Typography variant="body2">
                {row.latestAdmission.sessionName} · {row.latestAdmission.classLevelName}
              </Typography>
              <Chip
                size="small"
                color={admissionStatusColor(row.latestAdmission.status)}
                label={<FormattedMessage {...admissionStatusMessage(row.latestAdmission.status)} />}
              />
            </Stack>
          ) : (
            '--'
          ),
      },
      { field: 'admissionCount', headerName: columnsText.admissions, width: 100, sortable: false },
    ],
    [
      columnsText.grNumber,
      columnsText.name,
      columnsText.fatherName,
      columnsText.phone,
      columnsText.branch,
      columnsText.latest,
      columnsText.admissions,
    ],
  );

  return (
    <Stack spacing={2.5}>
      <Box component="form" onSubmit={handleSubmit} sx={{ ...cardStyle, bgcolor: 'background.paper', p: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <TextField
            autoFocus
            size="small"
            fullWidth
            label={<FormattedMessage {...messages.searchLabel} />}
            helperText={<FormattedMessage {...messages.searchHint} />}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button type="submit" variant="contained" startIcon={<SearchIcon />} sx={{ minWidth: 120 }}>
            <FormattedMessage {...messages.searchButton} />
          </Button>
        </Stack>
      </Box>

      {isError && (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {extractNetworkError(error)}
        </Alert>
      )}

      {enabled && (
        <DataTable<StudentListItem>
          getRowId={(row) => row.id}
          rows={data?.data || []}
          columns={columns}
          isLoading={isLoading}
          pagination
          paginationMode="server"
          rowCount={data?.count ?? 0}
          paginationModel={pagination}
          onPaginationModelChange={setPagination}
          pageSizeOptions={[20, 50, 100]}
          noDataFound={columnsText.noRows}
          rowClickUrl={(row) => routes.students.profile(row.id)}
        />
      )}
    </Stack>
  );
}
