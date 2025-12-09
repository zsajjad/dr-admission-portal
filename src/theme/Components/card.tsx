import type { Components } from '@mui/material/styles';

import type { Theme } from '../types';

export const MuiCard = {
  styleOverrides: {
    root: ({}) => {
      return {
        borderRadius: '20px',
      };
    },
  },
} satisfies Components<Theme>['MuiCard'];
