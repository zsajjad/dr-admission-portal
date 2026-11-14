'use client';

import { use } from 'react';

import { Stack } from '@mui/material';

import messages from '@/domains/students/messages';
import { StudentProfileView } from '@/domains/students/view/profile';

import { PageHeading } from '@/components/PageHeading';

export default function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Stack>
      <PageHeading heading={messages.profileTitle} />
      <StudentProfileView studentId={id} />
    </Stack>
  );
}
