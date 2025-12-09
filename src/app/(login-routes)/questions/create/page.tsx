import * as React from 'react';

import { Stack } from '@mui/material';

import Heading from '@/domains/questions/components/heading';
import QuestionSetForm from '@/domains/questions/view/form';

export default function QuestionSetCreatePage() {
  return (
    <Stack>
      <Heading headingType="create" />
      <QuestionSetForm />
    </Stack>
  );
}
