'use client';

import { Stack, Typography } from '@mui/material';

import { FormattedMessage } from '@/theme/FormattedMessage';

import messages from './messages';

export function Heading() {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
      <Typography variant="h4">
        <FormattedMessage {...messages.pageTitle} />
      </Typography>
    </Stack>
  );
}
