import type { Components } from '@mui/material/styles';

import type { Theme } from '../types';

export const MuiTextField = {
  defaultProps: {
    slotProps: {
      inputLabel: {
        shrink: true, // force label to shrink for all TextFields
      },
    },
  },
} satisfies Components<Theme>['MuiTextField'];
