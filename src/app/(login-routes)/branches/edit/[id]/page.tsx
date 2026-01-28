'use client';
import * as React from 'react';

import { Stack } from '@mui/material';

import Heading from '@/domains/branches/components/heading';
import BranchForm from '@/domains/branches/view/form';

import { useBranchControllerFindOne } from '@/providers/service/branch/branch';

export default function BranchEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data: branch, isLoading } = useBranchControllerFindOne(id, {
    includeInActive: true,
  });
  return (
    <Stack>
      <Heading headingType="edit" />
      <BranchForm editItem={branch?.data} isLoading={isLoading} isEditMode />
    </Stack>
  );
}
