'use client';

import { use } from 'react';

import { Stack } from '@mui/material';

import { Heading } from '@/domains/admission/components/Heading';
import { AdmissionForm } from '@/domains/admission/view/form';

import { KEYS } from '@/providers/constants/key';
import { useAdmissionsControllerFindOne } from '@/providers/service/admissions/admissions';

export default function AdmissionEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: admission, isLoading } = useAdmissionsControllerFindOne(id, undefined, {
    query: {
      queryKey: [KEYS.ADMISSION_DETAIL, id],
    },
  });

  return (
    <Stack>
      <Heading headingType="edit" />
      {!admission && !isLoading ? null : (
        <AdmissionForm editItem={admission?.data} isLoading={isLoading} isEditMode={true} />
      )}
    </Stack>
  );
}
