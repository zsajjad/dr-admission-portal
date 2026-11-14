import { Typography } from '@mui/material';

import { StudentProfileAdmission } from '@/providers/service/app.schemas';

import { FormattedMessage } from '@/theme/FormattedMessage';

import messages from '../messages';

import { SectionCard } from './SectionCard';

interface AdmissionSectionSlotProps {
  admission: StudentProfileAdmission;
}

/**
 * SLOT: the student's section for this admission (letter, class teacher, moves).
 *
 * Sections are being added to core in parallel. When `StudentProfileAdmission`
 * gains a `section` field, render it here and add a "Change section" action;
 * nothing else in the profile needs to change.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function AdmissionSectionSlot({ admission }: AdmissionSectionSlotProps) {
  return (
    <SectionCard title={<FormattedMessage {...messages.sectionSlotTitle} />} placeholder>
      <Typography variant="body2" color="text.secondary">
        <FormattedMessage {...messages.sectionSlotEmpty} />
      </Typography>
    </SectionCard>
  );
}
