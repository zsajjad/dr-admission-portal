import { Chip } from '@mui/material';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { LedgerKind } from '../api/ledger';
import { LedgerStatus } from '../api/operations';
import messages from '../messages';

const STATUS_COLOR: Record<LedgerStatus, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  PAYABLE: 'warning',
  APPROVED: 'info',
  PART_PAID: 'info',
  PAID: 'success',
  CANCELLED: 'default',
  RECORDED: 'success',
  VOIDED: 'default',
};

export function LedgerStatusChip({ status }: { status: LedgerStatus }) {
  return (
    <Chip
      size="small"
      color={STATUS_COLOR[status]}
      variant={status === 'CANCELLED' || status === 'VOIDED' ? 'outlined' : 'filled'}
      label={<FormattedMessage {...messages[status]} />}
    />
  );
}

export function LedgerKindLabel({ kind }: { kind: LedgerKind }) {
  return <FormattedMessage {...messages[kind]} />;
}
