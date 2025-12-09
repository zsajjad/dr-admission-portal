import * as React from 'react';

import { Stack } from '@mui/material';

import Heading from '@/domains/branches/components/heading';
import { BranchDetail } from '@/domains/branches/view/detail';

export default function BranchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);

  return (
    <Stack>
      <Heading headingType="detail" showEditButton />
      <BranchDetail branchId={id} />
    </Stack>
  );
}
