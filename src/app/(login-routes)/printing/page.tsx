import * as React from 'react';

import { Stack } from '@mui/material';

import { Heading } from '@/domains/printing/components/Heading';
import { PrintingView } from '@/domains/printing/view';

export default function PrintingPage(): React.JSX.Element {
  return (
    <Stack>
      <Heading />
      <PrintingView />
    </Stack>
  );
}
