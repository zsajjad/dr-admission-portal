'use client';

import * as React from 'react';

import { Stack } from '@mui/material';

import messages from '@/domains/students/messages';
import { StudentSearch } from '@/domains/students/view/search';

import { PageHeading } from '@/components/PageHeading';

export default function StudentsPage(): React.JSX.Element {
  return (
    <Stack>
      <PageHeading heading={messages.searchTitle} />
      <React.Suspense fallback={null}>
        <StudentSearch />
      </React.Suspense>
    </Stack>
  );
}
