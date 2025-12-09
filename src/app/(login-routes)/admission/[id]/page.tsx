import { use } from 'react';

import { Stack } from '@mui/material';

import { Heading } from '@/domains/admission/components/Heading';
import { AdmissionDetail } from '@/domains/admission/view/detail';

export default function AdmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Stack>
      <Heading headingType="detail" showEditButton />
      <AdmissionDetail admissionId={id} />
    </Stack>
  );
}
