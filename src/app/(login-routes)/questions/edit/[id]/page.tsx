'use client';
import * as React from 'react';

import { Stack } from '@mui/material';

import Heading from '@/domains/questions/components/heading';
import QuestionSetForm from '@/domains/questions/view/form';

import { KEYS } from '@/providers/constants/key';
import { useQuestionSetControllerFindOne } from '@/providers/service/question-set/question-set';

export default function QuestionSetEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data: questionSet, isLoading } = useQuestionSetControllerFindOne(id, {
    includeInActive: true,
  });

  return (
    <Stack>
      <Heading headingType="edit" />
      <QuestionSetForm editItem={questionSet?.data} isLoading={isLoading} isEditMode />
    </Stack>
  );
}
