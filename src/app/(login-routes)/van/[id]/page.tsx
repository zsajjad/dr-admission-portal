import * as React from 'react';

import { Stack } from '@mui/material';

import Heading from '@/domains/van/components/heading';
import { VanDetail } from '@/domains/van/view/detail';

export default function VanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);

  return (
    <Stack>
      <Heading headingType="detail" showEditButton />
      <VanDetail vanId={id} />
    </Stack>
  );
}
