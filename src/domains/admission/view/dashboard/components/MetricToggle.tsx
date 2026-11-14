'use client';

import { ToggleButton, ToggleButtonGroup } from '@mui/material';

import FormattedMessage from '@/theme/FormattedMessage';

import { DASHBOARD_METRICS, DashboardMetric } from '../constants';
import messages from '../messages';

const LABELS = {
  applied: messages.applications,
  feePaid: messages.feePaid,
  finalized: messages.finalized,
};

export interface MetricToggleProps {
  value: DashboardMetric;
  onChange: (metric: DashboardMetric) => void;
  testId?: string;
}

/** Applications, fee paid or finalized. */
export function MetricToggle({ value, onChange, testId }: MetricToggleProps) {
  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={value}
      data-testid={testId}
      onChange={(_, next: DashboardMetric | null) => next && onChange(next)}
    >
      {DASHBOARD_METRICS.map((metric) => (
        <ToggleButton key={metric} value={metric} sx={{ textTransform: 'none', px: 1.5, whiteSpace: 'nowrap' }}>
          <FormattedMessage {...LABELS[metric]} />
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
