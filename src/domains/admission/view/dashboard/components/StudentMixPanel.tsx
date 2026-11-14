import { Box, Stack, Typography } from '@mui/material';

import { SessionDashboardStudentMix } from '@/providers/service/app.schemas';

import FormattedMessage from '@/theme/FormattedMessage';

import { SERIES_COLORS, NUMERIC } from '../constants';
import { formatNumber, formatPercent, share } from '../format';
import messages from '../messages';

import { Panel } from './Panel';

export interface StudentMixPanelProps {
  mix?: SessionDashboardStudentMix;
  isLoading?: boolean;
}

/** New against returning applicants, as one split bar with the numbers beside it. */
export function StudentMixPanel({ mix, isLoading }: StudentMixPanelProps) {
  const returning = mix?.returningStudents ?? 0;
  const fresh = mix?.newStudents ?? 0;
  const total = returning + fresh;
  const parts = [
    { key: 'returning', label: messages.mixReturning, count: returning, color: SERIES_COLORS.returning },
    { key: 'new', label: messages.mixNew, count: fresh, color: SERIES_COLORS.newStudents },
  ];

  return (
    <Panel title={<FormattedMessage {...messages.mixTitle} />} isLoading={isLoading} loadingHeight={110}>
      <Stack spacing={1.5} data-testid="student-mix">
        <Stack direction="row" spacing={3}>
          {parts.map((part) => (
            <Box key={part.key} data-testid={`mix-${part.key}`}>
              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: part.color }} />
                <Typography variant="body2" color="text.secondary">
                  <FormattedMessage {...part.label} />
                </Typography>
              </Stack>
              <Typography variant="h6" component="div" fontWeight={700} sx={NUMERIC}>
                {formatNumber(part.count)}
                <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400, fontSize: 14, ml: 1 }}>
                  {formatPercent(share(part.count, total))}
                </Box>
              </Typography>
            </Box>
          ))}
        </Stack>
        <Stack direction="row" spacing="2px" sx={{ height: 12 }}>
          {total === 0 ? (
            <Box sx={{ flex: 1, bgcolor: 'grey.200', borderRadius: 1 }} />
          ) : (
            parts
              .filter((part) => part.count > 0)
              .map((part) => <Box key={part.key} sx={{ flex: part.count, bgcolor: part.color, borderRadius: 1 }} />)
          )}
        </Stack>
        <Typography variant="caption" color="text.secondary">
          <FormattedMessage {...messages.mixNote} />
        </Typography>
      </Stack>
    </Panel>
  );
}
