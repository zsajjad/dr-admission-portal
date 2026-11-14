'use client';

import { Stack } from '@mui/material';

import messages from '@/domains/results/passMarksMessages';
import { TheoryPassMarks } from '@/domains/results/view/TheoryPassMarks';

import { PageHeading } from '@/components/PageHeading';

export default function TheoryPassMarksPage() {
  return (
    <Stack>
      <PageHeading heading={messages.title} />
      <TheoryPassMarks />
    </Stack>
  );
}
