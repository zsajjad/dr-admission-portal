import * as React from 'react';

import { Stack } from '@mui/material';

import Heading from '@/domains/branches/components/heading';
import BranchForm from '@/domains/branches/view/form';

export default function BranchCreatePage() {
  return (
    <Stack>
      <Heading headingType="create" />
      <BranchForm />
    </Stack>
  );
}
