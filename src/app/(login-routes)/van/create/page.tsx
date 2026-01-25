import * as React from 'react';

import { Stack } from '@mui/material';

import Heading from '@/domains/van/components/heading';
import VanForm from '@/domains/van/view/form';

export default function VanCreatePage() {
  return (
    <Stack>
      <Heading headingType="create" />
      <VanForm />
    </Stack>
  );
}
