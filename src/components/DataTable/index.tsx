'use client';

import { useMemo } from 'react';

import { useRouter } from 'next/navigation';

import { Box, Card, CardContent } from '@mui/material';
import {
  DataGrid,
  DataGridProps,
  getGridStringOperators,
  GridColDef,
  GridFilterModel,
  GridRowParams,
} from '@mui/x-data-grid';

import { NoSsr } from '@/components/NoSSR';

import { colorSchemes } from '@/theme/color-schemes';

const containsOnly = getGridStringOperators().filter((op) => op.value === 'contains');

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
  const { light } = colorSchemes;
  const { palette } = light;

  const router = useRouter();

  const finalColumns = useMemo(() => {
    return columns.map((col) => ({
      ...col,
      filterOperators:
        col.filterOperators && col.filterOperators.length > 0
          ? col.filterOperators
          : containsOnly,
    }));
  }, [columns]);

  return (
    <NoSsr>
      <Card>
        <CardContent sx={{ p: 0, overflowX: 'auto', borderRadius: '20px' }}>
          <Box sx={{ height, width: '100%', minWidth: '900px' }}>
            <DataGrid
              rows={rows}
              columns={finalColumns}
              paginationMode={rest?.rowCount ? 'server' : 'client'}
              filterModel={filterModel}
              getRowClassName={(params) => (params.row.isActive === false ? 'inactive-row' : 'active-row')}
              sx={{
                p: 1,
                borderWidth: 0,
                '& .MuiCardContent-root:last-child': {
                  paddingBottom: 0,
                },
                '& .MuiDataGrid-columnHeaders': {
                  borderBottom: `2px solid ${palette.stroke}`,
                  mb: 1,
                },
                '& .MuiDataGrid-columnHeader': {
                  borderRight: 'none',
                },
                '& .MuiDataGrid-columnSeparator': {
                  display: 'none',
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontSize: '16px',
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: `2px solid ${palette.stroke} !important`,
                },
                '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                  outline: 'none',
                },
                '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
                  outline: 'none',
                },

                // Cursor only for active rows
                '& .MuiDataGrid-row.active-row': {
                  cursor: showPointer ? 'pointer' : 'auto',
                },

                // Keep inactive rows normal
                '& .MuiDataGrid-row.inactive-row': {
                  cursor: 'default',
                },

                background: 'transparent',
                padding: 0,
              }}
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
            />
          </Box>
        </CardContent>
      </Card>
    </NoSsr>
  );
}
