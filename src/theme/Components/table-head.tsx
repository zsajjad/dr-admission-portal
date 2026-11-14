import type { Components } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';

import type { Theme } from '../types';

export const MuiTableHead = {
  styleOverrides: {
    root: {
      [`& .${tableCellClasses.root}`]: {
        // The same quiet band as the data grids (components/DataTable).
        backgroundColor: 'var(--mui-palette-background-default)',
        color: 'var(--mui-palette-text-secondary)',
        fontSize: '0.8125rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
    },
  },
} satisfies Components<Theme>['MuiTableHead'];
