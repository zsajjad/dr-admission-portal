import { Chip } from '@mui/material';

import { RoleName } from '@/providers/service/app.schemas';

import { FormattedMessage } from '@/theme/FormattedMessage';

import messages from '../messages';

const roleColor: Record<RoleName, 'primary' | 'default' | 'secondary'> = {
  SUPER_ADMIN: 'primary',
  ADMIN: 'default',
  TEACHER: 'secondary',
};

export function RoleChip({ role }: { role: RoleName }) {
  return (
    <Chip
      size="small"
      variant={role === RoleName.SUPER_ADMIN ? 'filled' : 'outlined'}
      color={roleColor[role] ?? 'default'}
      label={<FormattedMessage {...messages[`role${role}`]} />}
    />
  );
}
