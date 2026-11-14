'use client';

import { useMemo } from 'react';

import { useRouter } from 'next/navigation';

import { Box, Card, CardContent, Typography } from '@mui/material';
import {
  DataGrid,
  DataGridProps,
  getGridStringOperators,
  GridColDef,
  GridFilterModel,
  GridRowParams,
  useGridApiContext,
} from '@mui/x-data-grid';

import { NoSsr } from '@/components/NoSSR';
import { KhatamStar } from '@/components/Ornament';

const containsOnly = getGridStringOperators().filter((op) => op.value === 'contains');

/** The empty table: a gold star over the page's own "nothing found" line. */
function NoRows() {
  const apiRef = useGridApiContext();
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.25,
        color: 'var(--mui-palette-brand-gold)',
      }}
    >
      <KhatamStar size={28} />
      <Typography variant="body2" color="text.secondary">
        {apiRef.current.getLocaleText('noRowsLabel')}
      </Typography>
    </Box>
  );
}

/**
 * One look for every list in the portal: a quiet ivory header band, compact rows with a soft hover,
 * faded inactive rows and a slim footer.
 */
const gridSx = {
  border: 0,
  borderRadius: 0,
  background: 'transparent',
  fontSize: '0.875rem',
  '--DataGrid-overlayHeight': '168px',
  '--DataGrid-rowBorderColor': 'var(--mui-palette-stroke)',
  '--DataGrid-t-header-background-base': 'var(--mui-palette-background-default)',
  '--DataGrid-t-color-border-base': 'var(--mui-palette-stroke)',
  '& .MuiDataGrid-columnHeaders, & .MuiDataGrid-columnHeader, & .MuiDataGrid-filler': {
    backgroundColor: 'var(--mui-palette-background-default)',
  },
  '& .MuiDataGrid-columnHeader': {
    borderRight: 'none',
  },
  '& .MuiDataGrid-columnSeparator': {
    display: 'none',
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: 'var(--mui-palette-text-secondary)',
  },
  '& .MuiDataGrid-row:hover': {
    backgroundColor: 'var(--mui-palette-brand-goldSoft)',
  },
  '& .MuiDataGrid-row.inactive-row .MuiDataGrid-cell:not([data-field="actions"])': {
    opacity: 0.55,
  },
  '& .MuiDataGrid-footerContainer': {
    minHeight: 44,
    borderTop: '1px solid var(--mui-palette-stroke)',
  },
  '& .MuiTablePagination-toolbar': {
    minHeight: 44,
  },
  '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
    outline: 'none',
  },
  '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
    outline: 'none',
  },
  // Keep inactive rows normal
  '& .MuiDataGrid-row.inactive-row': {
    cursor: 'default',
  },
} as const;

export interface DataTableProps<T> extends Partial<DataGridProps> {
  rows: T[];
  columns: GridColDef[];
  getRowId?: (row: T) => string | number;
  height?: number | string;
  noDataFound?: string;
  rowClickUrl?: (row: T) => string;
  isLoading?: boolean;
  showPointer?: boolean;
  filterModel?: GridFilterModel;
}

export function DataTable<T>({
  rows,
  columns,
  height,
  noDataFound = 'No Records Found',
  rowClickUrl,
  isLoading,
  showPointer = true,
  filterModel,
  ...rest
}: DataTableProps<T>) {
  const router = useRouter();

  const finalColumns = useMemo(() => {
    return columns.map((col) => ({
      ...col,
      filterOperators: col.filterOperators && col.filterOperators.length > 0 ? col.filterOperators : containsOnly,
    }));
  }, [columns]);

  return (
    <NoSsr>
      <Card>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 }, overflowX: 'auto' }}>
          <Box sx={{ height, width: '100%', minWidth: '900px' }}>
            <DataGrid
              rows={rows}
              columns={finalColumns}
              paginationMode={rest?.rowCount ? 'server' : 'client'}
              filterModel={filterModel}
              getRowClassName={(params) => (params.row.isActive === false ? 'inactive-row' : 'active-row')}
              columnHeaderHeight={44}
              rowHeight={48}
              disableRowSelectionOnClick
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 50,
                    page: 0,
                  },
                },
              }}
              localeText={{
                noRowsLabel: noDataFound,
              }}
              onRowClick={(params: GridRowParams) => {
                if (rowClickUrl && params.row.isActive !== false) {
                  const url = rowClickUrl(params?.row);
                  router.push(url);
                }
              }}
              autoHeight
              hideFooter={isLoading || rows?.length === 0}
              loading={isLoading}
              {...rest}
              slots={{ noRowsOverlay: NoRows, ...rest.slots }}
              sx={[
                gridSx,
                // Cursor only for active rows
                { '& .MuiDataGrid-row.active-row': { cursor: showPointer ? 'pointer' : 'auto' } },
              ]}
            />
          </Box>
        </CardContent>
      </Card>
    </NoSsr>
  );
}
