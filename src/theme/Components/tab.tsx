import type { Components } from '@mui/material/styles';

import type { Theme } from '../types';

export const MuiTab = {
  styleOverrides: {
    root: ({ theme }) => ({
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: 1.71,
      minHeight: 36,
      minWidth: 120,
      textTransform: 'none',
      borderRadius: theme.shape.borderRadius,
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
      marginLeft: theme.spacing(0.5),
      marginRight: theme.spacing(0.5),

      // default (unselected) state
      border: `1px solid ${theme.palette.grey[400]}`,
      backgroundColor: 'transparent',
      color: theme.palette.text.primary,

      // selected state
      '&.Mui-selected': {
        border: 'none',
        backgroundColor: theme.palette.primary.main,
        color: `${theme.palette.common.white} !important`,
      },

      // disabled state
      '&.Mui-disabled': {
        opacity: 0.5,
        pointerEvents: 'none',
      },
    }),
  },
} satisfies Components<Theme>['MuiTab'];
