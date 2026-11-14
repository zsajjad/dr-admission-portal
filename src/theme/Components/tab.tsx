import type { Components } from '@mui/material/styles';

import type { Theme } from '../types';

/**
 * Tabs are plain text on the page with a gold line under the open one.
 * Buttons stay for actions, so a tab never looks like something that saves or sends.
 */
export const MuiTab = {
  styleOverrides: {
    root: ({ theme }) => ({
      fontSize: '0.9375rem',
      fontWeight: 500,
      lineHeight: 1.5,
      minHeight: 44,
      minWidth: 0,
      textTransform: 'none',
      padding: theme.spacing(1.25, 2),
      color: 'var(--mui-palette-text-secondary)',
      transition: 'color 120ms ease',

      '&:hover': {
        color: 'var(--mui-palette-text-primary)',
      },

      '&.Mui-selected': {
        color: 'var(--mui-palette-primary-main)',
        fontWeight: 600,
      },

      '&.Mui-disabled': {
        opacity: 0.5,
        pointerEvents: 'none',
      },
    }),
  },
} satisfies Components<Theme>['MuiTab'];

export const MuiTabs = {
  styleOverrides: {
    root: { minHeight: 44 },
    indicator: {
      height: 3,
      borderRadius: '3px 3px 0 0',
      backgroundColor: 'var(--mui-palette-brand-gold)',
    },
  },
} satisfies Components<Theme>['MuiTabs'];
