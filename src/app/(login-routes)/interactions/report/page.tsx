import * as React from 'react';

import { Stack } from '@mui/material';

import { Heading } from '@/domains/interactions/components/Heading';
import { InteractionReport } from '@/domains/interactions/view/report';

export default function InteractionReportPage(): React.JSX.Element {
  return (
    <Stack>
      <Heading />
      <InteractionReport />
    </Stack>
  );
}
