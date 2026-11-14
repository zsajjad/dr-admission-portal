'use client';

import { Typography } from '@mui/material';

import { useStudentMergeControllerResolve } from '@/providers/service/student-merge/student-merge';

import { FormattedMessage } from '@/theme/FormattedMessage';

import messages from '../messages';

/** The old GRs (aliases) that still find a student, from GET /admin/students/resolve. */
export function useOldGrs(grNumber?: string) {
  const { data } = useStudentMergeControllerResolve(
    { gr: grNumber ?? '' },
    { query: { enabled: !!grNumber, staleTime: 60 * 1000, retry: false } },
  );
  return (data?.data.aliases || []).map((a) => a.grNumber);
}

/** "Old GRs: …" under a student, when they have any. */
export function OldGrs({ grNumber }: { grNumber: string }) {
  const list = useOldGrs(grNumber);
  if (!list.length) return null;
  return (
    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
      <FormattedMessage {...messages.oldGrs} values={{ list: list.join(', ') }} />
    </Typography>
  );
}
