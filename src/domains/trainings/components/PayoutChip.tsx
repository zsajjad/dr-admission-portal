import { Chip } from '@mui/material';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { PayoutStatus } from '../api/operations';
import messages from '../messages';

const COLOR: Record<PayoutStatus, 'default' | 'warning' | 'info' | 'success'> = {
  PENDING: 'default',
  PAYABLE: 'warning',
  APPROVED: 'info',
  PAID: 'success',
};

/** An enrollment's payout status: pending while open, then payable, approved, paid */
export function PayoutChip({ status }: { status: PayoutStatus }) {
  return (
    <Chip size="small" variant="outlined" color={COLOR[status]} label={<FormattedMessage {...messages[status]} />} />
  );
}
