import * as React from 'react';

import { Box } from '@mui/material';

export interface IDetailTooltipWrapperProps {
  children: React.ReactNode;
}

export function DetailTooltipWrapper({ children }: IDetailTooltipWrapperProps) {
  return <Box sx={{ position: 'absolute', display: 'flex', alignItems: 'center', gap: 2, right: 12 }}>{children}</Box>;
}
