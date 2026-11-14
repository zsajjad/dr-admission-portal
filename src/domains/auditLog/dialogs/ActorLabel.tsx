import { Chip, Stack, Typography } from '@mui/material';

import { AuditActorType, AuditLogEntry } from '@/providers/service/app.schemas';

import { FormattedMessage } from '@/theme/FormattedMessage';

import messages from '../messages';

const actorColor: Record<AuditActorType, 'primary' | 'secondary' | 'default'> = {
  ADMIN: 'primary',
  STAFF: 'secondary',
  SYSTEM: 'default',
};

/** The admin, staff user (with their card ID) or system that made an entry. */
export function ActorLabel({ entry }: { entry: AuditLogEntry }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
      <Chip
        size="small"
        variant="outlined"
        color={actorColor[entry.actorType]}
        label={<FormattedMessage {...messages[`actor${entry.actorType}`]} />}
      />
      {entry.actorType !== AuditActorType.SYSTEM && (
        <Typography variant="body2" noWrap>
          {entry.actorName ?? <FormattedMessage {...messages.unknownActor} />}
          {entry.actorStaffId && (
            <Typography component="span" variant="caption" color="text.secondary">
              {' · '}
              <FormattedMessage {...messages.staffCard} values={{ id: entry.actorStaffId }} />
            </Typography>
          )}
        </Typography>
      )}
    </Stack>
  );
}
