import { Chip, Stack } from '@mui/material';

import { StaffRole } from '@/providers/service/app.schemas';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { roleMessage, STAFF_ROLES } from '../utils';

export function RoleChips({ roles, size = 'small' }: { roles: StaffRole[]; size?: 'small' | 'medium' }) {
  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {STAFF_ROLES.filter((r) => roles.includes(r)).map((role) => (
        <Chip key={role} size={size} variant="outlined" label={<FormattedMessage {...roleMessage(role)} />} />
      ))}
    </Stack>
  );
}
