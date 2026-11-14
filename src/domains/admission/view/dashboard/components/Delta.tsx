import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { Box } from '@mui/material';

import { formatNumber } from '../format';

export interface DeltaProps {
  current: number | undefined;
  previous: number | undefined;
  /** 'percent': the change as a share of the previous value. 'points': the plain difference. */
  mode?: 'percent' | 'points' | 'count';
  suffix?: React.ReactNode;
}

/** ▲ or ▼ with the size of the change. Shows nothing when there is no previous value to compare. */
export function Delta({ current, previous, mode = 'percent', suffix }: DeltaProps) {
  if (current === undefined || previous === undefined) return null;
  if (mode === 'percent' && previous === 0) return null;
  const diff = current - previous;
  const size =
    mode === 'percent'
      ? `${Math.abs((diff / previous) * 100).toLocaleString('en-US', { maximumFractionDigits: 1 })}%`
      : mode === 'points'
        ? Math.abs(diff).toLocaleString('en-US', { maximumFractionDigits: 1 })
        : formatNumber(Math.abs(diff));
  const color = diff > 0 ? 'success.dark' : diff < 0 ? 'error.dark' : 'text.secondary';

  return (
    <Box
      component="span"
      data-testid="delta"
      sx={{ display: 'inline-flex', alignItems: 'center', color, fontWeight: 600, whiteSpace: 'nowrap' }}
    >
      {diff > 0 && <ArrowDropUpIcon fontSize="small" sx={{ mx: -0.5 }} />}
      {diff < 0 && <ArrowDropDownIcon fontSize="small" sx={{ mx: -0.5 }} />}
      {diff === 0 ? '=' : size}
      {suffix && diff !== 0 ? <>&nbsp;{suffix}</> : null}
    </Box>
  );
}
