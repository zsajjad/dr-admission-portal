import { Stack } from '@mui/material';

import { Heading } from '@/domains/admission/components/Heading';
import { FromLegacyAdmission } from '@/domains/admission/view/from-legacy';

export default function AdmissionFromLegacyPage() {
  return (
    <Stack>
      <Heading headingType="fromLegacy" />
      <FromLegacyAdmission />
    </Stack>
  );
}
