import { GridColDef } from '@mui/x-data-grid';

import InfoTooltip from './Tooltip';

export interface TooltipRowData {
  createdAt?: string;
  createdBy?: { name?: string };
  updatedAt?: string;
  updatedBy?: { name?: string };
  isActive?: boolean;
}
export interface InfoColumnOptions {
  width?: number;
  tooltipProps?: TooltipRowData;
}

export const createInfoColumn = (options?: InfoColumnOptions): GridColDef => {
  return {
    field: 'info',
    headerName: '',
    renderCell: (params) => (
      <InfoTooltip
        createdAt={options?.tooltipProps?.createdAt ?? params.row.createdAt}
        createdBy={options?.tooltipProps?.createdBy ?? params.row.createdBy?.name}
        updatedAt={options?.tooltipProps?.updatedAt ?? params.row.updatedAt}
        updatedBy={options?.tooltipProps?.updatedBy ?? params.row.updatedBy?.name}
        isActive={options?.tooltipProps?.isActive ?? params.row.isActive}
      />
    ),
    width: options?.width ?? 20,
    sortable: false,
    filterable: false,
    align: 'center',
  };
};
