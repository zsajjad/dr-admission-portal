import { Stack } from '@mui/material';

import { Heading } from '@/domains/admission/components/Heading';
import { AdmissionForm } from '@/domains/admission/view/form';

export default function AdmissionCreatePage() {
  return (
    <Stack>
      <Heading headingType="create" />
      <AdmissionForm />
    </Stack>
  );
}
