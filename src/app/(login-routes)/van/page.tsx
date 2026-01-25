import * as React from 'react';

import { Stack } from '@mui/material';

import Heading from '@/domains/van/components/heading';
import VanListing from '@/domains/van/view/listing';

export default function VanPage() {
  return (
    <Stack>
      <Heading showAddButton headingType="list" showIncludeInActive showFilters />
      <VanListing />
    </Stack>
  );
}
