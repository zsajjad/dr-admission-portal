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

import { createInfoColumn, InfoColumnOptions, TooltipRowData } from '@/components/DataTable/InfoTooltipColumn';
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
  showInfoColumn?: boolean;
  infoColumnOptions?: InfoColumnOptions;
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
  showInfoColumn = true,
  infoColumnOptions,
  isLoading,
  showPointer = true,
  filterModel,
  ...rest
}: DataTableProps<T & Partial<TooltipRowData>>) {
  const { light } = colorSchemes;
  const { palette } = light;

  const router = useRouter();

  const finalColumns = useMemo(() => {
    // 🔹 inject default filterOperators
    const colsWithFilters = columns.map((col) => ({
      ...col,
      filterOperators:
        col.filterOperators && col.filterOperators.length > 0
          ? col.filterOperators // use passed ones if defined
          : containsOnly, // otherwise default to contains
    }));

    if (!showInfoColumn) return colsWithFilters;

    const tooltipCheck = (row: T & Partial<TooltipRowData>) =>
      Boolean(
        infoColumnOptions?.tooltipProps?.createdAt ||
          row?.createdAt ||
          infoColumnOptions?.tooltipProps?.createdBy ||
          row?.createdBy?.name ||
          infoColumnOptions?.tooltipProps?.updatedAt ||
          row?.updatedAt ||
          infoColumnOptions?.tooltipProps?.updatedBy ||
          row?.updatedBy?.name ||
          infoColumnOptions?.tooltipProps?.isActive ||
          typeof row?.isActive === 'boolean',
      );

    const shouldAddInfoColumn = rows.some(tooltipCheck);

    return shouldAddInfoColumn ? [...colsWithFilters, createInfoColumn(infoColumnOptions)] : colsWithFilters;
  }, [columns, showInfoColumn, infoColumnOptions, rows]);

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
                    pageSize: 10,
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

// ✅ Will add column (because rows have createdAt)
// <DataTable rows={rows} columns={columns} />

// ❌ Will NOT add column (because rows have no createdAt |createdBy | updatedAt | updatedBy |isActive)
// <DataTable rows={rowsWithoutTooltipKey} columns={columns} />

// ✅ Will add column with custom width + override tooltip data
// <DataTable
//   rows={rows}
//   columns={columns}
//   infoColumnOptions={{
//     width: 70,
//     tooltipProps: { createdBy: 'System', status: false }
//   }}
// />
