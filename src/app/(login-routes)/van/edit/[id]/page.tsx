'use client';
import * as React from 'react';

import { Stack } from '@mui/material';

import Heading from '@/domains/van/components/heading';
import VanForm from '@/domains/van/view/form';

import { useVanControllerFindOne } from '@/providers/service/van/van';

export default function VanEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data: van, isLoading } = useVanControllerFindOne(id, {
    includeInActive: true,
  });
  return (
    <Stack>
      <Heading headingType="edit" />
      <VanForm editItem={van?.data} isLoading={isLoading} isEditMode />
    </Stack>
  );
}
