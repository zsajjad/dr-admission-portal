import { Chip } from '@mui/material';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { ClosureReason, EnrollmentState } from '../api/operations';
import messages from '../messages';

const COLOR: Record<EnrollmentState, 'default' | 'info' | 'primary' | 'warning' | 'success'> = {
  REGISTERED: 'default',
  IN_TRAINING: 'info',
  READY_FOR_TEST: 'warning',
  TESTED: 'primary',
  CLOSED: 'success',
};

/** An enrollment's state; a closed one shows why it closed */
export function StateChip({ state, closureReason }: { state: EnrollmentState; closureReason?: ClosureReason | null }) {
  const label = state === 'CLOSED' && closureReason ? messages[closureReason] : messages[state];
  const color = state === 'CLOSED' && closureReason && closureReason !== 'PASSED' ? 'default' : COLOR[state];
  return (
    <Chip
      size="small"
      color={color}
      variant={state === 'CLOSED' ? 'outlined' : 'filled'}
      label={<FormattedMessage {...label} />}
    />
  );
}
