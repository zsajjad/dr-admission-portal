import * as React from 'react';

import { Stack } from '@mui/material';

import Heading from '@/domains/branches/components/heading';
import BranchesListing from '@/domains/branches/view/listing';

export default function BranchesPage() {
  return (
    <Stack>
      <Heading showAddButton headingType="list" showIncludeInActive />
      <BranchesListing />
    </Stack>
  );
}
