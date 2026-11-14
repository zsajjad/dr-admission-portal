import { Typography } from '@mui/material';

import { StudentProfileAdmission } from '@/providers/service/app.schemas';

import { FormattedMessage } from '@/theme/FormattedMessage';

import messages from '../messages';

import { SectionCard } from './SectionCard';

interface AdmissionResultsSlotProps {
  admission: StudentProfileAdmission;
}

/**
 * SLOT: this session's result (theory, ablution and prayer steps, attendance; total, rank,
 * pass / fail / terminated) and where each part came from.
 *
 * Results are being added to core in parallel. When `StudentProfileAdmission`
 * gains a `results` field, render it here.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function AdmissionResultsSlot({ admission }: AdmissionResultsSlotProps) {
  return (
    <SectionCard title={<FormattedMessage {...messages.resultsSlotTitle} />} placeholder>
      <Typography variant="body2" color="text.secondary">
        <FormattedMessage {...messages.resultsSlotEmpty} />
      </Typography>
    </SectionCard>
  );
}
