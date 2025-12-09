import * as React from 'react';

import { Stack } from '@mui/material';

import Heading from '@/domains/questions/components/heading';
import { QuestionSetDetail } from '@/domains/questions/view/detail';

export default function QuestionSetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);

  return (
    <Stack>
      <Heading headingType="detail" showEditButton />
      <QuestionSetDetail questionSetId={id} />
    </Stack>
  );
}
