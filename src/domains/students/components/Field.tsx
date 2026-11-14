import { ReactNode } from 'react';

import { Box, Typography } from '@mui/material';

import { getSafeValue } from '@/utils';

interface FieldProps {
  label: ReactNode;
  value?: ReactNode;
  /** Secondary line under the value, e.g. who and when */
  caption?: ReactNode;
  dir?: 'ltr' | 'rtl' | 'auto';
}

/** A label above a value, used across the profile */
export function Field({ label, value, caption, dir }: FieldProps) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
        {label}
      </Typography>
      <Typography variant="body2" component="div" dir={dir} sx={{ overflowWrap: 'anywhere', fontWeight: 500 }}>
        {typeof value === 'string' || value === undefined || value === null ? getSafeValue(value) : value}
      </Typography>
      {caption && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {caption}
        </Typography>
      )}
    </Box>
  );
}
