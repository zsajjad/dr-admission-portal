import { Box, Stack, Typography } from '@mui/material';

import { SessionDashboardFunnelCounts } from '@/providers/service/app.schemas';

import FormattedMessage from '@/theme/FormattedMessage';

import { SERIES_COLORS, NUMERIC } from '../constants';
import { formatNumber, formatPercent, share } from '../format';
import messages from '../messages';

import { Panel } from './Panel';

const STEPS = [
  { key: 'applied', label: messages.stepApplied },
  { key: 'verified', label: messages.stepVerified },
  { key: 'feePaid', label: messages.stepFeePaid },
  { key: 'finalized', label: messages.stepFinalized },
  { key: 'placed', label: messages.stepPlaced },
  { key: 'interviewed', label: messages.stepInterviewed },
] as const;

export interface FunnelPanelProps {
  current?: SessionDashboardFunnelCounts;
  previousFinal?: SessionDashboardFunnelCounts;
  compareName?: string;
  rejected?: number;
  isLoading?: boolean;
}

/** The steps from application to class: how many reached each, and how many fell away before it. */
export function FunnelPanel({ current, previousFinal, compareName, rejected, isLoading }: FunnelPanelProps) {
  const applied = current?.applied ?? 0;

  return (
    <Panel
      title={<FormattedMessage {...messages.funnelTitle} />}
      subtitle={<FormattedMessage {...messages.funnelSubtitle} />}
      isLoading={isLoading}
      loadingHeight={340}
    >
      <Stack spacing={1.5} data-testid="funnel">
        {STEPS.map((step, index) => {
          const count = current?.[step.key] ?? 0;
          const above = index > 0 ? (current?.[STEPS[index - 1].key] ?? 0) : undefined;
          const drop = above !== undefined && above > count ? above - count : undefined;
          return (
            <Box key={step.key} data-testid={`funnel-${step.key}`}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Typography variant="body2" fontWeight={500}>
                  <FormattedMessage {...step.label} />
                </Typography>
                <Typography variant="body2" sx={NUMERIC}>
                  <Box component="span" sx={{ fontWeight: 700 }}>
                    {formatNumber(count)}
                  </Box>
                  {index > 0 && (
                    <Box component="span" sx={{ color: 'text.secondary', ml: 1 }}>
                      {formatPercent(share(count, applied))}
                    </Box>
                  )}
                </Typography>
              </Stack>
              <Box sx={{ height: 10, borderRadius: 1, bgcolor: 'grey.200', overflow: 'hidden', my: 0.5 }}>
                <Box
                  sx={{
                    height: '100%',
                    width: `${applied > 0 ? Math.min((count / applied) * 100, 100) : 0}%`,
                    bgcolor: SERIES_COLORS.current,
                    borderRadius: 1,
                  }}
                />
              </Box>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  {drop !== undefined && (
                    <FormattedMessage {...messages.dropOff} values={{ count: formatNumber(drop) }} />
                  )}
                </Typography>
                {previousFinal && compareName && (
                  <Typography variant="caption" color="text.secondary" sx={NUMERIC}>
                    <FormattedMessage {...messages.lastSessionFinal} values={{ compare: compareName }} />
                    {': '}
                    {formatNumber(previousFinal[step.key])}
                  </Typography>
                )}
              </Stack>
            </Box>
          );
        })}
        {rejected ? (
          <Typography variant="caption" color="text.secondary">
            <FormattedMessage {...messages.rejectedNote} values={{ count: formatNumber(rejected) }} />
          </Typography>
        ) : null}
      </Stack>
    </Panel>
  );
}
