import * as React from 'react';

import { Stack } from '@mui/material';

import { Heading } from '@/domains/admission/components/Heading';
import { AdmissionListing } from '@/domains/admission/view/listing';

export default function AdmissionPage(): React.JSX.Element {
  return (
    <Stack>
      <Heading showAddButton headingType="list" showIncludeInActive />
      <AdmissionListing />
    </Stack>
  );
}
