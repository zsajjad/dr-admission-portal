import * as React from 'react';

import { Stack } from '@mui/material';

import Heading from '@/domains/questions/components/heading';
import QuestionsListing from '@/domains/questions/view/listing';

export default function QuestionsPage() {
  return (
    <Stack>
      <Heading showAddButton headingType="list" showIncludeInActive />
      <QuestionsListing />
    </Stack>
  );
}
